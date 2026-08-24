// GET /api/minds/history — persistence proof. With a real Minds client this
// returns the conversation history for the stable community alias; in demo /
// unavailable mode it returns the seeded or empty history respectively.

import { NextResponse } from "next/server";
import { getTemperMind } from "@/lib/minds/client";

export async function GET() {
  const mind = getTemperMind();
  try {
    const history = await mind.getHistory(50);
    return NextResponse.json({ source: mind.source, history });
  } catch (error) {
    return NextResponse.json(
      {
        source: mind.source,
        history: [],
        error: error instanceof Error ? error.message : "Failed to read history",
      },
      { status: 502 },
    );
  }
}
