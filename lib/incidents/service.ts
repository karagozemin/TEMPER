// Incident persistence service (PRD section 6.3 / 15). Thin, synchronous
// wrapper over SQLite using better-sqlite3.

import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/client";
import type {
  Incident,
  IncidentOutcome,
  IncidentStatus,
  Verdict,
} from "@/lib/types";

interface IncidentRow {
  id: string;
  target_member_id: string;
  source_member_ids: string;
  status: IncidentStatus;
  verdict: Verdict;
  confidence: number | null;
  detected_at: string;
  intervention_type: string | null;
  intervention_at: string | null;
  follow_up_at: string | null;
  resolved_at: string | null;
  mind_reasoning_summary: string | null;
}

function rowToIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    targetMemberId: row.target_member_id,
    sourceMemberIds: JSON.parse(row.source_member_ids) as string[],
    status: row.status,
    verdict: row.verdict,
    confidence: row.confidence ?? undefined,
    detectedAt: row.detected_at,
    interventionType:
      (row.intervention_type as Incident["interventionType"]) ?? undefined,
    interventionAt: row.intervention_at ?? undefined,
    followUpAt: row.follow_up_at ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    mindReasoningSummary: row.mind_reasoning_summary ?? undefined,
  };
}

export function listIncidents(db: DatabaseSync = getDb()): Incident[] {
  const rows = db
    .prepare("SELECT * FROM incidents ORDER BY detected_at DESC")
    .all() as unknown as IncidentRow[];
  return rows.map(rowToIncident);
}

export function getIncident(
  id: string,
  db: DatabaseSync = getDb(),
): Incident | null {
  const row = db
    .prepare("SELECT * FROM incidents WHERE id = ?")
    .get(id) as unknown as IncidentRow | undefined;
  return row ? rowToIncident(row) : null;
}

export interface CreateIncidentInput {
  id?: string;
  targetMemberId: string;
  sourceMemberIds: string[];
  verdict: Verdict;
  confidence?: number;
  detectedAt?: string;
  mindReasoningSummary?: string;
}

export function createIncident(
  input: CreateIncidentInput,
  db: DatabaseSync = getDb(),
): Incident {
  const id =
    input.id ??
    `INC-${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
  const detectedAt = input.detectedAt ?? new Date().toISOString();

  db.prepare(
    `INSERT INTO incidents (
       id, target_member_id, source_member_ids, status, verdict,
       confidence, detected_at, mind_reasoning_summary
     ) VALUES (?, ?, ?, 'open', ?, ?, ?, ?)`,
  ).run(
    id,
    input.targetMemberId,
    JSON.stringify(input.sourceMemberIds),
    input.verdict,
    input.confidence ?? null,
    detectedAt,
    input.mindReasoningSummary ?? null,
  );

  return getIncident(id, db) as Incident;
}

export interface UpdateIncidentInput {
  status?: IncidentStatus;
  interventionType?: Incident["interventionType"];
  interventionAt?: string;
  followUpAt?: string;
  resolvedAt?: string;
  mindReasoningSummary?: string;
}

export function updateIncident(
  id: string,
  patch: UpdateIncidentInput,
  db: DatabaseSync = getDb(),
): Incident | null {
  const existing = getIncident(id, db);
  if (!existing) return null;

  const next: Incident = {
    ...existing,
    status: patch.status ?? existing.status,
    interventionType: patch.interventionType ?? existing.interventionType,
    interventionAt: patch.interventionAt ?? existing.interventionAt,
    followUpAt: patch.followUpAt ?? existing.followUpAt,
    resolvedAt: patch.resolvedAt ?? existing.resolvedAt,
    mindReasoningSummary:
      patch.mindReasoningSummary ?? existing.mindReasoningSummary,
  };

  db.prepare(
    `UPDATE incidents SET
       status = ?,
       intervention_type = ?,
       intervention_at = ?,
       follow_up_at = ?,
       resolved_at = ?,
       mind_reasoning_summary = ?
     WHERE id = ?`,
  ).run(
    next.status,
    next.interventionType ?? null,
    next.interventionAt ?? null,
    next.followUpAt ?? null,
    next.resolvedAt ?? null,
    next.mindReasoningSummary ?? null,
    id,
  );

  return next;
}

export function recordOutcome(
  outcome: IncidentOutcome,
  db: DatabaseSync = getDb(),
): void {
  db.prepare(
    `INSERT INTO incident_outcomes (
       incident_id, target_reengaged, repeat_convergence, escalation,
       outcome, evaluated_at
     ) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(incident_id) DO UPDATE SET
       target_reengaged = excluded.target_reengaged,
       repeat_convergence = excluded.repeat_convergence,
       escalation = excluded.escalation,
       outcome = excluded.outcome,
       evaluated_at = excluded.evaluated_at`,
  ).run(
    outcome.incidentId,
    outcome.targetReengaged ? 1 : 0,
    outcome.repeatConvergenceDetected ? 1 : 0,
    outcome.escalationDetected ? 1 : 0,
    outcome.outcome,
    outcome.evaluatedAt,
  );
}

export function listOutcomes(
  db: DatabaseSync = getDb(),
): IncidentOutcome[] {
  const rows = db
    .prepare("SELECT * FROM incident_outcomes ORDER BY evaluated_at DESC")
    .all() as unknown as Array<{
    incident_id: string;
    target_reengaged: number;
    repeat_convergence: number;
    escalation: number;
    outcome: IncidentOutcome["outcome"];
    evaluated_at: string;
  }>;

  return rows.map((row) => ({
    incidentId: row.incident_id,
    targetReengaged: row.target_reengaged === 1,
    repeatConvergenceDetected: row.repeat_convergence === 1,
    escalationDetected: row.escalation === 1,
    outcome: row.outcome,
    evaluatedAt: row.evaluated_at,
  }));
}
