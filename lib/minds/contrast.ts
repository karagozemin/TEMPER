// Live Maya/Chris contrast on real Minds (PRD Phase 4, section 29–30).
// Seeds TWO separate aliases with different persistent context, then submits
// the IDENTICAL evidence to both and returns the two verdicts. This is the
// "same words, same pattern, different history → different decision" proof.

import {
  createMindsClient,
  MindsApiError,
  type MindsClient,
} from "@animocabrands/minds-client-lib";
import { buildEvidencePacket } from "@/lib/demo/dataset";
import { parseMindDecision } from "@/lib/minds/schema";
import { buildEvidencePrompt } from "@/lib/minds/prompts";
import type { MindDecision } from "@/lib/types";

export interface ContrastResult {
  name: string;
  alias: string;
  verdict: MindDecision["verdict"] | null;
  confidence: number | null;
  action: MindDecision["action"] | null;
  reason: string | null;
  error: string | null;
}

const CONTEXT_MESSAGES: Record<"maya" | "chris", string> = {
  maya:
    "Persistent memory seed (do not reply to this message): a member named Maya " +
    "joined this community 2 days ago. She has no prior interaction with the " +
    "regular members Alex, John, Sam, Mike and Ben, and no established " +
    "reciprocal banter history with them.",
  chris:
    "Persistent memory seed (do not reply to this message): a member named Chris " +
    "has been in this community for 8 months. He has 47 prior exchanges with the " +
    "regular members Alex, John, Sam, Mike and Ben, including 3 comparable " +
    "reciprocal banter exchanges that never caused disengagement.",
};

function extractDecision(text: string): MindDecision | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return parseMindDecision(JSON.parse(text.slice(start, end + 1)));
  } catch {
    return null;
  }
}

export async function runLiveContrast(
  client: MindsClient,
  mindId: string,
): Promise<ContrastResult[]> {
  const results: ContrastResult[] = [];

  for (const key of ["maya", "chris"] as const) {
    const name = key === "maya" ? "Maya" : "Chris";
    const alias = `temper-${key}`;
    const tenureDays = key === "maya" ? 2 : 243;
    const evidence = buildEvidencePacket(name, tenureDays);

    const result: ContrastResult = {
      name,
      alias,
      verdict: null,
      confidence: null,
      action: null,
      reason: null,
      error: null,
    };

    try {
      await client.ensureConversation(alias, mindId);
      await client.sendMessage({
        alias,
        messageText: CONTEXT_MESSAGES[key],
      });

      const before = await client.getLatestHistoryFingerprint(alias);

      await client.sendMessage({
        alias,
        messageText: buildEvidencePrompt(evidence),
      });

      const reply = await client.waitForReply({
        alias,
        timeoutMs: 180_000,
        afterFingerprint: before,
      });

      if (reply.timedOut) {
        result.error = "timed out";
      } else {
        const decision = extractDecision(reply.reply.messageText ?? "");
        if (!decision) {
          result.error = "invalid decision payload";
        } else {
          result.verdict = decision.verdict;
          result.confidence = decision.confidence;
          result.action = decision.action;
          result.reason = decision.reason;
        }
      }
    } catch (error) {
      result.error =
        error instanceof MindsApiError
          ? `${error.status} ${error.code}: ${error.message}`
          : error instanceof Error
            ? error.message
            : String(error);
    }

    results.push(result);
  }

  return results;
}
