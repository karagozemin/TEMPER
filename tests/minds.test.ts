import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateDeterministic } from "@/lib/minds/deterministic";
import { parseMindDecision } from "@/lib/minds/schema";
import {
  CHRIS_CONTEXT,
  MAYA_CONTEXT,
  buildEvidencePacket,
} from "@/lib/demo/dataset";
import type { CommunityContext } from "@/lib/types";

test("integration A: Maya (newcomer) → dogpile", () => {
  const evidence = buildEvidencePacket("Maya", MAYA_CONTEXT.member.tenureDays);
  const decision = evaluateDeterministic(evidence, MAYA_CONTEXT);
  assert.equal(decision.verdict, "dogpile");
  assert.equal(decision.action, "gentle_group_redirect");
  assert.ok(decision.confidence > 0.8);
});

test("integration B: Chris (established) → banter", () => {
  const evidence = buildEvidencePacket("Chris", CHRIS_CONTEXT.member.tenureDays);
  const decision = evaluateDeterministic(evidence, CHRIS_CONTEXT);
  assert.equal(decision.verdict, "banter");
  assert.equal(decision.action, "none");
});

test("integration C: missing history → observe", () => {
  const evidence = buildEvidencePacket("Unknown", 15);
  const decision = evaluateDeterministic(evidence, null);
  assert.equal(decision.verdict, "observe");
  assert.equal(decision.action, "none");
});

test("integration C: ambiguous history → observe", () => {
  const ambiguous: CommunityContext = {
    member: { name: "Dana", tenureDays: 15 },
    previousExchangesWithSources: 5,
    reciprocalBanterCases: 0,
    comparableFriendlyPrecedents: 0,
    priorDisengagementAfterSimilar: false,
  };
  const evidence = buildEvidencePacket("Dana", 15);
  const decision = evaluateDeterministic(evidence, ambiguous);
  assert.equal(decision.verdict, "observe");
});

test("parseMindDecision accepts a valid payload", () => {
  const decision = parseMindDecision({
    verdict: "dogpile",
    confidence: 0.91,
    reason: "newcomer",
    action: "gentle_group_redirect",
    follow_up_minutes: 180,
  });
  assert.equal(decision.verdict, "dogpile");
  assert.equal(decision.followUpMinutes, 180);
});

test("parseMindDecision rejects an invalid payload", () => {
  assert.throws(() => parseMindDecision({ verdict: "dogpile" }));
});
