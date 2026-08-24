// GET  /api/incidents — list incidents and outcomes
// POST /api/incidents — create an incident

import { NextRequest, NextResponse } from "next/server";
import {
  createIncident,
  listIncidents,
  listOutcomes,
} from "@/lib/incidents/service";
import type { Verdict } from "@/lib/types";

export async function GET() {
  const incidents = listIncidents();
  const outcomes = listOutcomes();
  return NextResponse.json({ incidents, outcomes });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const targetMemberId = body.targetMemberId as string | undefined;
  const sourceMemberIds = body.sourceMemberIds as string[] | undefined;
  const verdict = body.verdict as Verdict | undefined;

  if (!targetMemberId || !Array.isArray(sourceMemberIds) || !verdict) {
    return NextResponse.json(
      { error: "targetMemberId, sourceMemberIds and verdict are required" },
      { status: 400 },
    );
  }

  const incident = createIncident({
    targetMemberId,
    sourceMemberIds,
    verdict,
    confidence: typeof body.confidence === "number" ? body.confidence : undefined,
    detectedAt: body.detectedAt as string | undefined,
    mindReasoningSummary: body.mindReasoningSummary as string | undefined,
  });

  return NextResponse.json({ incident }, { status: 201 });
}
