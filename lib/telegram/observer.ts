// Telegram observer — converts raw group messages into structured interaction
// events (PRD section 42, Phase 1). Captures reply edges and text mentions.

import type { Message } from "grammy/types";
import type { Interaction, InteractionType } from "@/lib/types";

export function interactionFromMessage(msg: Message): Interaction | null {
  const from = msg.from;
  if (!from) return null;

  const sourceMemberId = String(from.id);
  const messageId = String(msg.message_id);
  const text = msg.text ?? msg.caption ?? undefined;
  const timestamp = new Date((msg.date ?? 0) * 1000).toISOString();

  let targetMemberId: string | null = null;
  let type: InteractionType = "mention";

  // 1) Direct reply edge — strongest signal.
  const reply = msg.reply_to_message;
  if (reply?.from) {
    targetMemberId = String(reply.from.id);
    type = "reply";
  } else if (text && msg.entities) {
    // 2) Text mention.
    for (const entity of msg.entities) {
      if (entity.type === "text_mention" && entity.user) {
        targetMemberId = String(entity.user.id);
        type = "mention";
        break;
      }
    }
  }

  if (!targetMemberId) return null;
  if (targetMemberId === sourceMemberId) return null; // no self-convergence

  return {
    id: `${messageId}-${type}-${targetMemberId}`,
    sourceMemberId,
    targetMemberId,
    messageId,
    timestamp,
    type,
    text,
  };
}
