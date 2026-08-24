"use client";

import { Panel, PanelHeader } from "@/components/ui";

export function ConvergenceGraph({
  sources,
  target,
  windowSeconds,
}: {
  sources: string[];
  target: string;
  windowSeconds: number;
}) {
  const height = 26 + sources.length * 40;
  const sourceX = 34;
  const targetX = 254;
  const targetY = height / 2;

  return (
    <Panel>
      <PanelHeader title="Interaction pattern" subtitle="who → whom, how fast" />
      <div className="px-5 py-4">
        <svg viewBox={`0 0 320 ${height}`} className="w-full">
          {sources.map((source, index) => {
            const y = 30 + index * 40;
            const midX = (sourceX + targetX) / 2;
            return (
              <g key={source}>
                <path
                  d={`M ${sourceX} ${y} C ${midX} ${y}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.32)"
                  strokeWidth="1.2"
                />
                <circle cx={sourceX} cy={y} r="4" fill="#a78bfa" />
                <text
                  x={sourceX + 12}
                  y={y + 4}
                  fill="#9b9ba7"
                  fontSize="12"
                  fontFamily="var(--font-sans)"
                >
                  {source}
                </text>
              </g>
            );
          })}

          <circle
            cx={targetX}
            cy={targetY}
            r="15"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.6"
          />
          <circle cx={targetX} cy={targetY} r="5" fill="#8b5cf6" />
          <text
            x={targetX}
            y={targetY - 24}
            fill="#f4f4f6"
            fontSize="13"
            fontWeight={600}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
          >
            {target}
          </text>
        </svg>

        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
            Target convergence detected
          </div>
          <div className="mt-1 text-sm text-white/80">
            {sources.length} members → 1 target
          </div>
          <div className="text-xs text-white/45">{windowSeconds} seconds</div>
        </div>
      </div>
    </Panel>
  );
}
