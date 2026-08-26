// POST /api/scenario — run the golden-path dogpile scenario (Maya + Chris)
// through the real engine and return the two verdicts.

import { NextResponse } from "next/server";
import { runScenario } from "@/lib/demo/scenario";

export async function POST() {
  try {
    const rawChatId = process.env.DEMO_CHAT_ID;
    const parsedChatId = rawChatId ? Number(rawChatId) : undefined;
    const chatId = Number.isFinite(parsedChatId) ? parsedChatId : undefined;

    const result = await runScenario(chatId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Scenario execution failed",
        steps: [],
      },
      { status: 502 },
    );
  }
}
