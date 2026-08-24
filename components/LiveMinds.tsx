"use client";

import { useCallback, useEffect, useState } from "react";
import { CHRIS_EVIDENCE, MAYA_EVIDENCE } from "@/lib/demo/dataset";
import {
  Button,
  Fact,
  Label,
  Panel,
  PanelHeader,
  Pill,
  type Tone,
} from "@/components/ui";

type Verdict = "dogpile" | "banter" | "observe";
type Source = "minds" | "deterministic-demo" | "unavailable";
type Action = "gentle_group_redirect" | "none";

interface Decision {
  verdict: Verdict;
  confidence: number;
  reason: string;
  action: Action;
  followUpMinutes: number | null;
}

interface AnalyzeResponse {
  source: Source;
  decision: Decision | null;
  unavailableReason: string | null;
}

interface HistoryEntry {
  fingerprint: string;
  sender: "human" | "mind";
  text: string;
  at?: string;
}

interface HistoryResponse {
  source: Source;
  history: HistoryEntry[];
  error?: string;
}

const VERDICT_TONE: Record<Verdict, Tone> = {
  dogpile: "dogpile",
  banter: "banter",
  observe: "observe",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  dogpile: "Dogpile",
  banter: "Banter",
  observe: "Observe",
};

const SOURCE_LABEL: Record<Source, string> = {
  minds: "Live Minds",
  "deterministic-demo": "Demo mode",
  unavailable: "Unavailable",
};

const SOURCE_TONE: Record<Source, Tone> = {
  minds: "recovered",
  "deterministic-demo": "gold",
  unavailable: "neutral",
};

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function extractDecision(text: string): Decision | null {
  const clean = stripHtml(text).trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(clean.slice(start, end + 1)) as Partial<Decision>;
    if (
      parsed &&
      typeof parsed.verdict === "string" &&
      typeof parsed.confidence === "number"
    ) {
      return parsed as Decision;
    }
    return null;
  } catch {
    return null;
  }
}

function humanSummary(text: string): string {
  const name = text.match(/name: (\w+)/)?.[1];
  const tenure = text.match(/tenure in community: (\d+) days/)?.[1];
  if (name) {
    return `Convergence evidence submitted for ${name}${
      tenure ? ` — ${tenure} days in the community` : ""
    }.`;
  }
  const firstLine = stripHtml(text).split("\n")[0] ?? "";
  return firstLine.length > 140 ? `${firstLine.slice(0, 140)}…` : firstLine;
}

function ResultCard({ name, res }: { name: string; res: AnalyzeResponse }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-white">{name}</div>
        <Pill tone={SOURCE_TONE[res.source]}>{SOURCE_LABEL[res.source]}</Pill>
      </div>

      {res.decision ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              Verdict
            </span>
            <Pill tone={VERDICT_TONE[res.decision.verdict]}>
              {VERDICT_LABEL[res.decision.verdict]}
            </Pill>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              Confidence
            </span>
            <span className="font-mono text-sm text-violet-300">
              {(res.decision.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              Action
            </span>
            <span className="text-sm text-white/85">
              {res.decision.action === "gentle_group_redirect"
                ? "Gentle redirect"
                : "None"}
            </span>
          </div>
          <p className="border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-white/55">
            {res.decision.reason}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-amber-300/80">
          {res.unavailableReason ?? "No decision returned."}
        </p>
      )}
    </Panel>
  );
}

export function LiveMinds() {
  const [source, setSource] = useState<Source | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ name: string; res: AnalyzeResponse }>>([]);
  const [running, setRunning] = useState<"Maya" | "Chris" | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/minds/history");
      const data = (await res.json()) as HistoryResponse;
      setSource(data.source);
      setHistory(Array.isArray(data.history) ? data.history : []);
      setHistoryError(data.error ?? null);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Failed to reach the API");
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  async function run(name: "Maya" | "Chris") {
    setRunning(name);
    try {
      const evidence = name === "Maya" ? MAYA_EVIDENCE : CHRIS_EVIDENCE;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evidence),
      });
      const data = (await res.json()) as AnalyzeResponse;
      setResults((prev) => [
        ...prev.filter((r) => r.name !== name),
        { name, res: data },
      ]);
      await refreshHistory();
    } catch (error) {
      setResults((prev) => [
        ...prev.filter((r) => r.name !== name),
        {
          name,
          res: {
            source: "unavailable",
            decision: null,
            unavailableReason:
              error instanceof Error ? error.message : "Request failed",
          },
        },
      ]);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Live Minds</Label>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Real Minds connection
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Run the analysis against the live Mind, then read the persistent
          conversation history behind it.
        </p>
      </div>

      <Panel>
        <PanelHeader title="Connection" subtitle="same alias → same Mind" />
        <div className="px-5 py-4">
          <Fact
            label="Source"
            value={
              source ? (
                <Pill tone={SOURCE_TONE[source]}>{SOURCE_LABEL[source]}</Pill>
              ) : (
                "Checking…"
              )
            }
            accent
          />
          <Fact label="Alias" value="temper-demo-community" />
          <Fact
            label="Flow"
            value="ensureConversation → sendMessage → waitForReply → getHistory"
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Run live analysis"
          subtitle="submits identical evidence for both members"
        />
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <Button
            onClick={() => run("Maya")}
            disabled={running !== null}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running === "Maya" ? "Waiting for Mind…" : "Analyze Maya"}
          </Button>
          <Button
            onClick={() => run("Chris")}
            disabled={running !== null}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running === "Chris" ? "Waiting for Mind…" : "Analyze Chris"}
          </Button>
        </div>
      </Panel>

      {(results.length > 0 || running) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {results.map(({ name, res }) => (
            <ResultCard key={name} name={name} res={res} />
          ))}
          {running && (
            <Panel className="flex items-center justify-center p-10">
              <span className="text-sm text-white/40">
                Asking the Mind… (can take a moment)
              </span>
            </Panel>
          )}
        </div>
      )}

      <Panel>
        <PanelHeader
          title="Persistent conversation history"
          subtitle="proof that memory persists across requests"
        />
        <div className="px-5 py-4">
          {history.length === 0 ? (
            <p className="text-sm text-white/40">
              {historyError
                ? `History unavailable: ${historyError}`
                : "No conversation yet — run an analysis first."}
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {history.map((entry) => {
                if (entry.sender === "mind") {
                  const decision = extractDecision(entry.text);
                  if (decision) {
                    return (
                      <li key={entry.fingerprint} className="py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill tone="purple">Mind</Pill>
                          <Pill tone={VERDICT_TONE[decision.verdict]}>
                            {VERDICT_LABEL[decision.verdict]}
                          </Pill>
                          <span className="font-mono text-xs text-white/45">
                            {(decision.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/75">
                          {decision.reason}
                        </p>
                      </li>
                    );
                  }
                  return (
                    <li key={entry.fingerprint} className="py-3.5">
                      <Pill tone="purple">Mind</Pill>
                      <p className="mt-2 whitespace-pre-wrap text-xs text-white/50">
                        {stripHtml(entry.text)}
                      </p>
                    </li>
                  );
                }
                return (
                  <li key={entry.fingerprint} className="py-3.5">
                    <div className="flex items-center gap-2">
                      <Pill tone="neutral">Evidence</Pill>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/40">
                      {humanSummary(entry.text)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
}
