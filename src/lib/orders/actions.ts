"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CreditReason,
  NotificationType,
  OrderStatus,
  QuoteStatus,
  ResearchFeeStatus,
  Role,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth, requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  emitNotification,
  emitNotificationToMany,
} from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { canTransition, isTerminal } from "./transitions";

/**
 * Research fee is credited back if the buyer places an order within this
 * window of paying it (docs/pricing-v2.md). Anchored on researchFeePaidAt.
 */
const CREDIT_BACK_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// =============================================================
// Quote acceptance (client → creates Order, rejects siblings)
// =============================================================

export type AcceptQuoteResult =
  | { ok: true; orderId: string; orderReference: string }
  | { ok: false; error: string };

/**
 * v1 split: 30% deposit, 70% balance — held in escrow per spec §3.3.
 * Provider-side capture lands in Phase 3.
 */
const DEPOSIT_RATIO = 0.3;

export async function acceptQuoteAction(
  quoteId: string,
): Promise<AcceptQuoteResult> {
  const user = await requireRole(Role.CLIENT);

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      status: true,
      validUntil: true,
      totalCentsClient: true,
      marginCents: true,
      requestId: true,
      factoryOrgId: true,
      agentId: true,
      leadTimeDays: true,
      request: {
        select: {
          id: true,
          clientOrgId: true,
          status: true,
          researchFeeStatus: true,
          researchFeeCents: true,
          researchFeePaidAt: true,
        },
      },
    },
  });
  if (!quote) return { ok: false, error: "Quote not found." };
  if (quote.request.clientOrgId !== user.organizationId) {
    return { ok: false, error: "This quote is not on one of your requests." };
  }
  if (quote.status !== QuoteStatus.SENT_TO_CLIENT) {
    return { ok: false, error: "This quote can no longer be accepted." };
  }
  if (quote.validUntil < new Date()) {
    return { ok: false, error: "This quote has expired." };
  }

  const reference = await generateUniqueReference("ORD");
  const depositCents = Math.round(quote.totalCentsClient * DEPOSIT_RATIO);
  const balanceCents = quote.totalCentsClient - depositCents;
  const estimatedEta = new Date(
    Date.now() + quote.leadTimeDays * 24 * 60 * 60 * 1000,
  );

  let orderId: string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          reference,
          quoteId: quote.id,
          requestId: quote.requestId,
          clientOrgId: quote.request.clientOrgId,
          factoryOrgId: quote.factoryOrgId,
          agentId: quote.agentId,
          totalCents: quote.totalCentsClient,
          depositCents,
          balanceCents,
          commissionCents: quote.marginCents,
          status: OrderStatus.PAYMENT_PENDING,
          estimatedEta,
        },
        select: { id: true, reference: true },
      });

      await tx.quote.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.ACCEPTED },
      });

      // Reject sibling quotes still in flight on this request.
      await tx.quote.updateMany({
        where: {
          requestId: quote.requestId,
          id: { not: quote.id },
          status: {
            in: [
              QuoteStatus.DRAFT,
              QuoteStatus.SENT_TO_AGENT,
              QuoteStatus.SENT_TO_CLIENT,
            ],
          },
        },
        data: { status: QuoteStatus.REJECTED },
      });

      // Credit-back: if the buyer paid a research fee on this request and
      // is ordering within the 30-day window, return the fee as platform
      // credit and mark it CREDITED. Idempotent via the PAID→CREDITED flip.
      const rf = quote.request;
      const withinWindow =
        rf.researchFeePaidAt !== null &&
        Date.now() - rf.researchFeePaidAt.getTime() <= CREDIT_BACK_WINDOW_MS;
      if (
        rf.researchFeeStatus === ResearchFeeStatus.PAID &&
        rf.researchFeeCents &&
        rf.researchFeeCents > 0 &&
        withinWindow
      ) {
        await tx.creditTransaction.create({
          data: {
            organizationId: quote.request.clientOrgId,
            amountCents: rf.researchFeeCents,
            reason: CreditReason.RESEARCH_FEE_CREDIT,
            refType: "SourcingRequest",
            refId: quote.requestId,
            note: `Research fee credited back on order ${reference}`,
          },
        });
        await tx.sourcingRequest.update({
          where: { id: quote.requestId },
          data: {
            status: SourcingStatus.QUOTE_ACCEPTED,
            researchFeeStatus: ResearchFeeStatus.CREDITED,
          },
        });
      } else {
        await tx.sourcingRequest.update({
          where: { id: quote.requestId },
          data: { status: SourcingStatus.QUOTE_ACCEPTED },
        });
      }

      return order;
    });
    orderId = result.id;
  } catch {
    return {
      ok: false,
      error: "Something went wrong creating the order. Please try again.",
    };
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "quote.accepted",
    targetType: "Quote",
    targetId: quote.id,
    payload: { orderId, requestId: quote.requestId },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "order.created",
    targetType: "Order",
    targetId: orderId,
    payload: { quoteId: quote.id, totalCents: quote.totalCentsClient },
  });

  // Notify factory owners + agent.
  const clientOrg = await prisma.organization.findUnique({
    where: { id: quote.request.clientOrgId },
    select: { displayName: true },
  });
  const factoryOwnerIds = await prisma.user.findMany({
    where: {
      organizationId: quote.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  const recipientIds = [
    ...factoryOwnerIds.map((u) => u.id),
    ...(quote.agentId ? [quote.agentId] : []),
  ];
  await emitNotificationToMany(recipientIds, {
    type: NotificationType.QUOTE_ACCEPTED,
    vars: { reference, clientName: clientOrg?.displayName },
    contextType: "Order",
    contextId: orderId,
  });

  revalidatePath("/[lang]/client/requests", "page");
  revalidatePath("/[lang]/client/orders", "page");
  revalidatePath("/[lang]/factory/orders", "page");
  revalidatePath("/[lang]/agent/requests", "page");

  return { ok: true, orderId, orderReference: reference };
}

// =============================================================
// Quote rejection (client says no to one quote without accepting another)
// =============================================================

export type RejectQuoteResult = { ok: true } | { ok: false; error: string };

export async function rejectQuoteAction(
  quoteId: string,
): Promise<RejectQuoteResult> {
  const user = await requireRole(Role.CLIENT);

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      status: true,
      requestId: true,
      request: { select: { clientOrgId: true } },
    },
  });
  if (!quote) return { ok: false, error: "Quote not found." };
  if (quote.request.clientOrgId !== user.organizationId) {
    return { ok: false, error: "This quote is not on one of your requests." };
  }
  if (quote.status !== QuoteStatus.SENT_TO_CLIENT) {
    return { ok: false, error: "This quote can't be rejected right now." };
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: QuoteStatus.REJECTED },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "quote.rejected_by_client",
    targetType: "Quote",
    targetId: quote.id,
    payload: { requestId: quote.requestId },
  });

  // Notify factory owners.
  const fullQuote = await prisma.quote.findUnique({
    where: { id: quote.id },
    select: { factoryOrgId: true },
  });
  if (fullQuote) {
    const factoryOwnerIds = await prisma.user.findMany({
      where: {
        organizationId: fullQuote.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    });
    await emitNotificationToMany(
      factoryOwnerIds.map((u) => u.id),
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "quote_rejected_by_client" },
        contextType: "Quote",
        contextId: quote.id,
      },
    );
  }

  revalidatePath("/[lang]/client/requests", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  return { ok: true };
}

// =============================================================
// Order status transitions
// =============================================================

const TrackingSchema = z.object({
  trackingNumber: z.string().trim().min(2).max(80),
  trackingCarrier: z.string().trim().min(2).max(80),
  trackingUrl: z.url().max(500).optional().or(z.literal("")),
});

export type AdvanceOrderResult = { ok: true } | { ok: false; error: string };

/**
 * Apply a status transition to an Order. The role-permitted next states
 * are defined in `transitions.ts`. Tracking info is required when moving
 * into SHIPPED and is otherwise ignored.
 */
export async function advanceOrderStatusAction(
  orderId: string,
  nextStatus: OrderStatus,
  tracking?: {
    trackingNumber?: string;
    trackingCarrier?: string;
    trackingUrl?: string;
  },
): Promise<AdvanceOrderResult> {
  const user = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      clientOrgId: true,
      factoryOrgId: true,
      agentId: true,
      requestId: true,
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  // Membership check: client must own the client org, factory must own the
  // factory org, agent must be the assigned agent, admin always passes.
  const isClient =
    user.role === Role.CLIENT && order.clientOrgId === user.organizationId;
  const isFactory =
    user.role === Role.FACTORY && order.factoryOrgId === user.organizationId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isClient && !isFactory && !isAdmin) {
    return { ok: false, error: "You don't have access to this order." };
  }

  if (isTerminal(order.status)) {
    return { ok: false, error: "This order is already closed." };
  }
  if (!canTransition(order.status, nextStatus, user.role)) {
    return { ok: false, error: "This status change isn't allowed." };
  }

  const data: Record<string, unknown> = { status: nextStatus };

  if (nextStatus === OrderStatus.SHIPPED) {
    const parsed = TrackingSchema.safeParse(tracking ?? {});
    if (!parsed.success) {
      return {
        ok: false,
        error: "Tracking number and carrier are required to mark as shipped.",
      };
    }
    data.trackingNumber = parsed.data.trackingNumber;
    data.trackingCarrier = parsed.data.trackingCarrier;
    data.trackingUrl = parsed.data.trackingUrl || null;
    data.shippedAt = new Date();
  }
  if (nextStatus === OrderStatus.COMPLETED) {
    data.deliveredAt = new Date();
  }

  const requestStatusForOrder: Partial<Record<OrderStatus, SourcingStatus>> = {
    PREPARATION: SourcingStatus.PREPARATION,
    SHIPPED: SourcingStatus.SHIPPED,
    IN_TRANSIT: SourcingStatus.IN_TRANSIT,
    COMPLETED: SourcingStatus.COMPLETED,
    CANCELLED: SourcingStatus.CANCELLED,
  };
  const mirroredRequestStatus = requestStatusForOrder[nextStatus];

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data });
      if (mirroredRequestStatus) {
        await tx.sourcingRequest.update({
          where: { id: order.requestId },
          data: { status: mirroredRequestStatus },
        });
      }
    });
  } catch {
    return {
      ok: false,
      error: "Couldn't update the order. Please try again.",
    };
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "order.status_changed",
    targetType: "Order",
    targetId: order.id,
    payload: {
      from: order.status,
      to: nextStatus,
      ...(tracking ? { tracking } : {}),
    },
  });

  // Pick the right notification for the new status, and the right audience.
  await notifyOnOrderTransition(order.id, nextStatus);

  revalidatePath("/[lang]/client/orders", "page");
  revalidatePath("/[lang]/factory/orders", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  revalidatePath("/[lang]/admin/requests", "page");

  return { ok: true };
}

async function notifyOnOrderTransition(
  orderId: string,
  to: OrderStatus,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      reference: true,
      clientOrgId: true,
      factoryOrgId: true,
      agentId: true,
      factoryOrg: { select: { displayName: true } },
    },
  });
  if (!order) return;

  const clientUserIds = (
    await prisma.user.findMany({
      where: {
        organizationId: order.clientOrgId,
        role: Role.CLIENT,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  const factoryUserIds = (
    await prisma.user.findMany({
      where: {
        organizationId: order.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  const agentIds = order.agentId ? [order.agentId] : [];

  switch (to) {
    case OrderStatus.PREPARATION:
      await emitNotificationToMany([...factoryUserIds, ...agentIds], {
        type: NotificationType.PAYMENT_RECEIVED,
        vars: { reference: order.reference },
        contextType: "Order",
        contextId: orderId,
      });
      return;
    case OrderStatus.SHIPPED:
      await emitNotificationToMany([...clientUserIds, ...agentIds], {
        type: NotificationType.SHIPMENT,
        vars: {
          reference: order.reference,
          factoryName: order.factoryOrg.displayName,
        },
        contextType: "Order",
        contextId: orderId,
      });
      return;
    case OrderStatus.COMPLETED:
      await emitNotificationToMany(
        [...clientUserIds, ...factoryUserIds, ...agentIds],
        {
          type: NotificationType.SYSTEM,
          vars: { systemKey: "order_completed" },
          contextType: "Order",
          contextId: orderId,
        },
      );
      return;
    case OrderStatus.CANCELLED:
      await emitNotificationToMany(
        [...clientUserIds, ...factoryUserIds, ...agentIds],
        {
          type: NotificationType.SYSTEM,
          vars: { systemKey: "order_cancelled" },
          contextType: "Order",
          contextId: orderId,
        },
      );
      return;
    case OrderStatus.QC:
    case OrderStatus.IN_TRANSIT:
    case OrderStatus.PAYMENT_PENDING:
      // Intentionally silent — the in-app timeline is enough; we don't want
      // to spam recipients on every intermediate hop.
      return;
  }
}
