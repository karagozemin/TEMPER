// GET   /api/incidents/[id]
// PATCH /api/incidents/[id] — update status / intervention fields

import { NextRequest, NextResponse } from "next/server";
import { getIncident, updateIncident } from "@/lib/incidents/service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const incident = getIncident(id);
  if (!incident) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ incident });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = updateIncident(id, {
    status: body.status,
    interventionType: body.interventionType,
    interventionAt: body.interventionAt,
    followUpAt: body.followUpAt,
    resolvedAt: body.resolvedAt,
    mindReasoningSummary: body.mindReasoningSummary,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ incident: updated });
}
