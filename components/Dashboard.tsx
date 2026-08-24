"use client";

import { useState } from "react";
import { LiveDashboard } from "@/components/LiveDashboard";
import { ContrastView } from "@/components/ContrastView";
import { RecoveryView } from "@/components/RecoveryView";
import { Pill } from "@/components/ui";

type View = "live" | "contrast" | "recovery";

const TABS: Array<{ id: View; label: string }> = [
  { id: "live", label: "Live incident" },
  { id: "contrast", label: "Maya vs Chris" },
  { id: "recovery", label: "Recovery" },
];

export function Dashboard() {
  const [view, setView] = useState<View>("live");

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 font-mono text-sm font-bold text-violet-300">
              T
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.22em] text-white">
                TEMPER
              </div>
              <div className="text-[11px] text-white/40">
                Emergent harm moderation
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Pill tone="purple">Demo mode</Pill>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-1 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`border-b-2 px-3 py-3 text-sm transition-colors ${
                view === tab.id
                  ? "border-violet-400 font-medium text-white"
                  : "border-transparent text-white/45 hover:text-white/75"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-8">
        {view === "live" && <LiveDashboard />}
        {view === "contrast" && <ContrastView />}
        {view === "recovery" && <RecoveryView />}
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-white/35">
          <span>Detect harm between messages, not inside them.</span>
          <span className="font-mono">temper-demo-community</span>
        </div>
      </footer>
    </div>
  );
}
