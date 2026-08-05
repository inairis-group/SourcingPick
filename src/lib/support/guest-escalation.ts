"use server";

import { revalidatePath } from "next/cache";
import {
  GuestChatTeam,
  GuestConversationStatus,
  NotificationType,
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { sendEmail } from "@/lib/email/send";
import NotificationEmail from "@/lib/email/templates/notification";
import { appUrl } from "@/lib/urls";
import type { Locale } from "@/lib/i18n/config";

/**
 * Copy for the one email that has to reach the visitor regardless of any
 * notification preference: the notice that their conversation moved.
 *
 * Everything after this point is answered in the ticket, so someone who never
 * gets this mail is left watching a chat widget nobody is going to reply in.
 * That makes it a channel-change notice rather than a notification, which is
 * why it bypasses `emitNotification` and its digest settings.
 */
const ESCALATION_EMAIL: Record<
  Locale,
  { subject: string; title: string; body: string; cta: string }
> = {
  fr: {
    subject: "Votre conversation a été transférée à notre support",
    title: "Nous reprenons votre demande",
    body: "Votre échange sur le chat a été transformé en demande de support. La suite se passe dans votre espace — c'est là que nous répondrons.",
    cta: "Voir ma demande",
  },
  en: {
    subject: "Your conversation moved to our support desk",
    title: "We've picked up your request",
    body: "Your chat has been turned into a support request. The conversation continues in your dashboard — that's where we'll reply.",
    cta: "View my request",
  },
  zh: {
    subject: "您的会话已转至客服工单",
    title: "我们已受理您的请求",
    body: "您的聊天已转为客服工单。后续沟通将在您的后台进行，我们会在那里回复您。",
    cta: "查看我的工单",
  },
  ar: {
    subject: "تم تحويل محادثتك إلى فريق الدعم",
    title: "تسلّمنا طلبك",
    body: "تم تحويل محادثتك إلى طلب دعم. تكملة الحوار تجري في لوحة التحكم، وهناك سنرد عليك.",
    cta: "عرض طلبي",
  },
};

/**
 * Closing line dropped into the widget itself.
 *
 * The thread stays open — we don't strand anyone — but leaving it silent
 * would have the visitor typing into a channel nobody is watching any more.
 */
const HANDOFF_MESSAGE: Record<Locale, string> = {
  fr: "Nous reprenons votre demande depuis votre espace client. Vous venez de recevoir un e-mail : la suite de nos échanges s'y trouvera.",
  en: "We're picking this up from your account. You've just been emailed — that's where the rest of this conversation will happen.",
  zh: "我们将在您的账户后台继续处理此请求。刚刚已向您发送邮件，后续沟通将在那里进行。",
  ar: "سنتابع طلبك من حسابك. أرسلنا إليك بريدًا للتو، وهناك ستكمل هذه المحادثة.",
};

/**
 * Routing and escalation for public-chat conversations.
 *
 * The hard constraint everything here works around: a visitor to the marketing
 * site is anonymous. A SupportTicket needs a `requesterUserId` and a Dispute
 * needs an `orderId` + `openedByUserId`, and none of those exist for someone
 * who typed a name and an email into a widget.
 *
 * So escalation is gated on matching that email to a real account. We never
 * fabricate a placeholder user to get past the foreign key — it would pollute
 * the user table and, worse, put a fictional name on a dispute's audit trail.
 * When there's no match the UI says so and offers nothing.
 *
 * Team routing has no such constraint and works for every conversation, which
 * is why it's separate from escalation rather than a step within it.
 */

export type GuestEscalationState =
  | { ok: true; ticketId?: string; disputeId?: string }
  | { ok: false; error: string };

/** Transcript rendered for a ticket's opening message. */
function renderTranscript(
  messages: { body: string; fromTeam: boolean; createdAt: Date }[],
  visitorName: string,
): string {
  return messages
    .map((m) => `**${m.fromTeam ? "SourcingPick" : visitorName}:** ${m.body}`)
    .join("\n\n");
}

/**
 * Find the account behind a public-chat email.
 *
 * Case-insensitive because people type their address however they like, and
 * excluding deleted users because escalating onto a closed account would
 * create a ticket nobody can open.
 */
export async function findGuestAccount(email: string) {
  await requireRole(Role.ADMIN);
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      organizationId: true,
      organization: { select: { id: true, displayName: true, type: true } },
    },
  });
}

/** Orders the matched account could raise a dispute against. */
export async function listDisputableOrders(conversationId: string) {
  await requireRole(Role.ADMIN);
  const convo = await prisma.guestConversation.findUnique({
    where: { id: conversationId },
    select: { linkedUserId: true },
  });
  if (!convo?.linkedUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: convo.linkedUserId },
    select: { organizationId: true },
  });
  if (!user) return [];

  return prisma.order.findMany({
    where: {
      clientOrgId: user.organizationId,
      deletedAt: null,
      // An order already in dispute can't take a second one.
      disputes: { none: { status: { not: "RESOLVED" } } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, reference: true, totalCents: true, status: true },
  });
}

/** Route a conversation to the queue that should answer it. */
export async function assignGuestTeam(
  _prev: GuestEscalationState | null,
  formData: FormData,
): Promise<GuestEscalationState> {
  const admin = await requireRole(Role.ADMIN);
  const conversationId = String(formData.get("conversationId") ?? "");
  const raw = String(formData.get("team") ?? "");

  // An empty value is "unroute", which is a legitimate correction after a
  // mis-assignment — not an error.
  const team =
    raw === ""
      ? null
      : (Object.values(GuestChatTeam) as string[]).includes(raw)
        ? (raw as GuestChatTeam)
        : undefined;
  if (team === undefined) return { ok: false, error: "invalid_team" };

  const updated = await prisma.guestConversation.updateMany({
    where: { id: conversationId },
    data: { team },
  });
  if (updated.count === 0) return { ok: false, error: "not_found" };

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.guest_chat_routed",
    targetType: "GuestConversation",
    targetId: conversationId,
    payload: { team },
  });

  revalidatePath("/[lang]/admin/support/chat", "page");
  return { ok: true };
}

/** Close a conversation, or reopen one that was closed too early. */
export async function setGuestConversationStatus(
  _prev: GuestEscalationState | null,
  formData: FormData,
): Promise<GuestEscalationState> {
  const admin = await requireRole(Role.ADMIN);
  const conversationId = String(formData.get("conversationId") ?? "");
  const raw = String(formData.get("status") ?? "");

  // ESCALATED is a consequence of escalating, never a thing you pick — letting
  // it be set by hand would claim a ticket exists when none does.
  if (raw !== GuestConversationStatus.OPEN && raw !== GuestConversationStatus.CLOSED) {
    return { ok: false, error: "invalid_status" };
  }

  const updated = await prisma.guestConversation.updateMany({
    where: { id: conversationId },
    data: {
      status: raw,
      closedAt: raw === GuestConversationStatus.CLOSED ? new Date() : null,
    },
  });
  if (updated.count === 0) return { ok: false, error: "not_found" };

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.guest_chat_status",
    targetType: "GuestConversation",
    targetId: conversationId,
    payload: { status: raw },
  });

  revalidatePath("/[lang]/admin/support/chat", "page");
  return { ok: true };
}

/**
 * Convert a public chat into a SupportTicket.
 *
 * The transcript becomes the ticket's opening message, authored by the
 * customer — because they wrote it. The admin who escalated is recorded in the
 * audit log instead, so "who said this" and "who moved it" stay distinct.
 *
 * The guest thread is deliberately left usable: the visitor's browser only
 * knows its token, and cutting the widget off mid-conversation would strand
 * anyone who hasn't logged in yet.
 */
export async function escalateGuestToTicket(
  _prev: GuestEscalationState | null,
  formData: FormData,
): Promise<GuestEscalationState> {
  const admin = await requireRole(Role.ADMIN);
  const conversationId = String(formData.get("conversationId") ?? "");

  const convo = await prisma.guestConversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      name: true,
      email: true,
      locale: true,
      team: true,
      escalatedTicketId: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { body: true, fromTeam: true, createdAt: true },
      },
    },
  });
  if (!convo) return { ok: false, error: "not_found" };
  if (convo.escalatedTicketId) return { ok: false, error: "already_escalated" };
  if (convo.messages.length === 0) return { ok: false, error: "empty" };

  const account = await prisma.user.findFirst({
    where: { email: { equals: convo.email, mode: "insensitive" }, deletedAt: null },
    select: { id: true, organizationId: true },
  });
  if (!account) return { ok: false, error: "no_account" };

  const reference = await generateUniqueReference("TKT");
  const now = new Date();
  // First line of the visitor's opening message, which is the closest thing a
  // chat has to a subject.
  const subject =
    convo.messages.find((m) => !m.fromTeam)?.body.split("\n")[0]?.slice(0, 120) ??
    `Public chat — ${convo.name}`;

  const ticketId = await prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.create({
      data: {
        reference,
        subject,
        status: SupportTicketStatus.OPEN,
        requesterUserId: account.id,
        requesterOrgId: account.organizationId,
        openedAt: now,
      },
      select: { id: true },
    });

    const thread = await tx.thread.create({
      data: {
        contextType: ThreadContextType.SUPPORT,
        contextId: ticket.id,
        lastMessageAt: now,
      },
      select: { id: true },
    });

    const adminRows = await tx.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    });
    await tx.threadParticipant.createMany({
      data: [
        { threadId: thread.id, userId: account.id, lastReadAt: now },
        ...adminRows.map((a) => ({
          threadId: thread.id,
          userId: a.id,
          unreadCount: 1,
        })),
      ],
      skipDuplicates: true,
    });

    await tx.message.create({
      data: {
        threadId: thread.id,
        authorUserId: account.id,
        body: renderTranscript(convo.messages, convo.name),
      },
    });

    await tx.guestMessage.create({
      data: {
        conversationId: convo.id,
        body: HANDOFF_MESSAGE[convo.locale],
        fromTeam: true,
      },
    });

    await tx.guestConversation.update({
      where: { id: convo.id },
      data: {
        status: GuestConversationStatus.ESCALATED,
        escalatedTicketId: ticket.id,
        escalatedAt: now,
        linkedUserId: account.id,
      },
    });

    return ticket.id;
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.guest_chat_escalated_ticket",
    targetType: "GuestConversation",
    targetId: convo.id,
    payload: { ticketId, reference, requesterUserId: account.id },
  });

  await emitNotificationToMany([account.id], {
    type: NotificationType.SYSTEM,
    vars: {
      systemKey: "support_ticket_created",
      reference,
      title: subject.slice(0, 80),
    },
    contextType: "SupportTicket",
    contextId: ticketId,
  });

  // Tell them the channel changed, in the language they were browsing in.
  // Fire-and-forget: the ticket exists and is authoritative whether or not
  // SMTP is reachable.
  const copy = ESCALATION_EMAIL[convo.locale];
  void sendEmail({
    to: convo.email,
    subject: `${copy.subject} · ${reference}`,
    react: NotificationEmail({
      title: copy.title,
      description: copy.body,
      ctaLabel: copy.cta,
      ctaUrl: appUrl(`/${convo.locale}/support/${ticketId}`),
      locale: convo.locale,
    }),
  }).catch(() => {
    /* the in-app notification above still lands */
  });

  revalidatePath("/[lang]/admin/support/chat", "page");
  revalidatePath("/[lang]/admin/support", "page");
  return { ok: true, ticketId };
}

/**
 * Open a dispute from a public chat, against an order the matched account owns.
 *
 * `openedByUserId` is the customer, not the admin who clicked: they are the
 * party disputing, and recording an admin there would misstate who raised it
 * in a record that decides where money goes. The admin is in the audit log.
 */
export async function escalateGuestToDispute(
  _prev: GuestEscalationState | null,
  formData: FormData,
): Promise<GuestEscalationState> {
  const admin = await requireRole(Role.ADMIN);
  const conversationId = String(formData.get("conversationId") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { ok: false, error: "missing_order" };

  const convo = await prisma.guestConversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      name: true,
      email: true,
      escalatedDisputeId: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { body: true, fromTeam: true, createdAt: true },
      },
    },
  });
  if (!convo) return { ok: false, error: "not_found" };
  if (convo.escalatedDisputeId) return { ok: false, error: "already_escalated" };

  const account = await prisma.user.findFirst({
    where: { email: { equals: convo.email, mode: "insensitive" }, deletedAt: null },
    select: { id: true, organizationId: true },
  });
  if (!account) return { ok: false, error: "no_account" };

  // The order has to belong to the matched customer — otherwise a mis-typed id
  // would open a dispute on a stranger's order.
  const order = await prisma.order.findFirst({
    where: { id: orderId, clientOrgId: account.organizationId, deletedAt: null },
    select: { id: true, reference: true },
  });
  if (!order) return { ok: false, error: "order_not_found" };

  const openDispute = await prisma.dispute.findFirst({
    where: { orderId: order.id, status: { not: "RESOLVED" } },
    select: { id: true },
  });
  if (openDispute) return { ok: false, error: "dispute_already_open" };

  const reference = await generateUniqueReference("DSP");
  const now = new Date();

  const disputeId = await prisma.$transaction(async (tx) => {
    const dispute = await tx.dispute.create({
      data: {
        reference,
        orderId: order.id,
        openedByUserId: account.id,
        buyerStatement: renderTranscript(convo.messages, convo.name),
        openedAt: now,
      },
      select: { id: true },
    });

    await tx.guestConversation.update({
      where: { id: convo.id },
      data: {
        status: GuestConversationStatus.ESCALATED,
        escalatedDisputeId: dispute.id,
        escalatedAt: now,
        linkedUserId: account.id,
      },
    });

    return dispute.id;
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.guest_chat_escalated_dispute",
    targetType: "GuestConversation",
    targetId: convo.id,
    payload: {
      disputeId,
      reference,
      orderReference: order.reference,
      openedByUserId: account.id,
    },
  });

  revalidatePath("/[lang]/admin/support/chat", "page");
  revalidatePath("/[lang]/admin/disputes", "page");
  return { ok: true, disputeId };
}
