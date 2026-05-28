import "server-only";
import {
  CreditReason,
  EscrowReleaseTrigger,
  EscrowStatus,
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  OrderStatus,
  PayoutMethod,
  PayoutProvider,
  PayoutStatus,
  Role,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { computeFactoryPayout } from "@/lib/orders/pricing";
import { getOrgCreditBalanceCents } from "@/lib/credit/balance";
import { dispatchProviderPayout } from "@/lib/payouts/dispatch";
import { generateUniqueReference } from "@/lib/sourcing/reference";

/** Map the org's chosen payout provider to the Payout.method record value. */
const PROVIDER_TO_METHOD: Record<PayoutProvider, PayoutMethod> = {
  STRIPE_CONNECT: PayoutMethod.STRIPE_CONNECT,
  LIANLIAN: PayoutMethod.LIANLIAN,
  ALIPAY: PayoutMethod.ALIPAY,
};

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
  /**
   * Platform credit applied alongside the Stripe charge (deposit only).
   * The invoice + escrow record the FULL obligation (charge + credit); the
   * applied credit is debited from the buyer's ledger here.
   */
  appliedCreditCents?: number;
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
  const appliedCreditCents = Math.max(0, input.appliedCreditCents ?? 0);
  // The invoice + escrow record the full obligation: what Stripe charged
  // plus any platform credit the buyer applied.
  const recordedCents = input.amountCents + appliedCreditCents;

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
        amountCents: recordedCents,
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
        amountCents: recordedCents,
        status: EscrowStatus.HELD,
        fundedAt: now,
        provider: "stripe",
        providerRef: input.stripePaymentIntentId,
      },
    });

    // Debit the applied platform credit from the buyer's ledger.
    if (appliedCreditCents > 0) {
      await tx.creditTransaction.create({
        data: {
          organizationId: order.clientOrgId,
          amountCents: -appliedCreditCents,
          reason: CreditReason.ORDER_APPLIED,
          refType: "Order",
          refId: order.id,
          note: `Applied to ${order.reference} deposit`,
        },
      });
    }

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
 * After balance is paid, release the factory's net payout through whichever
 * provider they onboarded with (Stripe Connect / LianLian / Alipay), mark
 * the escrow RELEASED, and emit a PAYMENT_RECEIVED notification.
 *
 * Provider-agnostic: resolves the org's `payoutProvider` + `payoutAccountId`
 * (falling back to the legacy `stripeConnectAccountId`) and routes through
 * `dispatchProviderPayout`. Behaviour:
 *  - No provider / account onboarded     → Payout row at PENDING, no dispatch
 *  - Provider dispatch succeeds          → Payout row at SENT + providerRef
 *  - Provider dispatch fails / stubbed   → Payout row at PENDING + failureReason
 *
 * We never roll back order completion on payout failure — a PENDING payout
 * is replayable by an admin once the provider account is ready.
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
        select: {
          stripeConnectAccountId: true,
          payoutProvider: true,
          payoutAccountId: true,
          displayName: true,
        },
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

  // Resolve the payout rail. Prefer the explicit provider/account; fall
  // back to the legacy Stripe Connect id for orgs onboarded before the
  // multi-provider migration (the migration backfilled most of these).
  const provider: PayoutProvider | null =
    order.factoryOrg.payoutProvider ??
    (order.factoryOrg.stripeConnectAccountId
      ? PayoutProvider.STRIPE_CONNECT
      : null);
  const accountId =
    order.factoryOrg.payoutAccountId ??
    order.factoryOrg.stripeConnectAccountId ??
    null;

  const payoutReference = await generateUniqueReference("PAY");
  const now = new Date();

  let providerRef: string | null = null;
  let status: PayoutStatus = PayoutStatus.PENDING;
  let failureReason: string | null = null;
  const method = provider
    ? PROVIDER_TO_METHOD[provider]
    : PayoutMethod.STRIPE_CONNECT;

  if (!provider || !accountId) {
    failureReason = "factory_payout_not_set_up";
  } else {
    const result = await dispatchProviderPayout(provider, {
      orgId: order.factoryOrgId,
      accountId,
      amountCents: netCents,
      currency: "EUR",
      idempotencyKey: `payout-${order.id}`,
      description: `Payout ${order.reference} (net of 3% supplier fee)`,
    });
    if (result.ok) {
      providerRef = result.providerRef;
      status = PayoutStatus.SENT;
    } else {
      failureReason = result.error.slice(0, 500);
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
        method,
        status,
        scheduledAt: status === PayoutStatus.SENT ? null : now,
        sentAt: status === PayoutStatus.SENT ? now : null,
        providerRef,
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
        : "payout.pending_provider_setup",
    targetType: "Order",
    targetId: order.id,
    payload: {
      payoutReference,
      provider,
      method,
      netCents,
      feeCents,
      grossCents,
      providerRef,
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

/**
 * Settle an order's deposit entirely from platform credit — the path taken
 * when the buyer's credit balance covers the full deposit, so there's no
 * Stripe charge. Mirrors the deposit branch of finalizeStripePayment:
 * invoice (PAID) + escrow (HELD) + order → PREPARATION + ledger debit, all
 * in one transaction. Idempotent on the synthetic credit providerRef.
 */
export async function finalizeDepositByCredit(input: {
  orderId: string;
  appliedCreditCents: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const providerRef = `credit-${input.orderId}-deposit`;

  const existing = await prisma.escrowTransaction.findFirst({
    where: { providerRef },
    select: { id: true },
  });
  if (existing) return { ok: true }; // already settled

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
      depositCents: true,
    },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== OrderStatus.PAYMENT_PENDING) {
    return { ok: false, error: "This order is not awaiting payment." };
  }

  // Re-check the balance to guard against a race (two tabs, concurrent
  // checkouts). The application amount should equal the deposit.
  const balance = await getOrgCreditBalanceCents(order.clientOrgId);
  if (balance < input.appliedCreditCents) {
    return { ok: false, error: "Insufficient platform credit." };
  }
  if (input.appliedCreditCents < order.depositCents) {
    return { ok: false, error: "Credit doesn't cover the full deposit." };
  }

  const invoiceReference = await generateUniqueReference("INV");
  const escrowReference = await generateUniqueReference("ESC");
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        reference: invoiceReference,
        orderId: order.id,
        organizationId: order.clientOrgId,
        type: InvoiceType.DEPOSIT,
        amountCents: order.depositCents,
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
        amountCents: order.depositCents,
        status: EscrowStatus.HELD,
        fundedAt: now,
        provider: "credit",
        providerRef,
      },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId: order.clientOrgId,
        amountCents: -order.depositCents,
        reason: CreditReason.ORDER_APPLIED,
        refType: "Order",
        refId: order.id,
        note: `Applied to ${order.reference} deposit (full)`,
      },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PREPARATION },
    });
    await tx.sourcingRequest.update({
      where: { id: order.requestId },
      data: { status: SourcingStatus.PREPARATION },
    });
  });

  await writeAuditLog({
    action: "payment.deposit_settled_by_credit",
    targetType: "Order",
    targetId: order.id,
    payload: { depositCents: order.depositCents, escrowReference },
  });

  const recipients = await prisma.user.findMany({
    where: {
      organizationId: order.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  const recipientIds = [
    ...recipients.map((u) => u.id),
    ...(order.agentId ? [order.agentId] : []),
  ];
  if (recipientIds.length > 0) {
    await emitNotificationToMany(recipientIds, {
      type: NotificationType.PAYMENT_RECEIVED,
      vars: { reference: order.reference },
      contextType: "Order",
      contextId: order.id,
    });
  }

  return { ok: true };
}

/**
 * Finalize a research-fee payment (Stripe). Marks the RESEARCH_FEE invoice
 * PAID and stamps the request researchFeeStatus=PAID + researchFeePaidAt
 * (the 30-day credit-back window anchor). Idempotent on the invoice's
 * paid state.
 */
export async function finalizeResearchFeePayment(input: {
  requestId: string;
  invoiceId: string;
  stripePaymentIntentId: string;
}): Promise<{ applied: boolean }> {
  const request = await prisma.sourcingRequest.findUnique({
    where: { id: input.requestId },
    select: {
      id: true,
      reference: true,
      clientOrgId: true,
      agentId: true,
      researchFeeStatus: true,
      researchFeeInvoiceId: true,
    },
  });
  if (!request) {
    throw new Error(`Request ${input.requestId} not found finalizing research fee.`);
  }
  // Idempotency: already paid → no-op.
  if (request.researchFeeStatus === "PAID") return { applied: false };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    if (input.invoiceId) {
      await tx.invoice.updateMany({
        where: { id: input.invoiceId },
        data: { status: InvoiceStatus.PAID, paidAt: now },
      });
    }
    await tx.sourcingRequest.update({
      where: { id: request.id },
      data: { researchFeeStatus: "PAID", researchFeePaidAt: now },
    });
  });

  await writeAuditLog({
    action: "research_fee.paid",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: { stripePaymentIntentId: input.stripePaymentIntentId },
  });

  // Notify the agent the buyer has paid — they can start sourcing.
  if (request.agentId) {
    await emitNotificationToMany([request.agentId], {
      type: NotificationType.PAYMENT_RECEIVED,
      vars: { reference: request.reference },
      contextType: "SourcingRequest",
      contextId: request.id,
    });
  }

  return { applied: true };
}
