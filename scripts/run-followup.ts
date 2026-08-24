// Runs autonomous follow-up on all open/observing incidents.
// Usage: npm run followup

import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch {
  // .env is optional; defaults apply without it.
}

import { listIncidents } from "../lib/incidents/service";
import { listInteractions } from "../lib/db/interactions";
import { runFollowUp } from "../lib/engine";

async function main(): Promise<void> {
  const active = listIncidents().filter(
    (incident) => incident.status === "open" || incident.status === "observing",
  );

  if (active.length === 0) {
    console.log("No open incidents to follow up on.");
    return;
  }

  for (const incident of active) {
    const since = incident.interventionAt ?? incident.detectedAt;
    const interactions = listInteractions(since);
    const outcome = await runFollowUp(incident, interactions);
    console.log(
      `Incident ${incident.id} → ${outcome.outcome} ` +
        `(re-engaged: ${outcome.targetReengaged}, repeat convergence: ${outcome.repeatConvergenceDetected})`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
