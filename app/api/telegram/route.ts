// POST /api/telegram — Telegram webhook. Receives group updates, converts
// messages into interaction events and feeds the live engine.

import { NextRequest, NextResponse } from "next/server";
import type { Update } from "grammy/types";
import { getBot } from "@/lib/telegram/bot";
import { interactionFromMessage } from "@/lib/telegram/observer";
import { handleInteraction } from "@/lib/engine";

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bot = getBot();
  if (!bot) {
    return NextResponse.json(
      { error: "Telegram bot is not configured" },
      { status: 503 },
    );
  }

  const update = (await request.json()) as Update;
  const message = update.message ?? update.edited_message;
  if (message) {
    const interaction = interactionFromMessage(message);
    if (interaction) {
      await handleInteraction(interaction, message.chat.id);
    }
  }

  return NextResponse.json({ ok: true });
}
