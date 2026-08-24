"use client";

import {
  DEMO_SOURCES,
  MAYA_CONTEXT,
  MAYA_DECISION,
  MAYA_EVIDENCE,
} from "@/lib/demo/dataset";
import { buildGentleRedirect } from "@/lib/telegram/interventions";
import { ConvergenceGraph } from "@/components/ConvergenceGraph";
import { LegacyFeed } from "@/components/LegacyFeed";
import { MindDecision } from "@/components/MindDecision";
import { Label, Panel } from "@/components/ui";

export function LiveDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Label>Live incident · temper-demo-community</Label>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Collective pressure detected
          </h2>
          <p className="mt-1 text-sm text-white/45">
            Five individually safe messages converge on one newcomer.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <LegacyFeed />
        <ConvergenceGraph
          sources={DEMO_SOURCES}
          target="Maya"
          windowSeconds={MAYA_EVIDENCE.pattern.windowSeconds}
        />
        <MindDecision
          context={MAYA_CONTEXT}
          evidence={MAYA_EVIDENCE}
          decision={MAYA_DECISION}
        />
      </div>

      <Panel className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Autonomous action</Label>
          <p className="mt-1 text-sm text-white/85">
            {buildGentleRedirect("Maya")}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-white/40">
          incident remains OPEN
        </span>
      </Panel>
    </div>
  );
}
