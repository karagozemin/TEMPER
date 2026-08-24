// SQLite schema. SQLite stores deterministic application state only:
// members, interactions, convergence signals, incidents and outcomes.
// Minds remains the source of persistent SEMANTIC community context.

import type { DatabaseSync } from "node:sqlite";

export function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id               TEXT PRIMARY KEY,
      telegram_user_id TEXT UNIQUE NOT NULL,
      username         TEXT,
      first_seen_at    TEXT NOT NULL,
      last_seen_at     TEXT NOT NULL,
      message_count    INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id               TEXT PRIMARY KEY,
      source_member_id TEXT NOT NULL,
      target_member_id TEXT NOT NULL,
      message_id       TEXT NOT NULL,
      timestamp        TEXT NOT NULL,
      type             TEXT NOT NULL CHECK (type IN ('reply', 'mention')),
      text             TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_target_time
      ON interactions (target_member_id, timestamp);

    CREATE TABLE IF NOT EXISTS convergence_signals (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      target_member_id        TEXT NOT NULL,
      source_member_ids       TEXT NOT NULL, -- JSON array
      unique_source_count     INTEGER NOT NULL,
      window_seconds          INTEGER NOT NULL,
      recent_interaction_count INTEGER NOT NULL,
      detected_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id                     TEXT PRIMARY KEY,
      target_member_id       TEXT NOT NULL,
      source_member_ids      TEXT NOT NULL, -- JSON array
      status                 TEXT NOT NULL CHECK (status IN ('open','observing','recovered','escalating','dismissed')),
      verdict                TEXT NOT NULL CHECK (verdict IN ('dogpile','banter','observe')),
      confidence             REAL,
      detected_at            TEXT NOT NULL,
      intervention_type      TEXT,
      intervention_at        TEXT,
      follow_up_at           TEXT,
      resolved_at            TEXT,
      mind_reasoning_summary TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);

    CREATE TABLE IF NOT EXISTS incident_outcomes (
      incident_id               TEXT PRIMARY KEY,
      target_reengaged          INTEGER NOT NULL DEFAULT 0,
      repeat_convergence        INTEGER NOT NULL DEFAULT 0,
      escalation                INTEGER NOT NULL DEFAULT 0,
      outcome                   TEXT NOT NULL CHECK (outcome IN ('successful','neutral','failed')),
      evaluated_at              TEXT NOT NULL
    );
  `);
}
