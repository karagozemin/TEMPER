// SQLite connection singleton backed by Node's built-in `node:sqlite`
// (DatabaseSync). No native compilation and no external dependency, which
// keeps the demo runnable on any Node 22+ machine.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { migrate } from "@/lib/db/schema";

let db: DatabaseSync | null = null;

function resolveDbPath(): string {
  // Vercel's deployed filesystem is read-only. Even if a local-style
  // DATABASE_URL is configured in the project settings, it cannot point into
  // the deployment bundle; use the platform's writable temporary directory.
  if (process.env.VERCEL) {
    const dataDir = "/tmp/temper";
    fs.mkdirSync(dataDir, { recursive: true });
    return path.join(dataDir, "temper.db");
  }

  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv && fromEnv.length > 0) {
    // Accept both plain paths and file: URLs.
    const configured = fromEnv.replace(/^file:/, "");
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }

  const dataDir = path.join(process.cwd(), "data");
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
