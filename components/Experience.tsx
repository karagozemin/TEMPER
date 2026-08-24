"use client";

import { useState } from "react";
import { Landing } from "@/components/Landing";
import { Intro } from "@/components/Intro";
import { Dashboard } from "@/components/Dashboard";

type Phase = "landing" | "intro" | "app";

export function Experience() {
  const [phase, setPhase] = useState<Phase>("landing");

  function enter() {
    setPhase("intro");
    window.setTimeout(() => setPhase("app"), 1700);
  }

  return (
    <>
      {phase === "landing" && <Landing onEnter={enter} />}
      {phase === "intro" && <Intro />}
      {phase === "app" && <Dashboard />}
    </>
  );
}
