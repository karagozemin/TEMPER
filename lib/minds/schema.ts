// Structured decision contract (PRD section 19). The response schema is
// validated before the application trusts it.

import { z } from "zod";
import type { MindDecision } from "@/lib/types";

export const mindDecisionSchema = z.object({
  verdict: z.enum(["dogpile", "banter", "observe"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
  action: z.enum(["gentle_group_redirect", "none"]),
  follow_up_minutes: z.number().int().positive().nullable(),
});

/**
 * Parse and normalize a raw Minds response into the application's
 * MindDecision shape. Throws if the schema does not match — the caller must
 * treat an invalid response as a failure, never as a verdict.
 */
export function parseMindDecision(raw: unknown): MindDecision {
  const parsed = mindDecisionSchema.parse(raw);
  return {
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    reason: parsed.reason,
    action: parsed.action,
    followUpMinutes: parsed.follow_up_minutes,
  };
}
