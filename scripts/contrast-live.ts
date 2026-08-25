// Runs the live Maya/Chris contrast against real Minds.
// Usage: npm run contrast

import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch {
  // .env is optional; the script errors clearly if the key is missing.
}

import { runLiveContrast } from "../lib/minds/contrast";

async function main(): Promise<void> {
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY;
  const mindId = process.env.TEMPER_MIND_ID;

  if (!builderApiKey) throw new Error("MINDS_BUILDER_API_KEY is not set");
  if (!mindId) throw new Error("TEMPER_MIND_ID is not set");

  const { createMindsClient } = await import(
    "@animocabrands/minds-client-lib"
  );
  const client = createMindsClient({ builderApiKey });
  console.log(`Running live contrast against Mind ${mindId}…\n`);

  const results = await runLiveContrast(client, mindId);

  for (const r of results) {
    console.log(`${r.name} (alias: ${r.alias})`);
    if (r.verdict) {
      console.log(
        `  verdict:  ${r.verdict} (${((r.confidence ?? 0) * 100).toFixed(0)}%)`,
      );
      console.log(`  action:   ${r.action}`);
      console.log(`  reason:   ${r.reason}`);
    } else {
      console.log(`  ERROR:    ${r.error}`);
    }
    console.log();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
