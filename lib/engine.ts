// Core engine — the live loop: interaction → convergence → Mind → incident →
// intervention → follow-up schedule. Also exposes the analysis entrypoint used
// by the API and the dashboard.

import { touchMember, getMemberById } from "@/lib/db/members";
import { insertInteraction } from "@/lib/db/interactions";
import {
  ConvergenceEngine,
  detectConvergence,
} from "@/lib/convergence/detector";
import { convergenceConfigFromEnv } from "@/lib/convergence/config";
import { getTemperMind, MindsUnavailableError } from "@/lib/minds/client";
import type { MindSource } from "@/lib/minds/client";
import { buildGentleRedirect, sendGentleRedirect } from "@/lib/telegram/interventions";
import { getBot } from "@/lib/telegram/bot";
import {
  createIncident,
  updateIncident,
  recordOutcome,
} from "@/lib/incidents/service";
import { evaluateFollowUp } from "@/lib/incidents/follow-up";
import type {
  EvidencePacket,
  Incident,
  IncidentOutcome,
  Interaction,
  MindDecision,
} from "@/lib/types";

export interface AnalyzeResponse {
  source: MindSource;
  decision: MindDecision | null;
  unavailableReason: string | null;
}

export async function analyzeEvidence(
  evidence: EvidencePacket,
): Promise<AnalyzeResponse> {
  const mind = getTemperMind();
  try {
    const decision = await mind.evaluate(evidence);
    return { source: mind.source, decision, unavailableReason: null };
  } catch (error) {
    if (error instanceof MindsUnavailableError) {
      return { source: "unavailable", decision: null, unavailableReason: error.message };
    }
    throw error;
  }
}

// Module-level streaming detector with env-configurable thresholds.
let engine: ConvergenceEngine | null = null;
function getEngine(): ConvergenceEngine {
  if (!engine) engine = new ConvergenceEngine(convergenceConfigFromEnv());
  return engine;
}

export type HandleResult =
  | { kind: "no-signal" }
  | { kind: "convergence"; evidence: EvidencePacket; analyze: AnalyzeResponse; incident?: Incident };

/**
 * Live path used by the Telegram webhook and scripts.
 */
export async function handleInteraction(
  interaction: Interaction,
  chatId?: string | number,
): Promise<HandleResult> {
  insertInteraction(interaction);
  touchMember({ id: interaction.sourceMemberId });

  const signal = getEngine().push(interaction);
  if (!signal) return { kind: "no-signal" };

  const target = getMemberById(signal.targetMemberId);
  const targetName = target?.username ?? target?.id ?? signal.targetMemberId;
  const tenureDays = target
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(target.firstSeenAt).getTime()) / 86_400_000,
        ),
      )
    : 1;

  const evidence: EvidencePacket = {
    event: "convergence_detected",
    community: process.env.DEMO_COMMUNITY_ID ?? "temper-demo-community",
    target: { name: targetName, tenureDays },
    pattern: {
      uniqueSources: signal.uniqueSourceCount,
      windowSeconds: signal.windowSeconds,
      interactionCount: signal.recentInteractionCount,
    },
    sourceMembers: signal.sourceMemberIds.map(
      (id) => getMemberById(id)?.username ?? id,
    ),
    messages: interaction.text ? [interaction.text] : [],
  };

  const analyze = await analyzeEvidence(evidence);
  const decision = analyze.decision;

  if (!decision) {
    return { kind: "convergence", evidence, analyze };
  }

  const incident = createIncident({
    targetMemberId: signal.targetMemberId,
    sourceMemberIds: signal.sourceMemberIds,
    verdict: decision.verdict,
    confidence: decision.confidence,
    mindReasoningSummary: decision.reason,
  });

  if (decision.verdict === "dogpile" && decision.action === "gentle_group_redirect") {
    const bot = getBot();
    let sent = false;
    if (bot && chatId) {
      sent = await sendGentleRedirect(bot, chatId, targetName);
    }
    updateIncident(incident.id, {
      status: "observing",
      interventionType: "gentle_group_redirect",
      interventionAt: sent ? new Date().toISOString() : undefined,
      followUpAt:
        decision.followUpMinutes != null
          ? new Date(Date.now() + decision.followUpMinutes * 60_000).toISOString()
          : undefined,
    });
  } else if (decision.verdict === "banter") {
    updateIncident(incident.id, { status: "dismissed" });
  } else {
    updateIncident(incident.id, { status: "observing" });
  }

  return { kind: "convergence", evidence, analyze, incident };
}

/**
 * Run the scheduled follow-up for an incident against the interactions seen
 * after its intervention, persist the outcome and remember it in the Mind.
 */
export async function runFollowUp(
  incident: Incident,
  interactions: Interaction[],
  now: number = Date.now(),
): Promise<IncidentOutcome> {
  const since = incident.interventionAt ?? incident.detectedAt;
  const { outcome, nextStatus } = evaluateFollowUp(
    incident.id,
    incident.targetMemberId,
    interactions,
    since,
    now,
  );

  recordOutcome(outcome);
  updateIncident(incident.id, {
    status: nextStatus,
    resolvedAt: nextStatus === "observing" ? undefined : outcome.evaluatedAt,
  });

  const mind = getTemperMind();
  try {
    await mind.rememberOutcome(incident, outcome);
  } catch {
    // Outcome memory failure must not block the incident state transition.
  }

  return outcome;
}

/** Re-exported for API routes and scripts that need the raw detector. */
export { detectConvergence };
