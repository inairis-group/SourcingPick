"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdminScope,
  AttachmentContext,
  DisputeOutcome,
  DisputeStatus,
  EscrowStatus,
  NotificationType,
  OrderStatus,
  Role,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { computeDisputeRefund } from "@/lib/orders/pricing";
import { generateUniqueReference } from "@/lib/sourcing/reference";

/**
 * Disputes — three-actor lifecycle.
 *
 *   buyer opens (within 7 days of deliveredAt)
 *     → factory responds (within 5 days — silent past that)
 *       → admin arbitrates (STANDARD / CUSTOM / REJECT)
 *
 * The held escrow(s) flip to DISPUTED on open and stay there until
 * resolution. Because `releaseFactoryPayout` only releases HELD
 * escrows, DISPUTED status automatically blocks any pending factory
 * payout.
 *
 * Refunds for STANDARD / CUSTOM outcomes record the cents math but
 * don't auto-dispatch on Wise — refund execution is a manual ops step
 * via the admin webhook console for now. The dispute row carries the
 * computed numbers so finance can reconcile after the fact.
 */

export type OpenDisputeResult =
  | { ok: true; disputeId: string }
  | { ok: false; error: string };

export type DisputeSimpleResult = { ok: true } | { ok: false; error: string };

const DISPUTE_WINDOW_DAYS = 7;
const FACTORY_RESPONSE_WINDOW_DAYS = 5;

export const DISPUTE_EVIDENCE_CONTEXT = AttachmentContext.DISPUTE_EVIDENCE;
export const DISPUTE_WINDOW = DISPUTE_WINDOW_DAYS;
export const FACTORY_RESPONSE_WINDOW = FACTORY_RESPONSE_WINDOW_DAYS;

// =============================================================
// Buyer — open a dispute
// =============================================================

const OpenDisputeSchema = z.object({
  statement: z.string().trim().min(20).max(4000),
});

export async function openDisputeAction(
  orderId: string,
  input: { statement: string },
): Promise<OpenDisputeResult> {
  const user = await requireAuth();
  const parsed = OpenDisputeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please describe the issue in at least 20 characters.",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      clientOrgId: true,
      factoryOrgId: true,
      deliveredAt: true,
      disputes: {
        where: { status: { not: DisputeStatus.RESOLVED } },
        select: { id: true },
      },
      escrows: {
        where: { status: EscrowStatus.HELD },
        orderBy: { createdAt: "asc" },
        select: { id: true, amountCents: true },
      },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  if (user.role !== Role.CLIENT || user.organizationId !== order.clientOrgId) {
    return {
      ok: false,
      error: "Only the buyer on this order can open a dispute.",
    };
  }

  const eligible =
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.IN_TRANSIT ||
    order.status === OrderStatus.COMPLETED;
  if (!eligible) {
    return {
      ok: false,
      error: "Disputes can only be opened on shipped or delivered orders.",
    };
  }
  const anchor = order.deliveredAt;
  if (anchor) {
    const elapsedDays =
      (Date.now() - anchor.getTime()) / (1000 * 60 * 60 * 24);
    if (elapsedDays > DISPUTE_WINDOW_DAYS) {
      return {
        ok: false,
        error: `The dispute window closed ${Math.floor(elapsedDays - DISPUTE_WINDOW_DAYS)} day(s) ago. Contact support if you need an exception.`,
      };
    }
  }

  if (order.disputes.length > 0) {
    return {
      ok: false,
      error: "An unresolved dispute already exists on this order.",
    };
  }
  if (order.escrows.length === 0) {
    return {
      ok: false,
      error:
        "No held escrow remains on this order. Contact support to investigate.",
    };
  }

  const reference = await generateUniqueReference("DSP");
  const primaryEscrow = order.escrows[0]!;

  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        reference,
        orderId: order.id,
        primaryEscrowId: primaryEscrow.id,
        openedByUserId: user.id,
        buyerStatement: parsed.data.statement,
        status: DisputeStatus.OPEN,
      },
      select: { id: true },
    });

    // Flip every HELD escrow on this order to DISPUTED so the next
    // release attempt (e.g. balance-finaliser closing the order) can't
    // sneak past us. Mirrors the F2 release pattern.
    await tx.escrowTransaction.updateMany({
      where: { orderId: order.id, status: EscrowStatus.HELD },
      data: { status: EscrowStatus.DISPUTED },
    });

    // Spin up the dispute thread so both parties + admin have somewhere
    // to talk. Reuses the polymorphic Thread surface.
    await tx.thread.create({
      data: {
        contextType: ThreadContextType.DISPUTE,
        contextId: created.id,
      },
    });

    return created;
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "dispute.opened",
    targetType: "Dispute",
    targetId: dispute.id,
    payload: {
      orderId: order.id,
      reference,
      statementLength: parsed.data.statement.length,
    },
    level: "WARN",
  });

  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { organizationId: order.factoryOrgId, deletedAt: null },
        { role: Role.ADMIN, deletedAt: null },
      ],
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    recipients.map((r) => r.id),
    {
      type: NotificationType.SYSTEM,
      vars: { systemKey: "order_disputed" },
      contextType: "Dispute",
      contextId: dispute.id,
    },
  );

  revalidatePath("/[lang]/client/orders/[id]", "page");
  revalidatePath("/[lang]/factory/orders/[id]", "page");
  revalidatePath("/[lang]/admin/disputes", "page");

  return { ok: true, disputeId: dispute.id };
}

// =============================================================
// Factory — respond
// =============================================================

const RespondDisputeSchema = z.object({
  statement: z.string().trim().min(20).max(4000),
});

export async function respondToDisputeAction(
  disputeId: string,
  input: { statement: string },
): Promise<DisputeSimpleResult> {
  const user = await requireAuth();
  const parsed = RespondDisputeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please give your response in at least 20 characters.",
    };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    select: {
      id: true,
      status: true,
      respondedAt: true,
      openedAt: true,
      order: { select: { factoryOrgId: true, clientOrgId: true } },
    },
  });
  if (!dispute) return { ok: false, error: "Dispute not found." };

  if (
    user.role !== Role.FACTORY ||
    user.organizationId !== dispute.order.factoryOrgId
  ) {
    return {
      ok: false,
      error: "Only the factory on this order can respond to the dispute.",
    };
  }
  if (dispute.status === DisputeStatus.RESOLVED) {
    return { ok: false, error: "This dispute has already been resolved." };
  }

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: {
      factoryStatement: parsed.data.statement,
      status: DisputeStatus.RESPONDED,
      respondedAt: dispute.respondedAt ?? new Date(),
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "dispute.factory_responded",
    targetType: "Dispute",
    targetId: dispute.id,
    payload: { statementLength: parsed.data.statement.length },
  });

  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { organizationId: dispute.order.clientOrgId, deletedAt: null },
        { role: Role.ADMIN, deletedAt: null },
      ],
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    recipients.map((r) => r.id),
    {
      type: NotificationType.SYSTEM,
      vars: { systemKey: "dispute_responded" },
      contextType: "Dispute",
      contextId: dispute.id,
    },
  );

  revalidatePath("/[lang]/client/orders/[id]", "page");
  revalidatePath("/[lang]/factory/orders/[id]", "page");
  revalidatePath("/[lang]/admin/disputes", "page");

  return { ok: true };
}

// =============================================================
// Admin — resolve
// =============================================================

const ResolveSchema = z.object({
  outcome: z.enum(["STANDARD", "CUSTOM", "REJECT"]),
  decision: z.string().trim().min(20).max(4000),
});

export async function resolveDisputeAction(
  disputeId: string,
  input: {
    outcome: "STANDARD" | "CUSTOM" | "REJECT";
    decision: string;
  },
): Promise<DisputeSimpleResult> {
  const admin = await requireAdminScope(AdminScope.DISPUTES);
  const parsed = ResolveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please give your arbitration narrative (≥ 20 chars).",
    };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    select: {
      id: true,
      status: true,
      orderId: true,
      primaryEscrowId: true,
      order: {
        select: {
          clientOrgId: true,
          factoryOrgId: true,
          escrows: {
            where: { status: EscrowStatus.DISPUTED },
            select: { id: true, amountCents: true },
          },
        },
      },
    },
  });
  if (!dispute) return { ok: false, error: "Dispute not found." };
  if (dispute.status === DisputeStatus.RESOLVED) {
    return { ok: false, error: "This dispute has already been resolved." };
  }

  const totalDisputedCents = dispute.order.escrows.reduce(
    (sum, e) => sum + e.amountCents,
    0,
  );

  if (parsed.data.outcome === "REJECT") {
    await prisma.$transaction(async (tx) => {
      await tx.escrowTransaction.updateMany({
        where: { orderId: dispute.orderId, status: EscrowStatus.DISPUTED },
        data: { status: EscrowStatus.HELD },
      });
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: DisputeStatus.RESOLVED,
          outcome: DisputeOutcome.REJECT,
          adminDecision: parsed.data.decision,
          resolvedAt: new Date(),
          resolvedById: admin.id,
          refundCents: 0,
          retainedCents: totalDisputedCents,
        },
      });
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "dispute.resolved",
      targetType: "Dispute",
      targetId: dispute.id,
      payload: { outcome: "REJECT", totalDisputedCents },
    });

    await notifyParties(
      dispute.order.clientOrgId,
      dispute.order.factoryOrgId,
      dispute.id,
      "REJECT",
    );
    revalidatePath("/[lang]/admin/disputes", "page");
    revalidatePath("/[lang]/client/orders/[id]", "page");
    revalidatePath("/[lang]/factory/orders/[id]", "page");
    return { ok: true };
  }

  const split = computeDisputeRefund(totalDisputedCents, parsed.data.outcome);

  await prisma.$transaction(async (tx) => {
    await tx.escrowTransaction.updateMany({
      where: { orderId: dispute.orderId, status: EscrowStatus.DISPUTED },
      data: { status: EscrowStatus.REFUNDED, releasedAt: new Date() },
    });
    await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: DisputeStatus.RESOLVED,
        outcome:
          parsed.data.outcome === "STANDARD"
            ? DisputeOutcome.STANDARD
            : DisputeOutcome.CUSTOM,
        adminDecision: parsed.data.decision,
        resolvedAt: new Date(),
        resolvedById: admin.id,
        refundCents: split.refundCents,
        retainedCents: split.retainedCents,
        platformShareCents: split.platformShareCents,
        supplierShareCents: split.supplierShareCents,
      },
    });
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "dispute.resolved",
    targetType: "Dispute",
    targetId: dispute.id,
    payload: {
      outcome: parsed.data.outcome,
      totalDisputedCents,
      ...split,
    },
    level: "WARN",
  });

  await notifyParties(
    dispute.order.clientOrgId,
    dispute.order.factoryOrgId,
    dispute.id,
    parsed.data.outcome,
  );
  revalidatePath("/[lang]/admin/disputes", "page");
  revalidatePath("/[lang]/client/orders/[id]", "page");
  revalidatePath("/[lang]/factory/orders/[id]", "page");
  return { ok: true };
}

async function notifyParties(
  clientOrgId: string,
  factoryOrgId: string,
  disputeId: string,
  outcome: string,
) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { organizationId: clientOrgId, deletedAt: null },
        { organizationId: factoryOrgId, deletedAt: null },
      ],
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    users.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: { systemKey: "order_dispute_resolved" },
      contextType: "Dispute",
      contextId: disputeId,
    },
  );
}
