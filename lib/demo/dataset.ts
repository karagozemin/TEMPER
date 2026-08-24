// Canonical seeded demo dataset (PRD section 29). This is the controlled
// environment used for the Maya / Chris contrast and the golden path. It is
// explicitly a DEMO dataset — any aggregate numbers are seeded demo history,
// never fabricated production metrics.

import type {
  CommunityContext,
  EvidencePacket,
  Incident,
  IncidentOutcome,
  MindDecision,
} from "@/lib/types";

export const DEMO_COMMUNITY_ID = "temper-demo-community";

export const DEMO_SOURCES = ["Alex", "John", "Sam", "Mike", "Ben"];

export const DEMO_MESSAGES = [
  "interesting take lol",
  "bro really thought he cooked",
  "💀",
  "welcome to the server 😂",
  "maybe read first next time",
];

// ── Persistent history (the thing that changes the verdict) ──────

export const MAYA_CONTEXT: CommunityContext = {
  member: { name: "Maya", tenureDays: 2 },
  previousExchangesWithSources: 0,
  reciprocalBanterCases: 0,
  comparableFriendlyPrecedents: 0,
  priorDisengagementAfterSimilar: false,
};

export const CHRIS_CONTEXT: CommunityContext = {
  member: { name: "Chris", tenureDays: 243 }, // ~8 months
  previousExchangesWithSources: 47,
  reciprocalBanterCases: 3,
  comparableFriendlyPrecedents: 3,
  priorDisengagementAfterSimilar: false,
};

const CONTEXTS: Record<string, CommunityContext> = {
  maya: MAYA_CONTEXT,
  chris: CHRIS_CONTEXT,
};

export function getDemoContext(
  community: string,
  memberName: string,
): CommunityContext | null {
  if (community !== DEMO_COMMUNITY_ID) return null;
  return CONTEXTS[memberName.trim().toLowerCase()] ?? null;
}

export function buildEvidencePacket(
  name: string,
  tenureDays: number,
  windowSeconds = 93,
): EvidencePacket {
  return {
    event: "convergence_detected",
    community: DEMO_COMMUNITY_ID,
    target: { name, tenureDays },
    pattern: {
      uniqueSources: DEMO_SOURCES.length,
      windowSeconds,
      interactionCount: DEMO_MESSAGES.length,
    },
    sourceMembers: DEMO_SOURCES,
    messages: DEMO_MESSAGES,
  };
}

export const MAYA_EVIDENCE = buildEvidencePacket("Maya", MAYA_CONTEXT.member.tenureDays);
export const CHRIS_EVIDENCE = buildEvidencePacket("Chris", CHRIS_CONTEXT.member.tenureDays);

// ── Canonical decisions (must match evaluateDeterministic) ───────

export const MAYA_DECISION: MindDecision = {
  verdict: "dogpile",
  confidence: 0.91,
  reason:
    "The target is a two-day-old member with no established relationship " +
    "history with the five converging members.",
  action: "gentle_group_redirect",
  followUpMinutes: 180,
};

export const CHRIS_DECISION: MindDecision = {
  verdict: "banter",
  confidence: 0.94,
  reason:
    "The target and source members have eight months of reciprocal " +
    "interaction history with multiple comparable exchanges.",
  action: "none",
  followUpMinutes: null,
};

// ── Legacy moderation feed (all SAFE) ────────────────────────────

export interface LegacyFeedRow {
  author: string;
  text: string;
  verdict: "SAFE";
}

export const LEGACY_FEED: LegacyFeedRow[] = DEMO_SOURCES.map((author, index) => ({
  author,
  text: DEMO_MESSAGES[index],
  verdict: "SAFE",
}));

// ── Incident #014 (Maya, recovered) ──────────────────────────────

const HOUR = 60 * 60 * 1000;
const now = Date.now();

export const INCIDENT_014: Incident = {
  id: "INC-014",
  targetMemberId: "maya",
  sourceMemberIds: DEMO_SOURCES,
  status: "recovered",
  verdict: "dogpile",
  confidence: 0.91,
  detectedAt: new Date(now - 6 * HOUR).toISOString(),
  interventionType: "gentle_group_redirect",
  interventionAt: new Date(now - 5 * HOUR - 58 * 60 * 1000).toISOString(),
  followUpAt: new Date(now - 2 * HOUR).toISOString(),
  resolvedAt: new Date(now - 1 * HOUR - 46 * 60 * 1000).toISOString(),
  mindReasoningSummary:
    "Five members converged on a two-day-old member within 93 seconds with " +
    "no established interaction history between the target and the cluster.",
};

export const INCIDENT_014_OUTCOME: IncidentOutcome = {
  incidentId: INCIDENT_014.id,
  targetReengaged: true,
  repeatConvergenceDetected: false,
  escalationDetected: false,
  outcome: "successful",
  evaluatedAt: INCIDENT_014.resolvedAt ?? new Date(now - 2 * HOUR).toISOString(),
};

export const RECOVERY_TIME_LABEL = "3h 14m";

// ── Seeded demo aggregate metrics (clearly labelled) ─────────────

export const AGGREGATE_METRICS = {
  trajectoriesInterrupted: 3,
  membersRecovered: 2,
  unnecessaryBans: 0,
  interventionsSuccessful: 2,
  interventionsTotal: 3,
};
