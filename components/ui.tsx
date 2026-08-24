import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-ink-900/80 ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-white/[0.06] px-5 py-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      {subtitle ? (
        <div className="mt-0.5 text-xs text-white/40">{subtitle}</div>
      ) : null}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
      {children}
    </div>
  );
}

export type Tone =
  | "dogpile"
  | "banter"
  | "observe"
  | "safe"
  | "recovered"
  | "escalating"
  | "purple"
  | "gold"
  | "neutral";

const toneClasses: Record<Tone, string> = {
  dogpile: "border-red-500/25 bg-red-500/10 text-red-300",
  banter: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  observe: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  safe: "border-white/10 bg-white/[0.04] text-white/50",
  recovered: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  escalating: "border-red-500/25 bg-red-500/10 text-red-300",
  purple: "border-violet-500/25 bg-violet-500/10 text-violet-300",
  gold: "border-amber-300/20 bg-amber-300/10 text-[#e2c184]",
  neutral: "border-white/10 bg-white/[0.04] text-white/60",
};

export function Pill({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Fact({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-2.5 last:border-0">
      <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      <span
        className={`text-right text-sm ${accent ? "font-medium text-white" : "text-white/85"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink-850 px-4 py-4 text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
    </div>
  );
}
