// Shared Telegram message handler. Used by both the long-polling runner
// (scripts/run-bot.ts) and, in principle, the webhook route. Converts a
// message into an interaction and feeds it into the live engine
// (convergence → Mind → intervention).

import type { Bot } from "grammy";
import { interactionFromMessage } from "@/lib/telegram/observer";
import { handleInteraction } from "@/lib/engine";

export function registerBotHandlers(bot: Bot): void {
  bot.on("message", async (ctx) => {
    const message = ctx.message;
    if (!message) return;

    const interaction = interactionFromMessage(message);
    if (!interaction) return; // not a reply/mention — nothing to observe

    try {
      const result = await handleInteraction(interaction, message.chat.id);

      if (result.kind === "convergence") {
        const decision = result.analyze.decision;
        const label = decision
          ? `${decision.verdict} (${(decision.confidence * 100).toFixed(0)}%)`
          : result.analyze.unavailableReason ?? "no decision";
        console.log(
          `[temper] convergence on "${result.evidence.target.name}" → ${label}`,
        );
      }
    } catch (error) {
      console.error("[temper] handleInteraction failed:", error);
    }
  });
}
