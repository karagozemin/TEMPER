import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateFollowUp } from "@/lib/incidents/follow-up";
import type { Interaction } from "@/lib/types";

function interaction(source: string, target: string, at: number): Interaction {
  return {
    id: Math.random().toString(36).slice(2),
    sourceMemberId: source,
    targetMemberId: target,
    messageId: Math.random().toString(36).slice(2),
    timestamp: new Date(at).toISOString(),
    type: "reply",
  };
}

test("integration D: re-engaged + no repeat convergence → recovered", () => {
  const now = Date.now();
  const since = new Date(now - 3 * 60 * 60 * 1000).toISOString(); // 3h ago
  const interactions = [
    // Maya (the target) sends a message afterwards — re-engagement.
    interaction("maya", "alex", now - 60 * 1000),
  ];

  const { outcome, nextStatus } = evaluateFollowUp(
    "INC-014",
    "maya",
    interactions,
    since,
    now,
  );

  assert.equal(outcome.targetReengaged, true);
  assert.equal(outcome.repeatConvergenceDetected, false);
  assert.equal(outcome.outcome, "successful");
  assert.equal(nextStatus, "recovered");
});

test("integration E: repeat convergence → escalating", () => {
  const now = Date.now();
  const since = new Date(now - 60 * 60 * 1000).toISOString(); // 1h ago
  const sources = ["alex", "john", "sam", "mike", "ben"];
  const interactions = sources.map((s) =>
    interaction(s, "maya", now - 30 * 1000),
  );

  const { outcome, nextStatus } = evaluateFollowUp(
    "INC-015",
    "maya",
    interactions,
    since,
    now,
  );

  assert.equal(outcome.repeatConvergenceDetected, true);
  assert.equal(outcome.outcome, "failed");
  assert.equal(nextStatus, "escalating");
});
