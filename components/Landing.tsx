"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <motion.div
        className="absolute -top-44 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[130px]"
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="animate-drift absolute left-[12%] top-[32%] h-1.5 w-1.5 rounded-full bg-violet-400/50" />
      <div
        className="animate-drift absolute right-[16%] top-[24%] h-1 w-1 rounded-full bg-white/25"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="animate-drift absolute bottom-[26%] left-[22%] h-1 w-1 rounded-full bg-violet-300/40"
        style={{ animationDelay: "2.8s" }}
      />
    </div>
  );
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);

  function handleEnter() {
    setLeaving(true);
    window.setTimeout(onEnter, 520);
  }

  return (
    <motion.section
      className="relative flex min-h-screen flex-col overflow-hidden px-6"
      animate={
        leaving
          ? { opacity: 0, scale: 0.985, filter: "blur(8px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Background />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <span className="text-sm font-semibold tracking-[0.22em] text-white">
            TEMPER
          </span>
        </div>
        <span className="hidden text-[11px] uppercase tracking-[0.16em] text-white/35 sm:block">
          Moderation intelligence
        </span>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-1 flex-col items-center justify-center py-16 text-center"
      >
        <motion.div variants={item}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Logo
              size={92}
              className="rounded-2xl shadow-[0_0_90px_rgba(139,92,246,0.28)]"
            />
          </motion.div>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-12 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300"
        >
          Emergent harm moderation
        </motion.p>

        <motion.h1
          variants={item}
          className="text-balance mt-6 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          Detect harm <span className="text-white/35">between</span> messages,
          not <span className="text-temper-gold">inside</span> them.
        </motion.h1>

        <motion.p
          variants={item}
          className="text-balance mt-7 max-w-xl text-base leading-relaxed text-white/50"
        >
          TEMPER reads who converges on whom — and how fast — then remembers
          enough community history to tell friendly banter from collective
          pressure.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <Button onClick={handleEnter} size="lg">
            Enter the system
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Button>
          <span className="text-xs text-white/35">
            Moderation that remembers the difference
          </span>
        </motion.div>
      </motion.div>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] py-5 text-xs text-white/30">
        <span>Telegram · Minds · Persistent memory</span>
        <span className="font-mono">temper-demo-community</span>
      </footer>
    </motion.section>
  );
}
