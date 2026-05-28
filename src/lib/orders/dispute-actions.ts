"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  EscrowStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { computeDisputeRefund } from "@/lib/orders/pricing";

export type DisputeResult = { ok: true } | { ok: false; error: string };

/**
 * Open a dispute on a HELD escrow. HELD → DISPUTED. Because
 * `releaseFactoryPayout` only releases escrows in HELD, flipping to
 * DISPUTED automatically blocks the factory payout until the dispute is
 * resolved. Admin-only (disputes are mediated by ops, not self-served).
 */
export async function openDisputeAction(
  escrowId: string,
  reason: string,
): Promise<DisputeResult> {
  const admin = await requireRole(Role.ADMIN);

  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return { ok: false, error: "Please give a short reason for the dispute." };
  }

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    select: {
      id: true,
      status: true,
      orderId: true,
      order: { select: { clientOrgId: true, factoryOrgId: true } },
    },
  });
  if (!escrow) return { ok: false, error: "Escrow not found." };
  if (escrow.status !== EscrowStatus.HELD) {
    return {
      ok: false,
      error:
        "Only held escrow can be disputed. Released or refunded funds need manual handling.",
    };
  }

  await prisma.escrowTransaction.update({
    where: { id: escrow.id },
    data: { status: EscrowStatus.DISPUTED },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "escrow.dispute_opened",
    targetType: "EscrowTransaction",
    targetId: escrow.id,
    payload: { reason: trimmed.slice(0, 500) },
    level: "WARN",
  });

  // Notify both parties that the order is under dispute.
  const parties = await partyUserIds(
    escrow.order.clientOrgId,
    escrow.order.factoryOrgId,
  );
  await emitNotificationToMany(parties, {
    type: NotificationType.SYSTEM,
    vars: { systemKey: "order_disputed" },
    contextType: "Order",
    contextId: escrow.orderId,
  });

  revalidatePath("/[lang]/admin/escrow", "page");
  return { ok: true };
}

const ResolveSchema = z.object({
  // STANDARD = off-spec/defective product: partial refund (policy: buyer
  //   gets back 80%, platform retains 20% split 50/50 with the supplier).
  // CUSTOM = personalised goods that can't be resold: full refund.
  // REJECT = dispute not upheld → escrow returns to HELD, payout can proceed.
  outcome: z.enum(["STANDARD", "CUSTOM", "REJECT"]),
});

export async function resolveDisputeAction(
  escrowId: string,
  outcome: "STANDARD" | "CUSTOM" | "REJECT",
): Promise<DisputeResult> {
  const admin = await requireRole(Role.ADMIN);

  const parsed = ResolveSchema.safeParse({ outcome });
  if (!parsed.success) {
    return { ok: false, error: "Invalid resolution." };
  }

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    select: {
      id: true,
      status: true,
      amountCents: true,
      provider: true,
      providerRef: true,
      orderId: true,
      order: { select: { clientOrgId: true, factoryOrgId: true } },
    },
  });
  if (!escrow) return { ok: false, error: "Escrow not found." };
  if (escrow.status !== EscrowStatus.DISPUTED) {
    return { ok: false, error: "This escrow isn't under dispute." };
  }

  // REJECT: dispute not upheld → escrow goes back to HELD so the normal
  // release flow can proceed on the next trigger.
  if (outcome === "REJECT") {
    await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { status: EscrowStatus.HELD },
    });
    await writeAuditLog({
      actorUserId: admin.id,
      action: "escrow.dispute_rejected",
      targetType: "EscrowTransaction",
      targetId: escrow.id,
    });
    revalidatePath("/[lang]/admin/escrow", "page");
    return { ok: true };
  }

  // Compute the buyer refund per policy (pure helper — see pricing.ts).
  // The 20% platform/supplier split on a STANDARD refund is recorded for
  // finance, not auto-disbursed in v1.
  const { refundCents, retainedCents, supplierShareCents, platformShareCents } =
    computeDisputeRefund(escrow.amountCents, outcome);

  // Issue the actual refund to the buyer. The buyer always pays via
  // Stripe, so escrow.provider is "stripe" and providerRef is the
  // PaymentIntent id. Refund against it for the computed amount.
  let refundRef: string | null = null;
  let refundError: string | null = null;
  if (escrow.provider === "stripe" && escrow.providerRef && refundCents > 0) {
    try {
      const { getStripe } = await import("@/lib/stripe/client");
      const stripe = getStripe();
      const refund = await stripe.refunds.create(
        {
          payment_intent: escrow.providerRef,
          amount: refundCents,
          metadata: { escrowId: escrow.id, outcome },
        },
        { idempotencyKey: `refund-${escrow.id}` },
      );
      refundRef = refund.id;
    } catch (e) {
      refundError = (e as Error).message.slice(0, 500);
    }
  } else if (escrow.provider !== "stripe") {
    refundError = `Refund rail for provider "${escrow.provider}" not automated — handle manually.`;
  }

  // Mark the escrow REFUNDED regardless of the provider call outcome: the
  // dispute decision is final, and a failed refund call is an ops replay
  // (we surface it via an ALERT audit), not a reason to leave the escrow
  // stuck in DISPUTED.
  await prisma.escrowTransaction.update({
    where: { id: escrow.id },
    data: { status: EscrowStatus.REFUNDED, releasedAt: new Date() },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: refundError ? "escrow.dispute_refund_failed" : "escrow.dispute_resolved",
    targetType: "EscrowTransaction",
    targetId: escrow.id,
    payload: {
      outcome,
      escrowAmountCents: escrow.amountCents,
      refundCents,
      retainedCents,
      platformShareCents,
      supplierShareCents,
      refundRef,
      refundError,
    },
    level: refundError ? "ALERT" : "WARN",
  });

  const parties = await partyUserIds(
    escrow.order.clientOrgId,
    escrow.order.factoryOrgId,
  );
  await emitNotificationToMany(parties, {
    type: NotificationType.SYSTEM,
    vars: { systemKey: "order_dispute_resolved" },
    contextType: "Order",
    contextId: escrow.orderId,
  });

  revalidatePath("/[lang]/admin/escrow", "page");
  return { ok: true };
}

async function partyUserIds(
  clientOrgId: string,
  factoryOrgId: string,
): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      organizationId: { in: [clientOrgId, factoryOrgId] },
      deletedAt: null,
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
