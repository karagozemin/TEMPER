// Deterministic convergence configuration (PRD section 16).
// These values are intentionally configurable and must not be hard-coded
// inside the detector.

export interface ConvergenceConfig {
  /** Minimum number of unique source members converging on one target. */
  minimumSources: number;
  /** Sliding window, in seconds, within which convergence must occur. */
  convergenceWindowSeconds: number;
}

export const defaultConvergenceConfig: ConvergenceConfig = {
  minimumSources: 5,
  convergenceWindowSeconds: 120,
};

export function convergenceConfigFromEnv(): ConvergenceConfig {
  const minimumSources = Number(process.env.CONVERGENCE_MIN_SOURCES);
  const windowSeconds = Number(process.env.CONVERGENCE_WINDOW_SECONDS);

  return {
    minimumSources:
      Number.isFinite(minimumSources) && minimumSources > 0
        ? minimumSources
        : defaultConvergenceConfig.minimumSources,
    convergenceWindowSeconds:
      Number.isFinite(windowSeconds) && windowSeconds > 0
        ? windowSeconds
        : defaultConvergenceConfig.convergenceWindowSeconds,
  };
}
