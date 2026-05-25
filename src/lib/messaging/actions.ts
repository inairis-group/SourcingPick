"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NotificationType, ThreadContextType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { canAccessThreadContext } from "./participants";
import { getOrCreateThread } from "./threads";
import { notifyThread } from "./pubsub";

// =============================================================
// Open or lazy-create a thread for a context (returns thread id)
// =============================================================

export type OpenThreadResult =
  | { ok: true; threadId: string }
  | { ok: false; error: string };

export async function openThreadAction(
  contextType: ThreadContextType,
  contextId: string,
): Promise<OpenThreadResult> {
  const user = await requireAuth();
  const ok = await canAccessThreadContext(contextType, contextId, user);
  if (!ok) return { ok: false, error: "You don't have access to this thread." };

  const thread = await getOrCreateThread(contextType, contextId, user.id);
  return { ok: true, threadId: thread.id };
}

// =============================================================
// Send a message into a thread
// =============================================================

const MessageSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().trim().min(1, "Message can't be empty.").max(5000),
});

export type SendMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

export async function sendMessageAction(
  threadId: string,
  body: string,
): Promise<SendMessageResult> {
  const parsed = MessageSchema.safeParse({ threadId, body });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await requireAuth();

  const participant = await prisma.threadParticipant.findUnique({
    where: {
      threadId_userId: { threadId: parsed.data.threadId, userId: user.id },
    },
    select: { threadId: true },
  });
  if (!participant) {
    return { ok: false, error: "You're not a participant of this thread." };
  }

  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        threadId: parsed.data.threadId,
        authorUserId: user.id,
        body: parsed.data.body,
      },
      select: { id: true, createdAt: true },
    });
    await tx.thread.update({
      where: { id: parsed.data.threadId },
      data: { lastMessageAt: now },
    });
    // Bump unread for everyone else, mark author as read.
    await tx.threadParticipant.updateMany({
      where: { threadId: parsed.data.threadId, userId: { not: user.id } },
      data: { unreadCount: { increment: 1 } },
    });
    await tx.threadParticipant.update({
      where: {
        threadId_userId: { threadId: parsed.data.threadId, userId: user.id },
      },
      data: { lastReadAt: now },
    });
    return msg;
  });

  // Fire-and-forget the realtime push.
  notifyThread(parsed.data.threadId, {
    type: "message",
    messageId: message.id,
    threadId: parsed.data.threadId,
    authorUserId: user.id,
    createdAt: message.createdAt.toISOString(),
  }).catch(() => {
    /* SSE consumers will pick up the message on their next poll/refresh */
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "message.sent",
    targetType: "Thread",
    targetId: parsed.data.threadId,
    payload: { messageId: message.id },
  });

  // Notify other thread participants. We keep this fire-and-forget so a
  // slow notifications path doesn't delay the action response.
  prisma.threadParticipant
    .findMany({
      where: {
        threadId: parsed.data.threadId,
        userId: { not: user.id },
      },
      select: { userId: true, thread: { select: { contextType: true, contextId: true } } },
    })
    .then(async (rows) => {
      if (rows.length === 0) return;
      const ctx = rows[0]!.thread;
      const snippet = parsed.data.body.slice(0, 80);
      await emitNotificationToMany(
        rows.map((r) => r.userId),
        {
          type: NotificationType.MESSAGE_MENTION,
          vars: { title: snippet },
          contextType: ctx.contextType,
          contextId: ctx.contextId,
        },
      );
    })
    .catch(() => {
      /* notification failure shouldn't block the message */
    });

  return { ok: true, messageId: message.id };
}

// =============================================================
// Mark thread as read for the actor
// =============================================================

export type MarkReadResult = { ok: true } | { ok: false; error: string };

export async function markThreadReadAction(
  threadId: string,
): Promise<MarkReadResult> {
  const user = await requireAuth();
  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId: user.id } },
    select: { threadId: true },
  });
  if (!participant) return { ok: false, error: "Not a participant." };

  await prisma.threadParticipant.update({
    where: { threadId_userId: { threadId, userId: user.id } },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });

  revalidatePath("/[lang]", "layout");
  return { ok: true };
}
