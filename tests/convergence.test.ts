import { test } from "node:test";
import assert from "node:assert/strict";
import { detectConvergence } from "@/lib/convergence/detector";
import type { Interaction } from "@/lib/types";

const NOW = Date.now();

function interaction(opts: {
  source: string;
  target: string;
  timestamp?: number;
  text?: string;
}): Interaction {
  return {
    id: Math.random().toString(36).slice(2),
    sourceMemberId: opts.source,
    targetMemberId: opts.target,
    messageId: Math.random().toString(36).slice(2),
    timestamp: new Date(opts.timestamp ?? NOW).toISOString(),
    type: "reply",
    text: opts.text,
  };
}

test("detects convergence: 5 unique sources → 1 target within window", () => {
  const sources = ["alex", "john", "sam", "mike", "ben"];
  const interactions = sources.map((s) => interaction({ source: s, target: "maya" }));
  const { signal } = detectConvergence("maya", interactions, NOW);
  assert.ok(signal);
  assert.equal(signal.uniqueSourceCount, 5);
});

test("no convergence below the minimum source threshold", () => {
  const interactions = ["alex", "john", "sam", "mike"].map((s) =>
    interaction({ source: s, target: "maya" }),
  );
  const { signal } = detectConvergence("maya", interactions, NOW);
  assert.equal(signal, null);
});

test("repeated source members count once", () => {
  const interactions = [
    interaction({ source: "alex", target: "maya" }),
    interaction({ source: "alex", target: "maya" }), // duplicate source
    interaction({ source: "john", target: "maya" }),
    interaction({ source: "sam", target: "maya" }),
    interaction({ source: "mike", target: "maya" }),
  ];
  // 4 unique sources → still below threshold
  const { signal } = detectConvergence("maya", interactions, NOW);
  assert.equal(signal, null);
});

test("duplicate messages from different users still count", () => {
  const text = "interesting take lol";
  const interactions = ["alex", "john", "sam", "mike", "ben"].map((s) =>
    interaction({ source: s, target: "maya", text }),
  );
  const { signal } = detectConvergence("maya", interactions, NOW);
  assert.ok(signal);
  assert.equal(signal.uniqueSourceCount, 5);
});

test("interactions outside the window do not count", () => {
  const old = NOW - 10 * 60 * 1000; // 10 minutes ago
  const interactions = ["alex", "john", "sam", "mike", "ben"].map((s) =>
    interaction({ source: s, target: "maya", timestamp: old }),
  );
  const { signal } = detectConvergence("maya", interactions, NOW);
  assert.equal(signal, null);
});

test("convergence is scoped to the target member", () => {
  const forMaya = ["alex", "john", "sam", "mike"].map((s) =>
    interaction({ source: s, target: "maya" }),
  );
  const forChris = ["alex", "john", "sam", "mike", "ben"].map((s) =>
    interaction({ source: s, target: "chris" }),
  );
  const { signal } = detectConvergence("chris", [...forMaya, ...forChris], NOW);
  assert.ok(signal);
  assert.equal(signal.targetMemberId, "chris");
});
