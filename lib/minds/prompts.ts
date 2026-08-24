// Prompt construction for the persistent TEMPER Mind (PRD sections 18–19).
// Prompts are deliberately constrained: the demo must not depend on random
// LLM behaviour, so the system prompt fixes the vocabulary and the output
// contract at all times.

import type { EvidencePacket, Incident, IncidentOutcome } from "@/lib/types";

export const SYSTEM_PROMPT = `You are TEMPER, a persistent moderation Mind for creator communities.

You evaluate INTERACTION PATTERNS, not individual messages. A set of messages
may each be harmless in isolation while collectively forming harmful pressure.

Your job is to distinguish:
- BANTER — an established group teasing a long-term member who has a history of
  reciprocal, welcomed exchanges with the same people.
- COLLECTIVE PRESSURE (dogpile) — multiple members rapidly converging on a
  target who is new, has no established relationship with them, and has no
  reciprocal banter history.
- OBSERVE — when historical context is insufficient to decide confidently.

Rules:
1. Never label a person; describe interaction patterns only.
2. Never invent history that is not present in the evidence or your memory.
3. Prefer OBSERVE when uncertain. A convergence signal is evidence, not a verdict.
4. The only autonomous action available is "gentle_group_redirect".
5. Always return the exact JSON contract requested, with no extra prose.`;

export function buildEvidencePrompt(evidence: EvidencePacket): string {
  const messages = evidence.messages.map((m, i) => `${i + 1}. "${m}"`).join("\n");
  return `A convergence signal was detected in the community "${evidence.community}".

TARGET
- name: ${evidence.target.name}
- tenure in community: ${evidence.target.tenureDays} days

PATTERN
- unique sources: ${evidence.pattern.uniqueSources}
- window: ${evidence.pattern.windowSeconds} seconds
- interactions in window: ${evidence.pattern.interactionCount}

SOURCE MEMBERS
${evidence.sourceMembers.map((m) => `- ${m}`).join("\n")}

MESSAGES
${messages}

Using your persistent memory of this community, decide whether this is banter,
collective pressure (dogpile), or whether you must observe. Respond with JSON only:

{
  "verdict": "dogpile" | "banter" | "observe",
  "confidence": 0.0,
  "reason": "one concise, creator-readable sentence",
  "action": "gentle_group_redirect" | "none",
  "follow_up_minutes": null | 180
}`;
}

export function buildOutcomePrompt(
  incident: Incident,
  outcome: IncidentOutcome,
): string {
  return `Incident ${incident.id} has completed. Remember this outcome for future
comparable incidents.

Initial pattern: convergence on "${incident.targetMemberId}".
Verdict: ${incident.verdict}.
Action: ${incident.interventionType ?? "none"}.
Outcome: ${outcome.outcome}.

Evidence:
- target re-engaged: ${outcome.targetReengaged}
- repeat convergence: ${outcome.repeatConvergenceDetected}
- escalation: ${outcome.escalationDetected}

Store this as a precedent so future decisions on similar convergence events
can reference whether this intervention worked. Respond with a one-sentence
acknowledgement only.`;
}
