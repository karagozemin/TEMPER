// Seeds the controlled demo dataset into SQLite (PRD section 29). Used by the
// dashboard (via /api/demo/seed) and the `npm run seed` script.

import { getDb } from "@/lib/db/client";
import {
  DEMO_MESSAGES,
  DEMO_SOURCES,
  INCIDENT_014,
  INCIDENT_014_OUTCOME,
} from "@/lib/demo/dataset";

const DAY = 86_400_000;
const HOUR = 3_600_000;

export function seedDemoData(): void {
  const db = getDb();
  const now = Date.now();

  const insertMember = db.prepare(`
    INSERT INTO members (
      id, telegram_user_id, username, first_seen_at, last_seen_at, message_count
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      first_seen_at = excluded.first_seen_at,
      last_seen_at = excluded.last_seen_at,
      message_count = excluded.message_count
  `);

  const insertInteraction = db.prepare(`
    INSERT INTO interactions (
      id, source_member_id, target_member_id, message_id, timestamp, type, text
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  const insertIncident = db.prepare(`
    INSERT INTO incidents (
      id, target_member_id, source_member_ids, status, verdict, confidence,
      detected_at, intervention_type, intervention_at, follow_up_at,
      resolved_at, mind_reasoning_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      resolved_at = excluded.resolved_at,
      intervention_type = excluded.intervention_type,
      intervention_at = excluded.intervention_at,
      follow_up_at = excluded.follow_up_at
  `);

  const insertOutcome = db.prepare(`
    INSERT INTO incident_outcomes (
      incident_id, target_reengaged, repeat_convergence, escalation,
      outcome, evaluated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(incident_id) DO UPDATE SET
      target_reengaged = excluded.target_reengaged,
      repeat_convergence = excluded.repeat_convergence,
      escalation = excluded.escalation,
      outcome = excluded.outcome,
      evaluated_at = excluded.evaluated_at
  `);

  db.exec("BEGIN");
  try {
    // Maya — two days in the community.
    insertMember.run(
      "maya",
      "maya",
      "Maya",
      new Date(now - 2 * DAY).toISOString(),
      new Date(now - 5 * HOUR).toISOString(),
      3,
    );

    // Chris — ~8 months in the community.
    insertMember.run(
      "chris",
      "chris",
      "Chris",
      new Date(now - 243 * DAY).toISOString(),
      new Date(now - 30 * 60 * 1000).toISOString(),
      47,
    );

    DEMO_SOURCES.forEach((name, index) => {
      insertMember.run(
        name.toLowerCase(),
        name.toLowerCase(),
        name,
        new Date(now - 120 * DAY).toISOString(),
        new Date(now - 10 * 60 * 1000).toISOString(),
        40 + index,
      );
    });

    // Five sources → Maya within 93 seconds.
    const base = now - 5 * HOUR;
    DEMO_SOURCES.forEach((name, index) => {
      insertInteraction.run(
        `demo-maya-${index}`,
        name.toLowerCase(),
        "maya",
        `demo-msg-${index}`,
        new Date(base + index * 18_000).toISOString(),
        "reply",
        DEMO_MESSAGES[index],
      );
    });

    insertIncident.run(
      INCIDENT_014.id,
      INCIDENT_014.targetMemberId,
      JSON.stringify(INCIDENT_014.sourceMemberIds),
      INCIDENT_014.status,
      INCIDENT_014.verdict,
      INCIDENT_014.confidence ?? null,
      INCIDENT_014.detectedAt,
      INCIDENT_014.interventionType ?? null,
      INCIDENT_014.interventionAt ?? null,
      INCIDENT_014.followUpAt ?? null,
      INCIDENT_014.resolvedAt ?? null,
      INCIDENT_014.mindReasoningSummary ?? null,
    );

    insertOutcome.run(
      INCIDENT_014_OUTCOME.incidentId,
      INCIDENT_014_OUTCOME.targetReengaged ? 1 : 0,
      INCIDENT_014_OUTCOME.repeatConvergenceDetected ? 1 : 0,
      INCIDENT_014_OUTCOME.escalationDetected ? 1 : 0,
      INCIDENT_014_OUTCOME.outcome,
      INCIDENT_014_OUTCOME.evaluatedAt,
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
