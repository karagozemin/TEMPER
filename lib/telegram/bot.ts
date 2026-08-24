// Telegram bot bootstrap. The bot is only created when a token is present so
// the dashboard and scripts work without Telegram credentials.

import { Bot } from "grammy";

let bot: Bot | null | undefined;

export function getBot(): Bot | null {
  if (bot !== undefined) return bot;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  bot = token ? new Bot(token) : null;
  return bot;
}

export function createBot(token: string): Bot {
  return new Bot(token);
}
