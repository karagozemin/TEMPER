"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

export function Intro() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.6, times: [0, 0.25, 0.72, 1], ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
      >
        <Logo
          size={96}
          className="rounded-2xl shadow-[0_0_80px_rgba(139,92,246,0.35)]"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.32em" }}
        transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
        className="mt-9 text-2xl font-semibold text-white"
      >
        TEMPER
      </motion.h1>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.55, duration: 0.8, ease: "easeInOut" }}
        className="mt-5 h-px w-44 origin-center bg-gradient-to-r from-transparent via-violet-400 to-transparent"
      />
    </motion.div>
  );
}
