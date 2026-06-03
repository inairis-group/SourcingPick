"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import {
  AttachmentContext,
  NotificationType,
  Role,
  SupportTicketStatus,
  SupportTopicKind,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth, requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { getOrCreateThread } from "@/lib/messaging/threads";
import { storeAttachments } from "@/lib/storage/attachments";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Support ticketing — partner ask: standalone threads between a
 * requester (client / factory / agent) and the admin support team, with
 * status (PENDING / OPEN / RESOLVED) and an optional polymorphic topic.
 *
 * Why we don't reuse DIRECT or DISPUTE threads:
 *   - Status lifecycle (RESOLVED is not a thread concept).
 *   - Polymorphic "topic" anchor admins attach after the fact.
 *   - Cross-org reach: a thread can be opened by any role and lands in
 *     every admin's inbox without manual seeding.
 */

const SUBJECT_MAX = 200;
const BODY_MAX = 5000;

const CreateSchema = z.object({
  subject: z.string().trim().min(3, "Subject is too short.").max(SUBJECT_MAX),
  body: z.string().trim().min(3, "Message is too short.").max(BODY_MAX),
});

export type CreateTicketState = {
  error?: string;
};

export async function createSupportTicketAction(
  _prev: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const user = await requireAuth();
  if (user.role === Role.ADMIN) {
    return { error: "Admins respond to tickets — they don't open them." };
  }

  const parsed = CreateSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const files = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const reference = await generateUniqueReference("TKT");
  const now = new Date();

  const { ticketId, threadId } = await prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.create({
      data: {
        reference,
        subject: parsed.data.subject,
        status: SupportTicketStatus.PENDING,
        requesterUserId: user.id,
        requesterOrgId: user.organizationId,
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

    // Seed the requester and every active admin as participants. The
    // requester's read state starts at "all read" (they wrote the first
    // message); admins start unread so the ticket lands in their bell.
    const adminRows = await tx.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    });
    await tx.threadParticipant.createMany({
      data: [
        { threadId: thread.id, userId: user.id, lastReadAt: now },
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
        authorUserId: user.id,
        body: parsed.data.body,
      },
    });

    return { ticketId: ticket.id, threadId: thread.id };
  });

  // Store any attachments outside the tx so a slow disk doesn't lock the
  // ticket row. The thread + first message are already live.
  if (files.length > 0) {
    const firstMessage = await prisma.message.findFirst({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (firstMessage) {
      await storeAttachments({
        contextType: AttachmentContext.MESSAGE,
        contextId: firstMessage.id,
        uploaderId: user.id,
        files,
      });
    }
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "support.ticket_created",
    targetType: "SupportTicket",
    targetId: ticketId,
    payload: { reference, attachments: files.length },
  });

  // Notify every active admin so they pick up the ticket immediately.
  const adminIds = (
    await prisma.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    })
  ).map((a) => a.id);
  if (adminIds.length > 0) {
    await emitNotificationToMany(adminIds, {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "support_ticket_created",
        reference,
        title: parsed.data.subject.slice(0, 80),
      },
      contextType: "SupportTicket",
      contextId: ticketId,
    });
  }

  revalidatePath("/[lang]/messages", "page");
  revalidatePath("/[lang]/admin/support", "page");

  const lang = await currentLocale();
  redirect(`/${lang}/support/${ticketId}`);
}

// =============================================================
// Admin actions — topic + status
// =============================================================

// Hard-coded string tuple instead of `Object.values(SupportTopicKind)` —
// the Turbopack dev-server caches an older Prisma client where the enum
// is undefined, and the module-load `Object.values(undefined)` crashes.
// `satisfies` keeps the literal in sync with the Prisma enum at compile
// time, so adding a new kind to the schema still fails the type check.
const TOPIC_KINDS = [
  "ORDER",
  "SOURCING_REQUEST",
  "MARKETPLACE_PRODUCT",
  "AUCTION",
  "CLIENT_ORG",
  "FACTORY_ORG",
  "AGENT",
] as const satisfies readonly SupportTopicKind[];

const STATUSES = [
  "PENDING",
  "OPEN",
  "RESOLVED",
] as const satisfies readonly SupportTicketStatus[];

const TopicSchema = z.object({
  ticketId: z.string().min(1),
  kind: z.enum(TOPIC_KINDS),
  topicId: z.string().trim().min(1),
});

export type AdminResult = { ok: true } | { ok: false; error: string };

export async function setSupportTicketTopicAction(
  ticketId: string,
  kind: SupportTopicKind,
  topicIdOrReference: string,
): Promise<AdminResult> {
  const parsed = TopicSchema.safeParse({
    ticketId,
    kind,
    topicId: topicIdOrReference,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const admin = await requireRole(Role.ADMIN);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: parsed.data.ticketId },
    select: { id: true, deletedAt: true, reference: true },
  });
  if (!ticket || ticket.deletedAt) {
    return { ok: false, error: "Ticket not found." };
  }

  // Admins live in references (ORD-12345, REQ-987654, etc.) so we accept
  // either an id or a reference and resolve to the canonical id.
  const resolvedId = await resolveTopicId(
    parsed.data.kind,
    parsed.data.topicId.trim(),
  );
  if (!resolvedId) {
    return { ok: false, error: "Selected topic could not be found." };
  }

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      topicKind: parsed.data.kind,
      topicId: resolvedId,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.topic_set",
    targetType: "SupportTicket",
    targetId: ticket.id,
    payload: { kind: parsed.data.kind, topicId: parsed.data.topicId },
  });

  revalidatePath("/[lang]/support/[id]", "page");
  revalidatePath("/[lang]/admin/support", "page");
  return { ok: true };
}

export async function clearSupportTicketTopicAction(
  ticketId: string,
): Promise<AdminResult> {
  if (!ticketId) return { ok: false, error: "Invalid id." };
  const admin = await requireRole(Role.ADMIN);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, deletedAt: true },
  });
  if (!ticket || ticket.deletedAt) {
    return { ok: false, error: "Ticket not found." };
  }

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { topicKind: null, topicId: null },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.topic_cleared",
    targetType: "SupportTicket",
    targetId: ticket.id,
  });

  revalidatePath("/[lang]/support/[id]", "page");
  revalidatePath("/[lang]/admin/support", "page");
  return { ok: true };
}

export async function setSupportTicketStatusAction(
  ticketId: string,
  status: SupportTicketStatus,
): Promise<AdminResult> {
  if (!ticketId) return { ok: false, error: "Invalid id." };
  if (!(Object.values(SupportTicketStatus) as string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const admin = await requireRole(Role.ADMIN);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      reference: true,
      requesterUserId: true,
      subject: true,
    },
  });
  if (!ticket || ticket.deletedAt) {
    return { ok: false, error: "Ticket not found." };
  }
  if (ticket.status === status) return { ok: true };

  const now = new Date();
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status,
      openedAt:
        status === SupportTicketStatus.OPEN && !ticket.status
          ? now
          : status === SupportTicketStatus.OPEN
            ? undefined
            : undefined,
      resolvedAt: status === SupportTicketStatus.RESOLVED ? now : null,
      resolvedById: status === SupportTicketStatus.RESOLVED ? admin.id : null,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "support.status_changed",
    targetType: "SupportTicket",
    targetId: ticket.id,
    payload: { from: ticket.status, to: status },
  });

  // Notify the requester when an admin resolves the ticket so they see
  // the closure in their bell rather than discovering it on next visit.
  if (status === SupportTicketStatus.RESOLVED) {
    await emitNotificationToMany([ticket.requesterUserId], {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "support_ticket_resolved",
        reference: ticket.reference,
        title: ticket.subject.slice(0, 80),
      },
      contextType: "SupportTicket",
      contextId: ticket.id,
    });
  }

  revalidatePath("/[lang]/support/[id]", "page");
  revalidatePath("/[lang]/admin/support", "page");
  revalidatePath("/[lang]/messages", "page");
  return { ok: true };
}

// =============================================================
// Helpers — used by both actions and pages
// =============================================================

/**
 * Idempotent lazy-open. Called from the ticket detail page so opening a
 * Thread row + bumping the ticket out of PENDING doesn't need a click.
 * Server-only — exposed via a thin wrapper for the unauth'd cases.
 */
export async function ensureSupportThreadOpened(
  ticketId: string,
  actor: { id: string; role: Role },
): Promise<{ threadId: string }> {
  const thread = await getOrCreateThread(
    ThreadContextType.SUPPORT,
    ticketId,
    actor.id,
  );

  // First admin engagement flips PENDING → OPEN. We update best-effort
  // so a concurrent flip doesn't error.
  if (actor.role === Role.ADMIN) {
    await prisma.supportTicket
      .updateMany({
        where: { id: ticketId, status: SupportTicketStatus.PENDING },
        data: { status: SupportTicketStatus.OPEN, openedAt: new Date() },
      })
      .catch(() => {});
  }

  return { threadId: thread.id };
}

/**
 * Resolve a topic input to its canonical id. Admins paste either the id
 * straight from the URL or the human reference (ORD-12345). We try both
 * and return the row's id, or null when nothing matches.
 */
async function resolveTopicId(
  kind: SupportTopicKind,
  input: string,
): Promise<string | null> {
  switch (kind) {
    case SupportTopicKind.ORDER: {
      const row = await prisma.order.findFirst({
        where: { OR: [{ id: input }, { reference: input }] },
        select: { id: true },
      });
      return row?.id ?? null;
    }
    case SupportTopicKind.SOURCING_REQUEST: {
      const row = await prisma.sourcingRequest.findFirst({
        where: { OR: [{ id: input }, { reference: input }] },
        select: { id: true },
      });
      return row?.id ?? null;
    }
    case SupportTopicKind.MARKETPLACE_PRODUCT: {
      const row = await prisma.marketplaceProduct.findFirst({
        where: { OR: [{ id: input }, { reference: input }] },
        select: { id: true },
      });
      return row?.id ?? null;
    }
    case SupportTopicKind.AUCTION: {
      const row = await prisma.auction.findFirst({
        where: { OR: [{ id: input }, { reference: input }] },
        select: { id: true },
      });
      return row?.id ?? null;
    }
    case SupportTopicKind.CLIENT_ORG:
    case SupportTopicKind.FACTORY_ORG: {
      // Orgs don't have a public reference — match by id or displayName.
      const row = await prisma.organization.findFirst({
        where: {
          OR: [{ id: input }, { displayName: input }],
          ...(kind === SupportTopicKind.CLIENT_ORG
            ? { type: "CLIENT" }
            : { type: "FACTORY" }),
        },
        select: { id: true },
      });
      return row?.id ?? null;
    }
    case SupportTopicKind.AGENT: {
      // Match by id or email — both are unique on User.
      const row = await prisma.user.findFirst({
        where: {
          OR: [{ id: input }, { email: input }],
          role: Role.AGENT,
          deletedAt: null,
        },
        select: { id: true },
      });
      return row?.id ?? null;
    }
  }
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
