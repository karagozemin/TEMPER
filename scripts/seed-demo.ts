// Seeds the controlled demo dataset into SQLite.
// Usage: npm run seed

import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch {
  // .env is optional; defaults apply without it.
}

import { seedDemoData } from "../lib/demo/seed";

seedDemoData();
console.log("✓ Demo data seeded (temper-demo-community).");
