"use client";

import { useEffect, useState } from "react";
import { Pill, type Tone } from "@/components/ui";

type Source = "minds" | "deterministic-demo" | "unavailable";

const LABEL: Record<Source, string> = {
  minds: "Live Minds",
  "deterministic-demo": "Demo mode",
  unavailable: "Unavailable",
};

const TONE: Record<Source, Tone> = {
  minds: "recovered",
  "deterministic-demo": "gold",
  unavailable: "neutral",
};

/**
 * Header status badge. Reads the current Minds source from /api/minds/history
 * (which reports "minds", "deterministic-demo" or "unavailable").
 */
export function MindStatus() {
  const [source, setSource] = useState<Source>("deterministic-demo");

  useEffect(() => {
    fetch("/api/minds/history")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.source === "string") {
          setSource(data.source as Source);
        }
      })
      .catch(() => {
        setSource("unavailable");
      });
  }, []);

  return <Pill tone={TONE[source]}>{LABEL[source]}</Pill>;
}
