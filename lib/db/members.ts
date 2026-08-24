// Member persistence. Member.id is the canonical identifier; for live Telegram
// traffic it equals the Telegram user id string. For the seeded demo it is the
// display name lower-cased ("maya", "chris", "alex", …).

import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/client";
import type { Member } from "@/lib/types";

interface MemberRow {
  id: string;
  telegram_user_id: string;
  username: string | null;
  first_seen_at: string;
  last_seen_at: string;
  message_count: number;
}

function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    telegramUserId: row.telegram_user_id,
    username: row.username ?? undefined,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    messageCount: row.message_count,
  };
}

export function getMemberById(
  id: string,
  db: DatabaseSync = getDb(),
): Member | null {
  const row = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(id) as unknown as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export interface UpsertMemberInput {
  id: string;
  telegramUserId?: string;
  username?: string;
}

/**
 * Record that a member was seen. Creates the member on first sight and bumps
 * lastSeenAt / messageCount on subsequent messages.
 */
export function touchMember(
  input: UpsertMemberInput,
  db: DatabaseSync = getDb(),
): Member {
  const nowIso = new Date().toISOString();
  const telegramUserId = input.telegramUserId ?? input.id;
  const existing = getMemberById(input.id, db);

  if (existing) {
    db.prepare(
      `UPDATE members SET
         last_seen_at = ?,
         message_count = message_count + 1,
         username = COALESCE(?, username)
       WHERE id = ?`,
    ).run(nowIso, input.username ?? null, input.id);
    return getMemberById(input.id, db) as Member;
  }

  db.prepare(
    `INSERT INTO members (
       id, telegram_user_id, username, first_seen_at, last_seen_at, message_count
     ) VALUES (?, ?, ?, ?, ?, 1)`,
  ).run(input.id, telegramUserId, input.username ?? null, nowIso, nowIso);

  return getMemberById(input.id, db) as Member;
}

export function listMembers(db: DatabaseSync = getDb()): Member[] {
  const rows = db
    .prepare("SELECT * FROM members ORDER BY first_seen_at ASC")
    .all() as unknown as MemberRow[];
  return rows.map(rowToMember);
}
