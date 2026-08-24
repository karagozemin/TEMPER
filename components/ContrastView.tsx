"use client";

import {
  CHRIS_CONTEXT,
  CHRIS_DECISION,
  MAYA_CONTEXT,
  MAYA_DECISION,
} from "@/lib/demo/dataset";
import type { CommunityContext, EvidencePacket, MindDecision } from "@/lib/types";
import { Label, Panel, Pill, type Tone } from "@/components/ui";

const verdictTone: Record<MindDecision["verdict"], Tone> = {
  dogpile: "dogpile",
  banter: "banter",
  observe: "observe",
};

function ContrastCard({
  name,
  context,
  decision,
}: {
  name: string;
  context: CommunityContext;
  decision: MindDecision;
}) {
  const tenureLabel =
    context.member.tenureDays >= 30
      ? `${Math.round(context.member.tenureDays / 30)} months`
      : `${context.member.tenureDays} days`;

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="text-lg font-semibold text-white">{name}</div>
        <Pill tone={verdictTone[decision.verdict]}>
          {decision.verdict === "dogpile" ? "Dogpile" : "Banter"}
        </Pill>
      </div>
      <div className="space-y-2.5 px-5 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-white/40">Tenure</span>
          <span className="text-white/90">{tenureLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Relationship history</span>
          <span className="text-right text-white/90">
            {context.previousExchangesWithSources === 0
              ? "None"
              : `${context.previousExchangesWithSources} exchanges`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Reciprocal banter</span>
          <span className="text-white/90">
            {context.reciprocalBanterCases} cases
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Action</span>
          <span className="text-white/90">
            {decision.action === "gentle_group_redirect" ? "Redirect" : "None"}
          </span>
        </div>
      </div>
      <div className="border-t border-white/[0.06] bg-ink-850 px-5 py-3 text-xs text-white/50">
        {decision.reason}
      </div>
    </Panel>
  );
}

function TableCell({
  children,
  emphasis = false,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <td
      className={`px-4 py-2.5 text-sm ${
        emphasis ? "font-medium text-white" : "text-white/60"
      }`}
    >
      {children}
    </td>
  );
}

export function ContrastView() {
  const rows: Array<{
    label: string;
    maya: React.ReactNode;
    chris: React.ReactNode;
    mayaEmphasis?: boolean;
    chrisEmphasis?: boolean;
  }> = [
    { label: "Messages", maya: "Same", chris: "Same" },
    { label: "Convergence", maya: "5 → 1", chris: "5 → 1" },
    { label: "Legacy verdict", maya: "SAFE", chris: "SAFE" },
    { label: "Tenure", maya: "2 days", chris: "8 months" },
    { label: "Relationship history", maya: "None", chris: "Extensive" },
    {
      label: "TEMPER verdict",
      maya: "DOGPILE",
      chris: "BANTER",
      mayaEmphasis: true,
      chrisEmphasis: true,
    },
    { label: "Action", maya: "Redirect", chris: "None" },
  ];

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <Label>The contrast</Label>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Same words. Same pattern.
          <br />
          <span className="text-temper-gold">Different history.</span>
        </h2>
        <p className="mt-3 text-sm text-white/50">
          TEMPER remembers the difference.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContrastCard name="Maya" context={MAYA_CONTEXT} decision={MAYA_DECISION} />
        <ContrastCard
          name="Chris"
          context={CHRIS_CONTEXT}
          decision={CHRIS_DECISION}
        />
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="text-sm font-semibold text-white">
            Identical input, opposite decisions
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.14em] text-white/35">
                <th className="px-4 py-2.5 font-medium"></th>
                <th className="px-4 py-2.5 font-medium">Maya</th>
                <th className="px-4 py-2.5 font-medium">Chris</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="px-4 py-2.5 text-sm text-white/40">
                    {row.label}
                  </td>
                  <TableCell emphasis={row.mayaEmphasis}>{row.maya}</TableCell>
                  <TableCell emphasis={row.chrisEmphasis}>{row.chris}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-center text-xs text-white/35">
        Same five messages · same five members · different persistent history
      </p>
    </div>
  );
}
