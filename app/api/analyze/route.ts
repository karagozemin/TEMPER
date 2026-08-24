// POST /api/analyze — submit an evidence packet and receive a structured
// Mind decision. Accepts both the PRD snake_case packet and camelCase types.

import { NextRequest, NextResponse } from "next/server";
import { analyzeEvidence } from "@/lib/engine";
import type { EvidencePacket } from "@/lib/types";

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEvidence(body: Record<string, unknown>): EvidencePacket {
  const target = (body.target ?? {}) as Record<string, unknown>;
  const pattern = (body.pattern ?? {}) as Record<string, unknown>;

  const community =
    (body.community as string | undefined) ??
    process.env.DEMO_COMMUNITY_ID ??
    "temper-demo-community";

  const sourceMembers = Array.isArray(body.sourceMembers)
    ? (body.sourceMembers as string[])
    : Array.isArray(body.source_members)
      ? (body.source_members as string[])
      : [];

  const messages = Array.isArray(body.messages) ? (body.messages as string[]) : [];

  return {
    event: "convergence_detected",
    community,
    target: {
      name: (target.name as string) ?? "a member",
      tenureDays: num(target.tenureDays ?? target.tenure_days, 1),
    },
    pattern: {
      uniqueSources: num(
        pattern.uniqueSources ?? pattern.unique_sources,
        sourceMembers.length,
      ),
      windowSeconds: num(pattern.windowSeconds ?? pattern.window_seconds, 120),
      interactionCount: num(
        pattern.interactionCount ?? pattern.interaction_count,
        messages.length,
      ),
    },
    sourceMembers,
    messages,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const evidence = normalizeEvidence(body as Record<string, unknown>);
  const result = await analyzeEvidence(evidence);
  return NextResponse.json(result);
}
