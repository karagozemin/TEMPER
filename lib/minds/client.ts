// Minds client abstraction (PRD section 14). The application depends on a
// small `TemperMind` interface, not on a specific SDK, so the official Minds
// TypeScript client can be swapped in here without touching the rest of the
// product. When no Minds credentials are configured the system degrades to
// OBSERVE-only — it never fabricates a verdict (PRD section 39).

import type {
  EvidencePacket,
  Incident,
  IncidentOutcome,
  MindDecision,
} from "@/lib/types";
import { parseMindDecision } from "@/lib/minds/schema";
import { DeterministicTemperMind } from "@/lib/minds/deterministic";

export type MindSource = "minds" | "deterministic-demo" | "unavailable";

export interface TemperMind {
  readonly source: MindSource;
  evaluate(evidence: EvidencePacket): Promise<MindDecision>;
  rememberOutcome(incident: Incident, outcome: IncidentOutcome): Promise<void>;
}

export class MindsUnavailableError extends Error {
  constructor(message = "Context analysis unavailable") {
    super(message);
    this.name = "MindsUnavailableError";
  }
}

export interface MindsClientOptions {
  apiUrl: string;
  apiKey: string;
  mindId: string;
}

/**
 * HTTP adapter for the official Minds API. The exact endpoint is configurable
 * via MINDS_API_URL; the request body uses the decision contract defined in
 * this repository. Swap the internals for the official SDK if preferred.
 */
export class MindsTemperMind implements TemperMind {
  readonly source: MindSource = "minds";

  constructor(private readonly options: MindsClientOptions) {}

  async evaluate(evidence: EvidencePacket): Promise<MindDecision> {
    const response = await fetch(
      `${this.options.apiUrl.replace(/\/$/, "")}/v1/minds/${this.options.mindId}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          community: evidence.community,
          event: evidence.event,
          evidence,
        }),
      },
    );

    if (!response.ok) {
      throw new MindsUnavailableError(
        `Minds request failed with status ${response.status}`,
      );
    }

    const raw = await response.json();
    // The API may wrap the decision; be lenient about the wrapper key.
    const payload = (raw as { decision?: unknown; data?: unknown }).decision ?? raw;
    return parseMindDecision(payload);
  }

  async rememberOutcome(
    incident: Incident,
    outcome: IncidentOutcome,
  ): Promise<void> {
    await fetch(
      `${this.options.apiUrl.replace(/\/$/, "")}/v1/minds/${this.options.mindId}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          role: "system",
          content: `Incident ${incident.id} outcome: ${outcome.outcome}. ` +
            `target re-engaged: ${outcome.targetReengaged}; ` +
            `repeat convergence: ${outcome.repeatConvergenceDetected}; ` +
            `escalation: ${outcome.escalationDetected}.`,
        }),
      },
    );
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
}

export function getTemperMind(): TemperMind {
  const apiUrl = process.env.MINDS_API_URL;
  const apiKey = process.env.MINDS_API_KEY;

  if (apiUrl && apiKey) {
    return new MindsTemperMind({
      apiUrl,
      apiKey,
      mindId: process.env.TEMPER_MIND_ID ?? "temper-demo-community",
    });
  }

  if (process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development") {
    return new DeterministicTemperMind();
  }

  return new UnavailableTemperMind();
}
