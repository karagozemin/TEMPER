// POST /api/demo/seed — seed the controlled demo dataset into SQLite.

import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/demo/seed";

export async function POST() {
  seedDemoData();
  return NextResponse.json({ ok: true, message: "Demo data seeded" });
}
