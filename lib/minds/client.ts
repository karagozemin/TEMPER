// Official Minds client integration (PRD section 14).
//
// TEMPER talks to Minds through @animocabrands/minds-client-lib, which connects
// to the Builder API automatically — no endpoint URL is hard-coded or
// constructed here. Authentication uses MINDS_BUILDER_API_KEY; TEMPER_MIND_ID
// selects the Mind; a stable alias keeps all incidents in ONE persistent
// conversation (the same-alias → same-Mind → persistent-history proof).

import type { MessageRecord, MindsClient } from "@animocabrands/minds-client-lib";
import type {
  EvidencePacket,
  Incident,
  IncidentOutcome,
  MindDecision,
} from "@/lib/types";
import { parseMindDecision } from "@/lib/minds/schema";
import { buildEvidencePrompt, buildOutcomePrompt } from "@/lib/minds/prompts";
import { DeterministicTemperMind } from "@/lib/minds/deterministic";

export type MindSource = "minds" | "deterministic-demo" | "unavailable";

export interface HistoryEntry {
  fingerprint: string;
  sender: "human" | "mind";
  text: string;
  at?: string;
}

export interface TemperMind {
  readonly source: MindSource;
  evaluate(evidence: EvidencePacket): Promise<MindDecision>;
  rememberOutcome(incident: Incident, outcome: IncidentOutcome): Promise<void>;
  getHistory(limit?: number): Promise<HistoryEntry[]>;
}

export class MindsUnavailableError extends Error {
  constructor(message = "Context analysis unavailable") {
    super(message);
    this.name = "MindsUnavailableError";
  }
}

export const MINDS_BUILDER_API_KEY_ENV = "MINDS_BUILDER_API_KEY";
export const DEFAULT_ALIAS = "temper-demo-community";
const REPLY_TIMEOUT_MS = 180_000;

// The SDK is ESM-only, so its runtime is imported lazily. This keeps this
// module loadable from CommonJS tooling too (e.g. `tsx` scripts).
function isMindsApiError(
  error: unknown,
): error is { status: number; code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error
  );
}

/**
 * Real Minds integration. `ensureConversation` is idempotent, so the same
 * alias always resolves to the same persistent conversation.
 */
export class MindsTemperMind implements TemperMind {
  readonly source: MindSource = "minds";

  private client: MindsClient | null = null;
  private readonly builderApiKey: string;
  private readonly mindId: string;
  private readonly alias: string;

  constructor(options: {
    builderApiKey: string;
    mindId: string;
    alias?: string;
  }) {
    this.builderApiKey = options.builderApiKey;
    this.mindId = options.mindId;
    this.alias = options.alias ?? DEFAULT_ALIAS;
  }

  private async getClient(): Promise<MindsClient> {
    if (!this.client) {
      const { createMindsClient } = await import(
        "@animocabrands/minds-client-lib"
      );
      this.client = createMindsClient({ builderApiKey: this.builderApiKey });
    }
    return this.client;
  }

  async evaluate(evidence: EvidencePacket): Promise<MindDecision> {
    try {
      const client = await this.getClient();
      await client.ensureConversation(this.alias, this.mindId);

      const before = await client.getLatestHistoryFingerprint(this.alias);

      await client.sendMessage({
        alias: this.alias,
        messageText: buildEvidencePrompt(evidence),
      });

      const outcome = await client.waitForReply({
        alias: this.alias,
        timeoutMs: REPLY_TIMEOUT_MS,
        afterFingerprint: before,
      });

      if (outcome.timedOut) {
        throw new MindsUnavailableError("Minds did not reply within the timeout window");
      }

      return this.parseDecision(outcome.reply);
    } catch (error) {
      if (error instanceof MindsUnavailableError) throw error;
      if (isMindsApiError(error)) {
        throw new MindsUnavailableError(
          `Minds request failed (${error.status} ${error.code}): ${error.message}`,
        );
      }
      throw error;
    }
  }

  async rememberOutcome(
    incident: Incident,
    outcome: IncidentOutcome,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      await client.ensureConversation(this.alias, this.mindId);
      await client.sendMessage({
        alias: this.alias,
        messageText: buildOutcomePrompt(incident, outcome),
      });
    } catch (error) {
      // Outcome memory must never block the incident state transition.
      if (isMindsApiError(error)) return;
      throw error;
    }
  }

  /** Persistence proof: same alias → same Mind → same conversation history. */
  async getHistory(limit = 50): Promise<HistoryEntry[]> {
    const client = await this.getClient();
    const rows = await client.getHistory(this.alias, { limit });
    return rows.map((row) => this.toHistoryEntry(row));
  }

  private parseDecision(reply: MessageRecord): MindDecision {
    const text = (reply.messageText ?? "").trim();

    // Minds may wrap the JSON in <pre> tags, markdown fences, or stray prose.
    // Extract the first balanced JSON object instead of assuming a clean body.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new MindsUnavailableError("Minds returned an invalid decision payload");
    }

    try {
      return parseMindDecision(JSON.parse(text.slice(start, end + 1)));
    } catch {
      throw new MindsUnavailableError("Minds returned an invalid decision payload");
    }
  }

  private toHistoryEntry(row: MessageRecord): HistoryEntry {
    return {
      fingerprint: row.fingerprint,
      sender: row.senderType === 1 ? "human" : "mind",
      text: row.messageText ?? "",
      at: row.createdAt,
    };
  }
}

/**
 * Safe default. No intervention is ever taken from an unavailable Mind.
 */
export class UnavailableTemperMind implements TemperMind {
  readonly source: MindSource = "unavailable";

  async evaluate(): Promise<MindDecision> {
    return {
      verdict: "observe",
      confidence: 0,
      reason: "Context analysis unavailable",
      action: "none",
      followUpMinutes: null,
    };
  }

  async rememberOutcome(): Promise<void> {
    // Nothing to persist without a Mind connection.
  }

  async getHistory(): Promise<HistoryEntry[]> {
    return [];
  }
}

export function getTemperMind(): TemperMind {
  const demoMode = process.env.DEMO_MODE === "true";
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY;
  const mindId = process.env.TEMPER_MIND_ID ?? DEFAULT_ALIAS;
  const alias = process.env.DEMO_COMMUNITY_ID ?? DEFAULT_ALIAS;

  // Real Minds flow — used for the submission (DEMO_MODE=false + key set).
  if (!demoMode && builderApiKey) {
    return new MindsTemperMind({ builderApiKey, mindId, alias });
  }

  // Offline deterministic evaluator for local demos.
  if (demoMode) {
    return new DeterministicTemperMind();
  }

  return new UnavailableTemperMind();
}
