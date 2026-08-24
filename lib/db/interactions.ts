// Interaction persistence + queries.

import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/client";
import type { Interaction, InteractionType } from "@/lib/types";

interface InteractionRow {
  id: string;
  source_member_id: string;
  target_member_id: string;
  message_id: string;
  timestamp: string;
  type: InteractionType;
  text: string | null;
}

function rowToInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    sourceMemberId: row.source_member_id,
    targetMemberId: row.target_member_id,
    messageId: row.message_id,
    timestamp: row.timestamp,
    type: row.type,
    text: row.text ?? undefined,
  };
}

export function insertInteraction(
  interaction: Interaction,
  db: DatabaseSync = getDb(),
): void {
  db.prepare(
    `INSERT INTO interactions (
       id, source_member_id, target_member_id, message_id, timestamp, type, text
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    interaction.id,
    interaction.sourceMemberId,
    interaction.targetMemberId,
    interaction.messageId,
    interaction.timestamp,
    interaction.type,
    interaction.text ?? null,
  );
}

export function listInteractions(
  sinceIso?: string,
  db: DatabaseSync = getDb(),
): Interaction[] {
  const rows = sinceIso
    ? (db
        .prepare("SELECT * FROM interactions WHERE timestamp > ? ORDER BY timestamp ASC")
        .all(sinceIso) as unknown as InteractionRow[])
    : (db
        .prepare("SELECT * FROM interactions ORDER BY timestamp ASC")
        .all() as unknown as InteractionRow[]);
  return rows.map(rowToInteraction);
}
