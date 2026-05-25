import "server-only";
import {
  EscrowReleaseTrigger,
  EscrowStatus,
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  OrderStatus,
  PayoutMethod,
  PayoutStatus,
  Role,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { computeFactoryPayout } from "@/lib/orders/pricing";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { getStripe } from "./client";

/**
 * Finalize a successful Stripe payment for an order.
 *
 * Idempotent on stripePaymentIntentId — if the webhook fires twice
 * (Stripe retries on 5xx for up to 3 days), the second call is a no-op.
 *
 * Performs the v1 escrow ledger work:
 *   1. Insert Invoice row (DEPOSIT or BALANCE, PAID)
 *   2. Insert EscrowTransaction (FUNDED → HELD)
 *   3. Advance Order to PREPARATION (for deposit) or COMPLETED (for balance)
 *   4. Mirror status onto the SourcingRequest
 *   5. Emit PAYMENT_RECEIVED / SHIPMENT notifications
 *
 * Returns whether the call actually did anything (true = applied; false =
 * already processed). Caller doesn't need to do anything different on
 * either branch — return value is informational only.
 */
export async function finalizeStripePayment(input: {
  orderId: string;
  type: typeof InvoiceType.DEPOSIT | typeof InvoiceType.BALANCE;
  amountCents: number;
  stripePaymentIntentId: string;
}): Promise<{ applied: boolean }> {
  // Idempotency: bail if an escrow already exists for this payment intent.
  const existing = await prisma.escrowTransaction.findFirst({
    where: { providerRef: input.stripePaymentIntentId },
    select: { id: true },
  });
  if (existing) return { applied: false };

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      reference: true,
      status: true,
      clientOrgId: true,
      factoryOrgId: true,
      agentId: true,
      requestId: true,
      factoryOrg: { select: { displayName: true } },
    },
  });
  if (!order) {
    throw new Error(`Order ${input.orderId} not found while finalizing payment.`);
  }

  const invoiceReference = await generateUniqueReference("INV");
  const escrowReference = await generateUniqueReference("ESC");
  const now = new Date();

  const nextOrderStatus =
    input.type === InvoiceType.DEPOSIT
      ? OrderStatus.PREPARATION
      : OrderStatus.COMPLETED;
  const nextRequestStatus =
    input.type === InvoiceType.DEPOSIT
      ? SourcingStatus.PREPARATION
      : SourcingStatus.COMPLETED;

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        reference: invoiceReference,
        orderId: order.id,
        organizationId: order.clientOrgId,
        type: input.type,
        amountCents: input.amountCents,
        issuedAt: now,
        dueAt: now,
        paidAt: now,
        status: InvoiceStatus.PAID,
      },
      select: { id: true },
    });

    await tx.escrowTransaction.create({
      data: {
        reference: escrowReference,
        orderId: order.id,
        invoiceId: invoice.id,
        amountCents: input.amountCents,
        status: EscrowStatus.HELD,
        fundedAt: now,
        provider: "stripe",
        providerRef: input.stripePaymentIntentId,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: nextOrderStatus,
        ...(input.type === InvoiceType.BALANCE ? { deliveredAt: now } : {}),
      },
    });

    await tx.sourcingRequest.update({
      where: { id: order.requestId },
      data: { status: nextRequestStatus },
    });
  });

  await writeAuditLog({
    action: "payment.received",
    targetType: "Order",
    targetId: order.id,
    payload: {
      type: input.type,
      amountCents: input.amountCents,
      stripePaymentIntentId: input.stripePaymentIntentId,
      invoiceReference,
      escrowReference,
    },
  });

  // Notify the right people for each transition.
  const factoryIds = (
    await prisma.user.findMany({
      where: {
        organizationId: order.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  const clientIds = (
    await prisma.user.findMany({
      where: {
        organizationId: order.clientOrgId,
        role: Role.CLIENT,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  const agentIds = order.agentId ? [order.agentId] : [];

  if (input.type === InvoiceType.DEPOSIT) {
    await emitNotificationToMany([...factoryIds, ...agentIds], {
      type: NotificationType.PAYMENT_RECEIVED,
      vars: { reference: order.reference },
      contextType: "Order",
      contextId: order.id,
    });
  } else {
    await emitNotificationToMany(
      [...clientIds, ...factoryIds, ...agentIds],
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "order_completed" },
        contextType: "Order",
        contextId: order.id,
      },
    );
    // Balance is paid → time to push the factory's net to their Connect
    // account. Failures here are recorded as PENDING payouts so an admin
    // can replay manually; we never rollback the order completion.
    await releaseFactoryPayout(order.id).catch(async (e) => {
      await writeAuditLog({
        action: "payout.release_failed",
        targetType: "Order",
        targetId: order.id,
        payload: { message: (e as Error).message },
        level: "ALERT",
      });
    });
  }

  return { applied: true };
}

/**
 * After balance is paid, transfer the factory's net payout from the
 * platform account to their Connect Express account, mark the escrow
 * RELEASED, and emit a PAYMENT_RECEIVED notification.
 *
 * Behaviour by Connect state:
 *  - No connected account yet            → Payout row at PENDING, no transfer attempt
 *  - Connected but payouts_enabled false → Payout row at PENDING + failureReason
 *  - Connected & ready                   → Transfer fires, Payout row at SENT
 */
async function releaseFactoryPayout(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      reference: true,
      factoryOrgId: true,
      agentId: true,
      quote: {
        select: {
          unitPriceCentsFactory: true,
          quantity: true,
        },
      },
      factoryOrg: {
        select: { stripeConnectAccountId: true, displayName: true },
      },
    },
  });
  if (!order) return;

  // Find the *deposit-side* escrow (held since the deposit), which is the
  // row we mark RELEASED. The balance escrow row created moments ago is
  // also released — for v1 we release the deposit-escrow as the canonical
  // marker of "funds out the door"; in Phase 6 we'll split this per leg.
  const escrow = await prisma.escrowTransaction.findFirst({
    where: {
      orderId: order.id,
      status: EscrowStatus.HELD,
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!escrow) {
    throw new Error("No HELD escrow found for order — nothing to release.");
  }

  const { grossCents, feeCents, netCents } = computeFactoryPayout(
    order.quote.unitPriceCentsFactory,
    order.quote.quantity,
  );

  const payoutReference = await generateUniqueReference("PAY");
  const connectAccountId = order.factoryOrg.stripeConnectAccountId;
  const now = new Date();

  let transferId: string | null = null;
  let status: PayoutStatus = PayoutStatus.PENDING;
  let failureReason: string | null = null;

  if (!connectAccountId) {
    failureReason = "factory_connect_not_set_up";
  } else {
    try {
      const stripe = getStripe();
      const transfer = await stripe.transfers.create(
        {
          amount: netCents,
          currency: "eur",
          destination: connectAccountId,
          description: `Payout ${order.reference} (net of 3% supplier fee)`,
          metadata: {
            orderId: order.id,
            orderReference: order.reference,
            grossCents: String(grossCents),
            feeCents: String(feeCents),
          },
        },
        {
          // Make the transfer call idempotent against webhook retries.
          idempotencyKey: `payout-${order.id}`,
        },
      );
      transferId = transfer.id;
      status = PayoutStatus.SENT;
    } catch (e) {
      failureReason = (e as Error).message.slice(0, 500);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.payout.create({
      data: {
        reference: payoutReference,
        factoryOrgId: order.factoryOrgId,
        escrowId: escrow.id,
        amountCents: netCents,
        commissionCents: feeCents,
        method: PayoutMethod.STRIPE_CONNECT,
        status,
        scheduledAt: status === PayoutStatus.SENT ? null : now,
        sentAt: status === PayoutStatus.SENT ? now : null,
        providerRef: transferId,
        failureReason,
      },
    });
    await tx.escrowTransaction.update({
      where: { id: escrow.id },
      data: {
        status: EscrowStatus.RELEASED,
        releasedAt: now,
        releaseTrigger: EscrowReleaseTrigger.DELIVERY_CONFIRMED,
      },
    });
  });

  await writeAuditLog({
    action:
      status === PayoutStatus.SENT
        ? "payout.sent"
        : "payout.pending_connect_setup",
    targetType: "Order",
    targetId: order.id,
    payload: {
      payoutReference,
      netCents,
      feeCents,
      transferId,
      failureReason,
    },
    level: status === PayoutStatus.SENT ? "INFO" : "WARN",
  });

  const factoryIds = (
    await prisma.user.findMany({
      where: {
        organizationId: order.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);

  if (status === PayoutStatus.SENT && factoryIds.length > 0) {
    await emitNotificationToMany(factoryIds, {
      type: NotificationType.PAYMENT_RECEIVED,
      vars: { reference: payoutReference },
      contextType: "Order",
      contextId: order.id,
    });
  }
}
