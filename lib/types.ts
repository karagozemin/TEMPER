// Shared domain types for TEMPER.
// These mirror the PRD data model (section 15) and decision contract (section 19).

export interface Member {
  id: string;
  telegramUserId: string;
  username?: string;
  firstSeenAt: string; // ISO timestamp
  lastSeenAt: string;
  messageCount: number;
}

export type InteractionType = "reply" | "mention";

export interface Interaction {
  id: string;
  sourceMemberId: string;
  targetMemberId: string;
  messageId: string;
  timestamp: string; // ISO timestamp
  type: InteractionType;
  text?: string;
}

export interface ConvergenceSignal {
  targetMemberId: string;
  sourceMemberIds: string[];
  uniqueSourceCount: number;
  windowSeconds: number;
  recentInteractionCount: number;
  detectedAt: string;
}

export type IncidentStatus =
  | "open"
  | "observing"
  | "recovered"
  | "escalating"
  | "dismissed";

export type Verdict = "dogpile" | "banter" | "observe";

export type InterventionType = "gentle_group_redirect";

export interface Incident {
  id: string;
  targetMemberId: string;
  sourceMemberIds: string[];
  status: IncidentStatus;
  verdict: Verdict;
  confidence?: number;
  detectedAt: string;
  interventionType?: InterventionType;
  interventionAt?: string;
  followUpAt?: string;
  resolvedAt?: string;
  mindReasoningSummary?: string;
}

export type IncidentOutcomeKind = "successful" | "neutral" | "failed";

export interface IncidentOutcome {
  incidentId: string;
  targetReengaged: boolean;
  repeatConvergenceDetected: boolean;
  escalationDetected: boolean;
  outcome: IncidentOutcomeKind;
  evaluatedAt: string;
}

// ── Minds decision contract ─────────────────────────────────────

export type MindAction = "gentle_group_redirect" | "none";

export interface MindDecision {
  verdict: Verdict;
  confidence: number;
  reason: string;
  action: MindAction;
  followUpMinutes: number | null;
}

export interface EvidencePacket {
  event: "convergence_detected";
  community: string;
  target: {
    name: string;
    tenureDays: number;
  };
  pattern: {
    uniqueSources: number;
    windowSeconds: number;
    interactionCount: number;
  };
  sourceMembers: string[];
  messages: string[];
}

// Historical context retrieved from persistent memory (Minds in production,
// the seeded demo dataset locally). This is what changes the verdict.
export interface CommunityContext {
  member: {
    name: string;
    tenureDays: number;
  };
  previousExchangesWithSources: number;
  reciprocalBanterCases: number;
  comparableFriendlyPrecedents: number;
  priorDisengagementAfterSimilar: boolean;
}
