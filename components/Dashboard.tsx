"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiveDashboard } from "@/components/LiveDashboard";
import { ContrastView } from "@/components/ContrastView";
import { RecoveryView } from "@/components/RecoveryView";
import { LiveMinds } from "@/components/LiveMinds";
import { MindStatus } from "@/components/MindStatus";
import { Logo } from "@/components/Logo";

type View = "live" | "contrast" | "recovery" | "minds";

const TABS: Array<{ id: View; label: string }> = [
  { id: "live", label: "Live incident" },
  { id: "contrast", label: "Maya vs Chris" },
  { id: "recovery", label: "Recovery" },
  { id: "minds", label: "Live Minds" },
];

export function Dashboard() {
  const [view, setView] = useState<View>("live");

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#06060a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <Logo size={34} />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-[0.22em] text-white">
              TEMPER
            </span>
            <span className="hidden text-[11px] text-white/40 sm:inline">
              Emergent harm moderation
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <MindStatus />
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-1 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`relative px-3 py-3 text-sm transition-colors ${
                view === tab.id
                  ? "font-medium text-white"
                  : "text-white/45 hover:text-white/75"
              }`}
            >
              {tab.label}
              {view === tab.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-violet-400"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {view === "live" && <LiveDashboard />}
            {view === "contrast" && <ContrastView />}
            {view === "recovery" && <RecoveryView />}
            {view === "minds" && <LiveMinds />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-white/35">
          <span>Detect harm between messages, not inside them.</span>
          <span className="font-mono">temper-demo-community</span>
        </div>
      </footer>
    </motion.div>
  );
}
