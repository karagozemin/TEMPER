// Deterministic local evaluator used ONLY for the offline demo. It encodes the
// exact Maya-vs-Chris logic from the PRD so the golden path runs reliably with
// zero network calls. It is always surfaced to the UI as "deterministic-demo",
// never as a real Minds verdict.

import type {
  CommunityContext,
  EvidencePacket,
  Incident,
  IncidentOutcome,
  MindDecision,
} from "@/lib/types";
import { getDemoContext } from "@/lib/demo/dataset";
import type { HistoryEntry, TemperMind } from "@/lib/minds/client";

const INSUFFICIENT_CONTEXT: MindDecision = {
  verdict: "observe",
  confidence: 0,
  reason: "Insufficient historical context to decide confidently.",
  action: "none",
  followUpMinutes: null,
};

/**
 * Pure function mapping (pattern, history) → verdict. Mirrors integration
 * tests A, B and C from PRD section 40.
 */
export function evaluateDeterministic(
  evidence: EvidencePacket,
  context: CommunityContext | null,
): MindDecision {
  if (!context) {
    return INSUFFICIENT_CONTEXT;
  }

  const { tenureDays } = context.member;
  const exchanges = context.previousExchangesWithSources;
  const banter = context.reciprocalBanterCases;

  // Test A — newcomer dogpile.
  if (
    tenureDays <= 7 &&
    exchanges <= 2 &&
    banter === 0 &&
    !context.priorDisengagementAfterSimilar
  ) {
    return {
      verdict: "dogpile",
      confidence: 0.91,
      reason:
        `The target is a ${tenureDays}-day-old member with no established ` +
        `relationship history with the ${evidence.pattern.uniqueSources} ` +
        `converging members.`,
      action: "gentle_group_redirect",
      followUpMinutes: 180,
    };
  }

  // Test B — established reciprocal banter.
  if (
    tenureDays >= 30 &&
    exchanges >= 10 &&
    banter >= 1 &&
    !context.priorDisengagementAfterSimilar
  ) {
    return {
      verdict: "banter",
      confidence: 0.94,
      reason:
        `The target and source members have ${context.comparableFriendlyPrecedents} ` +
        `comparable reciprocal exchanges over ${Math.round(tenureDays / 30)} months ` +
        `with no prior disengagement.`,
      action: "none",
      followUpMinutes: null,
    };
  }

  // Test C — anything else is insufficient context.
  return INSUFFICIENT_CONTEXT;
}

export class DeterministicTemperMind implements TemperMind {
  readonly source = "deterministic-demo" as const;

  async evaluate(evidence: EvidencePacket): Promise<MindDecision> {
    const context = getDemoContext(evidence.community, evidence.target.name);
    return evaluateDeterministic(evidence, context);
  }

  async rememberOutcome(
    _incident: Incident,
    _outcome: IncidentOutcome,
  ): Promise<void> {
    // Demo mode keeps precedent in the seeded dataset; no external write.
  }

  async getHistory(): Promise<HistoryEntry[]> {
    return [
      {
        fingerprint: "demo-maya-context",
        sender: "human",
        text: "Seed: Maya joined 2 days ago with no prior interaction history.",
      },
      {
        fingerprint: "demo-chris-context",
        sender: "human",
        text: "Seed: Chris has 8 months and 47 reciprocal exchanges with the cluster.",
      },
    ];
  }
}
