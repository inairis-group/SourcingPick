import "server-only";
import {
  NotificationType,
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import {
  parseInboundAddress,
  stripQuotedReply,
  type InboundTarget,
} from "./inbound-address";

/**
 * Ingest a reply that arrived by email.
 *
 * Two things decide where it goes, and neither is the sender's address:
 *
 *  1. The signed recipient token (see `inbound-address.ts`) says which
 *     conversation this belongs to and proves it came from a mail we sent.
 *  2. The Message-ID dedupes provider retries.
 *
 * Everything else — display name, From, Subject — is decoration we don't
 * trust for routing.
 */

export type InboundEmailInput = {
  /// Envelope recipients. Providers vary in which field carries the real
  /// delivery address, so callers pass every candidate and we take the first
  /// that verifies.
  recipients: string[];
  /// Provider Message-ID. Absent means we can't dedupe, so we synthesise one
  /// from the content rather than refusing an otherwise-valid message.
  messageId?: string | null;
  text?: string | null;
  html?: string | null;
};

export type InboundResult =
  | { ok: true; target: InboundTarget; deduped?: true }
  | { ok: false; reason: "unroutable" | "empty" | "not_found" };

const MAX_BODY = 10_000;

/** Crude HTML → text, used only when a provider sends no plain part. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n");
}

export async function handleInboundEmail(
  input: InboundEmailInput,
): Promise<InboundResult> {
  const target = input.recipients
    .map((r) => parseInboundAddress(r))
    .find((t): t is InboundTarget => t !== null);
  if (!target) return { ok: false, reason: "unroutable" };

  const raw = input.text?.trim()
    ? input.text
    : input.html
      ? htmlToText(input.html)
      : "";
  const body = stripQuotedReply(raw).slice(0, MAX_BODY);
  if (!body) return { ok: false, reason: "empty" };

  // Dedupe before writing. A synthesised id still collapses identical retries
  // of the same content to the same conversation, which is the case that
  // actually happens.
  const messageId =
    input.messageId?.trim() ||
    `synth:${target.kind}.${target.id}:${body.slice(0, 200)}`;

  try {
    await prisma.inboundEmail.create({
      data: { messageId, targetKind: target.kind, targetId: target.id },
    });
  } catch {
    // Unique violation — we've already ingested this one.
    return { ok: true, target, deduped: true };
  }

  return target.kind === "g"
    ? ingestGuestReply(target, body)
    : ingestTicketReply(target, body);
}

/** Public chat: the visitor has no account, so the message is just theirs. */
async function ingestGuestReply(
  target: InboundTarget,
  body: string,
): Promise<InboundResult> {
  const convo = await prisma.guestConversation.findUnique({
    where: { id: target.id },
    select: { id: true },
  });
  if (!convo) return { ok: false, reason: "not_found" };

  await prisma.$transaction([
    prisma.guestMessage.create({
      data: { conversationId: convo.id, body, fromTeam: false },
    }),
    // Clearing handledAt is what floats it back to the top of the queue. A
    // reply that arrives by email must not be quieter than one typed into the
    // widget.
    prisma.guestConversation.update({
      where: { id: convo.id },
      data: { handledAt: null },
    }),
  ]);

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "guest_chat_reply", title: body.slice(0, 80) },
        contextType: "GuestConversation",
        contextId: convo.id,
      },
    );
  }

  return { ok: true, target };
}

/**
 * Support ticket: the message is authored by the requester, because they wrote
 * it. We reuse the existing thread rather than inventing a parallel channel,
 * so an emailed reply and an in-app reply are the same thing.
 */
async function ingestTicketReply(
  target: InboundTarget,
  body: string,
): Promise<InboundResult> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: target.id },
    select: { id: true, status: true, requesterUserId: true, deletedAt: true },
  });
  if (!ticket || ticket.deletedAt) return { ok: false, reason: "not_found" };

  const thread = await prisma.thread.findFirst({
    where: {
      contextType: ThreadContextType.SUPPORT,
      contextId: ticket.id,
    },
    select: { id: true },
  });
  if (!thread) return { ok: false, reason: "not_found" };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        threadId: thread.id,
        authorUserId: ticket.requesterUserId,
        body,
      },
    });
    await tx.thread.update({
      where: { id: thread.id },
      data: { lastMessageAt: now },
    });
    // Same rule the in-app path applies: a requester replying to a resolved
    // ticket reopens it, so a follow-up doesn't die against a closed badge.
    if (ticket.status === SupportTicketStatus.RESOLVED) {
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: SupportTicketStatus.OPEN,
          resolvedAt: null,
          resolvedById: null,
        },
      });
    }
    await tx.threadParticipant.updateMany({
      where: { threadId: thread.id, userId: { not: ticket.requesterUserId } },
      data: { unreadCount: { increment: 1 } },
    });
  });

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      {
        type: NotificationType.MESSAGE_MENTION,
        vars: { title: body.slice(0, 80) },
        contextType: "SupportTicket",
        contextId: ticket.id,
      },
    );
  }

  return { ok: true, target };
}
