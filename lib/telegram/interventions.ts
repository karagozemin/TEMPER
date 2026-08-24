// Intervention layer (PRD section 20). The MVP has exactly one autonomous
// action: a gentle group redirect. It interrupts convergence without publicly
// accusing specific members.

import type { Bot } from "grammy";

export function buildGentleRedirect(targetName: string): string {
  return (
    "Let's keep this one constructive. Several replies are converging on the " +
    `same person, and ${targetName} is still new here.`
  );
}

export async function sendGentleRedirect(
  bot: Bot,
  chatId: string | number,
  targetName: string,
): Promise<boolean> {
  try {
    await bot.api.sendMessage(chatId, buildGentleRedirect(targetName));
    return true;
  } catch {
    // Delivery failures are surfaced in the dashboard; the incident remains
    // open and the intervention is never falsely marked as sent.
    return false;
  }
}
