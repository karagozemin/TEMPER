// Runs the golden-path dogpile scenario end-to-end through the real engine:
// 5 members converge on Maya (newcomer → dogpile) and on Chris (established →
// banter), flowing through convergence → Minds → intervention.
//
// A single Telegram bot cannot impersonate 5 users, so this injects 5 distinct
// synthetic source ids directly into the engine. That exercises the identical
// pipeline the live observer uses, with real Minds and a real intervention.
//
// Usage: npm run scenario
// Optional: DEMO_CHAT_ID=<telegram-chat-id> to have the bot post the redirect
//           to a real group.

import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch {
  // .env is optional
}

import { runScenario } from "../lib/demo/scenario";

async function main(): Promise<void> {
  const rawChatId = process.env.DEMO_CHAT_ID;
  const chatId = rawChatId ? Number(rawChatId) : undefined;
  if (!chatId) {
    console.log(
      "Note: DEMO_CHAT_ID not set — the redirect is recorded but not sent to Telegram.",
    );
  }

  const { steps } = await runScenario(chatId);

  for (const step of steps) {
    console.log(`\n▶ ${step.name} (tenure ${step.tenureDays}d) · mind: ${step.source}`);
    if (step.decision) {
      console.log(
        `   verdict: ${step.decision.verdict.toUpperCase()} ` +
          `(${(step.decision.confidence * 100).toFixed(0)}%) → ${step.decision.action}`,
      );
      console.log(`   reason: ${step.decision.reason}`);
    } else {
      console.log(`   no decision: ${step.unavailableReason}`);
    }
    if (step.incidentId) {
      console.log(`   incident: ${step.incidentId} (${step.incidentStatus})`);
    }
  }

  console.log("\n✓ Scenario complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
