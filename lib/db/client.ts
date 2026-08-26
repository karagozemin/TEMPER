// SQLite connection singleton backed by Node's built-in `node:sqlite`
// (DatabaseSync). No native compilation and no external dependency, which
// keeps the demo runnable on any Node 22+ machine.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { migrate } from "@/lib/db/schema";

let db: DatabaseSync | null = null;

function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv && fromEnv.length > 0) {
    // Accept both plain paths and file: URLs.
    const configured = fromEnv.replace(/^file:/, "");
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }

  // Vercel's deployed filesystem is read-only except for /tmp. Keep the
  // local default convenient while allowing API routes to initialize there.
  const dataDir = process.env.VERCEL
    ? "/tmp/temper"
    : path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "temper.db");
}

export function getDb(): DatabaseSync {
  if (db) return db;

  const file = resolveDbPath();
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  return db;
}

/** Reset the singleton — used by tests and scripts that swap database paths. */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
