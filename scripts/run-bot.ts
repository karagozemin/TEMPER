// Runs the TEMPER Telegram observer via long polling.
// Usage: npm run bot
//
// Add the bot to a group, then have members reply to / mention a target. When
// >=5 unique members converge on one target within the configured window, the
// engine emits a convergence signal and (if the Mind says dogpile) the bot
// posts a gentle group redirect.

import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch {
  // .env is optional; the script errors clearly if the token is missing.
}

import { createBot } from "../lib/telegram/bot";
import { registerBotHandlers } from "../lib/telegram/handler";

async function main(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const bot = createBot(token);
  registerBotHandlers(bot);

  bot.catch((err) => {
    const message =
      err.error instanceof Error ? err.error.message : String(err.error);
    console.error("[telegram] error:", message);
  });

  const me = await bot.api.getMe();
  console.log(`TEMPER observer online as @${me.username} (long polling).`);
  console.log("Add the bot to a group and send replies/mentions to observe.");
  await bot.start();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
