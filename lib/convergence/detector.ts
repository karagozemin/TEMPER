// The convergence engine is intentionally simple and deterministic (PRD §16).
// It detects STRUCTURE only — N unique sources → one target within a window —
// and emits a ConvergenceSignal. It never concludes harassment; the semantic
// verdict belongs to the TEMPER Mind.

import type { ConvergenceSignal, Interaction } from "@/lib/types";
import {
  defaultConvergenceConfig,
  type ConvergenceConfig,
} from "@/lib/convergence/config";

export interface ConvergenceResult {
  signal: ConvergenceSignal | null;
  /** Interactions that fell inside the window (useful for evidence packets). */
  recent: Interaction[];
}

/**
 * Pure, unit-testable core. Given all known interactions and a target member,
 * returns a signal if the last `windowSeconds` contains >= `minimumSources`
 * distinct source members replying to/mentioning the target.
 */
export function detectConvergence(
  targetMemberId: string,
  interactions: Interaction[],
  now: number = Date.now(),
  config: ConvergenceConfig = defaultConvergenceConfig,
): ConvergenceResult {
  const windowStart = now - config.convergenceWindowSeconds * 1000;

  const recent = interactions.filter((interaction) => {
    if (interaction.targetMemberId !== targetMemberId) return false;
    const at = new Date(interaction.timestamp).getTime();
    return at >= windowStart && at <= now;
  });

  // Repeated sources count once — we care about distinct members converging.
  const sourceMemberIds = Array.from(
    new Set(recent.map((interaction) => interaction.sourceMemberId)),
  );

  if (sourceMemberIds.length >= config.minimumSources) {
    return {
      recent,
      signal: {
        targetMemberId,
        sourceMemberIds,
        uniqueSourceCount: sourceMemberIds.length,
        windowSeconds: config.convergenceWindowSeconds,
        recentInteractionCount: recent.length,
        detectedAt: new Date(now).toISOString(),
      },
    };
  }

  return { recent, signal: null };
}

/**
 * Streaming detector with a bounded in-memory buffer. Useful for the live
 * Telegram observer, which feeds interactions as they arrive.
 */
export class ConvergenceEngine {
  private buffer: Interaction[] = [];
  private readonly config: ConvergenceConfig;

  constructor(config: ConvergenceConfig = defaultConvergenceConfig) {
    this.config = config;
  }

  push(interaction: Interaction): ConvergenceSignal | null {
    this.buffer.push(interaction);
    this.prune(Date.now());
    const { signal } = detectConvergence(
      interaction.targetMemberId,
      this.buffer,
      Date.now(),
      this.config,
    );
    return signal;
  }

  private prune(now: number): void {
    const cutoff = now - this.config.convergenceWindowSeconds * 2 * 1000;
    this.buffer = this.buffer.filter(
      (interaction) => new Date(interaction.timestamp).getTime() >= cutoff,
    );
  }
}
