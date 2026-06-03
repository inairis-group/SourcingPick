"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AttachmentContext,
  NotificationType,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { storeAttachments } from "@/lib/storage/attachments";
import { onSupportMessageSent } from "@/lib/support/lifecycle";
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

/**
 * Variant that accepts attachments via FormData. Attachments-only messages
 * (no body) are allowed when at least one file is included. Attachments
 * land in the polymorphic Attachment table with contextType=MESSAGE.
 *
 * On a partial-failure during attachment storage we still keep the message
 * — bad files come back in `errors`. Surfacing them as a warning is
 * preferable to deleting a sent message because one of three pictures was
 * too big.
 */
export async function sendMessageWithAttachmentsAction(
  formData: FormData,
): Promise<SendMessageResult & { warnings?: string[] }> {
  const threadId = String(formData.get("threadId") ?? "");
  const rawBody = String(formData.get("body") ?? "").trim();
  const files = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!threadId) {
    return { ok: false, error: "Missing thread." };
  }
  if (rawBody.length === 0 && files.length === 0) {
    return { ok: false, error: "Type a message or attach a file." };
  }
  if (rawBody.length > 5000) {
    return { ok: false, error: "Message too long." };
  }

  const user = await requireAuth();
  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId: user.id } },
    select: { threadId: true },
  });
  if (!participant) {
    return { ok: false, error: "You're not a participant of this thread." };
  }

  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        threadId,
        authorUserId: user.id,
        // Empty-body attachment messages get a single-space placeholder so
        // any downstream renderer that expects non-empty doesn't choke.
        body: rawBody.length > 0 ? rawBody : " ",
      },
      select: { id: true, createdAt: true },
    });
    await tx.thread.update({
      where: { id: threadId },
      data: { lastMessageAt: now },
    });
    await tx.threadParticipant.updateMany({
      where: { threadId, userId: { not: user.id } },
      data: { unreadCount: { increment: 1 } },
    });
    await tx.threadParticipant.update({
      where: { threadId_userId: { threadId, userId: user.id } },
      data: { lastReadAt: now },
    });
    return msg;
  });

  const { errors: attachmentErrors } =
    files.length > 0
      ? await storeAttachments({
          contextType: AttachmentContext.MESSAGE,
          contextId: message.id,
          uploaderId: user.id,
          files,
        })
      : { errors: [] };

  notifyThread(threadId, {
    type: "message",
    messageId: message.id,
    threadId,
    authorUserId: user.id,
    createdAt: message.createdAt.toISOString(),
  }).catch(() => {});

  // Support tickets auto-track conversation: admin → flip PENDING → OPEN,
  // requester → reopen RESOLVED tickets.
  await onSupportMessageSent({
    threadId,
    authorUserId: user.id,
    authorRole: user.role,
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "message.sent",
    targetType: "Thread",
    targetId: threadId,
    payload: {
      messageId: message.id,
      attachments: files.length,
      attachmentErrors,
    },
  });

  prisma.threadParticipant
    .findMany({
      where: { threadId, userId: { not: user.id } },
      select: {
        userId: true,
        thread: { select: { contextType: true, contextId: true } },
      },
    })
    .then(async (rows) => {
      if (rows.length === 0) return;
      const ctx = rows[0]!.thread;
      const snippet = (rawBody || (files.length > 0 ? `(${files.length} attachment${files.length > 1 ? "s" : ""})` : "")).slice(0, 80);
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
    .catch(() => {});

  revalidatePath("/[lang]", "layout");

  return {
    ok: true,
    messageId: message.id,
    ...(attachmentErrors.length > 0 ? { warnings: attachmentErrors } : {}),
  };
}

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

  // Support ticket lifecycle hook — same as the attachments variant.
  await onSupportMessageSent({
    threadId: parsed.data.threadId,
    authorUserId: user.id,
    authorRole: user.role,
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
