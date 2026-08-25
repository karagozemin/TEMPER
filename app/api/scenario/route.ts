// POST /api/scenario — run the golden-path dogpile scenario (Maya + Chris)
// through the real engine and return the two verdicts.

import { NextResponse } from "next/server";
import { runScenario } from "@/lib/demo/scenario";

export async function POST() {
  const rawChatId = process.env.DEMO_CHAT_ID;
  const chatId = rawChatId ? Number(rawChatId) : undefined;

  const result = await runScenario(chatId);
  return NextResponse.json(result);
}
