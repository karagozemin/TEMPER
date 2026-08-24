"use client";

import { LEGACY_FEED } from "@/lib/demo/dataset";
import { Panel, PanelHeader, Pill } from "@/components/ui";

export function LegacyFeed() {
  return (
    <Panel>
      <PanelHeader
        title="Legacy moderation"
        subtitle="message-level classification"
      />
      <div className="px-5 py-3">
        {LEGACY_FEED.map((row) => (
          <div
            key={row.author}
            className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2.5 last:border-0"
          >
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/70">{row.author}</div>
              <div className="truncate text-sm text-white/90">{row.text}</div>
            </div>
            <Pill tone="safe">{row.verdict}</Pill>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-xs text-white/40">
        <span>{LEGACY_FEED.length} messages</span>
        <span className="text-white/60">0 violations</span>
      </div>
    </Panel>
  );
}
