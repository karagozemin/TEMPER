// Autonomous follow-up (PRD section 21–22). An incident stays open after
// intervention; later, TEMPER evaluates re-engagement, repeat convergence and
// escalation, then persists an outcome.

import type { IncidentOutcome, Interaction } from "@/lib/types";
import { detectConvergence } from "@/lib/convergence/detector";
import {
  convergenceConfigFromEnv,
} from "@/lib/convergence/config";

export interface FollowUpResult {
  outcome: IncidentOutcome;
  nextStatus: "recovered" | "escalating" | "observing";
}

/**
 * Evaluate an open incident against interactions that happened after the
 * intervention.
 *
 * - targetReengaged        → the target sent at least one message since then.
 * - repeatConvergenceDetected → a fresh convergence signal formed on the target.
 * - escalationDetected     → MVP heuristic: repeat convergence, i.e. pressure
 *                            continued or restarted after intervention.
 */
export function evaluateFollowUp(
  incidentId: string,
  targetMemberId: string,
  interactions: Interaction[],
  sinceIso: string,
  now: number = Date.now(),
): FollowUpResult {
  const since = new Date(sinceIso).getTime();

  const afterIntervention = interactions.filter(
    (interaction) => new Date(interaction.timestamp).getTime() > since,
  );

  const targetReengaged = afterIntervention.some(
    (interaction) => interaction.sourceMemberId === targetMemberId,
  );

  const config = convergenceConfigFromEnv();
  const { signal } = detectConvergence(
    targetMemberId,
    afterIntervention,
    now,
    config,
  );
  const repeatConvergenceDetected = signal !== null;

  // MVP escalation heuristic: pressure resumed after the intervention.
  const escalationDetected = repeatConvergenceDetected;

  let outcome: IncidentOutcome["outcome"] = "neutral";
  let nextStatus: FollowUpResult["nextStatus"] = "observing";

  if (targetReengaged && !repeatConvergenceDetected) {
    outcome = "successful";
    nextStatus = "recovered";
  } else if (repeatConvergenceDetected || escalationDetected) {
    outcome = "failed";
    nextStatus = "escalating";
  }

  return {
    nextStatus,
    outcome: {
      incidentId,
      targetReengaged,
      repeatConvergenceDetected,
      escalationDetected,
      outcome,
      evaluatedAt: new Date(now).toISOString(),
    },
  };
}
