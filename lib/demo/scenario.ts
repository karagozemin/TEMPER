// Golden-path scenario: seed the demo members, then converge 5 sources on Maya
// (newcomer → dogpile) and Chris (established → banter) through the real engine
// (convergence → Minds → intervention). Reused by both `npm run scenario` and
// the `POST /api/scenario` endpoint.

import { handleInteraction } from "@/lib/engine";
import { seedDemoData } from "@/lib/demo/seed";
import type { Interaction, MindDecision } from "@/lib/types";
import type { MindSource } from "@/lib/minds/client";

export interface ScenarioStep {
  target: string;
  name: string;
  tenureDays: number;
  source: MindSource;
  decision: MindDecision | null;
  unavailableReason: string | null;
  incidentId: string | null;
  incidentStatus: string | null;
}

export interface ScenarioResult {
  steps: ScenarioStep[];
}

const SOURCES = ["alex", "john", "sam", "mike", "ben"];
const MESSAGES = [
  "interesting take lol",
  "bro really thought he cooked",
  "💀",
  "welcome to the server 😂",
  "maybe read first next time",
];

const TARGETS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "maya", name: "Maya" },
  { id: "chris", name: "Chris" },
];

function buildInteractions(target: string): Interaction[] {
  const now = Date.now();
  return SOURCES.map((source, index) => ({
    id: `scenario-${target}-${now}-${index}`,
    sourceMemberId: source,
    targetMemberId: target,
    messageId: `scenario-msg-${target}-${now}-${index}`,
    timestamp: new Date(now).toISOString(),
    type: "reply",
    text: MESSAGES[index],
  }));
}

export async function runScenario(chatId?: number): Promise<ScenarioResult> {
  seedDemoData();

  const steps: ScenarioStep[] = [];

  for (const { id, name } of TARGETS) {
    let step: ScenarioStep = {
      target: id,
      name,
      tenureDays: 1,
      source: "unavailable",
      decision: null,
      unavailableReason: null,
      incidentId: null,
      incidentStatus: null,
    };

    for (const interaction of buildInteractions(id)) {
      const result = await handleInteraction(interaction, chatId);
      if (result.kind !== "convergence") continue;

      step = {
        ...step,
        tenureDays: result.evidence.target.tenureDays,
        source: result.analyze.source,
        decision: result.analyze.decision,
        unavailableReason: result.analyze.unavailableReason,
        incidentId: result.incident?.id ?? null,
        incidentStatus: result.incident?.status ?? null,
      };

      // A scenario needs one verdict per target. Once convergence has fired,
      // stop feeding the remaining synthetic messages; otherwise every later
      // message can trigger another (potentially minutes-long) Minds request.
      break;
    }

    steps.push(step);
  }

  return { steps };
}
