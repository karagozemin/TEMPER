"use client";

import type {
  CommunityContext,
  EvidencePacket,
  MindDecision,
} from "@/lib/types";
import { Fact, Panel, PanelHeader, Pill, type Tone } from "@/components/ui";

const verdictTone: Record<MindDecision["verdict"], Tone> = {
  dogpile: "dogpile",
  banter: "banter",
  observe: "observe",
};

const verdictLabel: Record<MindDecision["verdict"], string> = {
  dogpile: "Probable dogpile",
  banter: "Established banter",
  observe: "Observe",
};

export function MindDecision({
  context,
  evidence,
  decision,
}: {
  context: CommunityContext;
  evidence: EvidencePacket;
  decision: MindDecision;
}) {
  const exchanges = context.previousExchangesWithSources;
  const relationshipHistory =
    exchanges === 0 ? "None established" : `${exchanges} previous exchanges`;
  const memoryMatch =
    context.comparableFriendlyPrecedents === 0
      ? "No comparable friendly precedent"
      : `${context.comparableFriendlyPrecedents} comparable precedents`;

  return (
    <Panel>
      <PanelHeader title="TEMPER Mind" subtitle="persistent community memory" />
      <div className="px-5 py-4">
        <Fact label="Target" value={context.member.name} accent />
        <Fact label="Tenure" value={`${context.member.tenureDays} days`} />
        <Fact label="Relationship history" value={relationshipHistory} />
        <Fact
          label="Current pattern"
          value={`${evidence.pattern.uniqueSources} → 1 convergence`}
        />
        <Fact label="Memory match" value={memoryMatch} />

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            Verdict
          </span>
          <Pill tone={verdictTone[decision.verdict]}>
            {verdictLabel[decision.verdict]}
          </Pill>
        </div>
        <div className="mt-2 text-xs leading-relaxed text-white/60">
          {decision.reason}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            Action
          </span>
          <span className="text-sm font-medium text-white">
            {decision.action === "gentle_group_redirect"
              ? "Gentle redirect"
              : "None"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            Confidence
          </span>
          <span className="font-mono text-sm text-violet-300">
            {(decision.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </Panel>
  );
}
