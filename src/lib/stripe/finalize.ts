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

/**
 * Map the org's chosen payout provider to the Payout.method record value.
 * Wise is the only live rail (the legacy values were pruned from
 * PayoutProvider in the CTO-audit follow-up migration). PayoutMethod
 * retains the legacy values because historical Payout rows still
 * reference them for audit purposes.
 */
const PROVIDER_TO_METHOD: Record<PayoutProvider, PayoutMethod> = {
  WISE: PayoutMethod.WISE,
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
  return finalizeBuyerOrderPayment({
    orderId: input.orderId,
    type: input.type,
    amountCents: input.amountCents,
    provider: "stripe",
    providerRef: input.stripePaymentIntentId,
    appliedCreditCents: input.appliedCreditCents,
  });
}

/**
 * Provider-agnostic core finalize. The Stripe and Wise entry points are
 * thin wrappers — both write an invoice + escrow row + advance the order
 * status, differing only in the `provider` / `providerRef` columns we
 * record for downstream reconciliation. Idempotency is by `providerRef`.
 */
export async function finalizeBuyerOrderPayment(input: {
  orderId: string;
  type: typeof InvoiceType.DEPOSIT | typeof InvoiceType.BALANCE;
  amountCents: number;
  provider: "stripe" | "wise";
  providerRef: string;
  appliedCreditCents?: number;
}): Promise<{ applied: boolean }> {
  // Idempotency: bail if an escrow already exists for this provider ref.
  const existing = await prisma.escrowTransaction.findFirst({
    where: { providerRef: input.providerRef },
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
      deliveredAt: true,
      balancePaidAt: true,
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

  // CTO audit F1c: the finaliser previously forced COMPLETED on every
  // BALANCE payment regardless of current state — skipping SHIPPED /
  // IN_TRANSIT and erasing the logistics trail. It now only advances the
  // status when the move makes sense:
  //   - DEPOSIT  +  PAYMENT_PENDING        → PREPARATION
  //   - BALANCE  +  (SHIPPED | IN_TRANSIT) + deliveredAt set → COMPLETED
  //   - BALANCE  + anything else           → status unchanged; just
  //                                          stamp balancePaidAt so the
  //                                          buyer's eventual delivery
  //                                          confirmation can close it.
  let nextOrderStatus: OrderStatus | null = null;
  let nextRequestStatus: SourcingStatus | null = null;

  if (input.type === InvoiceType.DEPOSIT) {
    if (order.status === OrderStatus.PAYMENT_PENDING) {
      nextOrderStatus = OrderStatus.PREPARATION;
      nextRequestStatus = SourcingStatus.PREPARATION;
    }
  } else {
    const inLogistics =
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.IN_TRANSIT;
    if (inLogistics && order.deliveredAt) {
      nextOrderStatus = OrderStatus.COMPLETED;
      nextRequestStatus = SourcingStatus.COMPLETED;
    }
  }

  const completing = nextOrderStatus === OrderStatus.COMPLETED;

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
        provider: input.provider,
        providerRef: input.providerRef,
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
        ...(nextOrderStatus ? { status: nextOrderStatus } : {}),
        ...(input.type === InvoiceType.BALANCE
          ? { balancePaidAt: now }
          : {}),
      },
    });

    if (nextRequestStatus) {
      await tx.sourcingRequest.update({
        where: { id: order.requestId },
        data: { status: nextRequestStatus },
      });
    }
  });

  await writeAuditLog({
    action: "payment.received",
    targetType: "Order",
    targetId: order.id,
    payload: {
      type: input.type,
      amountCents: input.amountCents,
      provider: input.provider,
      providerRef: input.providerRef,
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
  } else if (completing) {
    // Closure path — balance just paid AND delivery already confirmed.
    // Notify everyone, release every HELD escrow on the order (CTO
    // audit F2 — used to leave the balance escrow HELD for life), and
    // dispatch the factory payout.
    await emitNotificationToMany(
      [...clientIds, ...factoryIds, ...agentIds],
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "order_completed" },
        contextType: "Order",
        contextId: order.id,
      },
    );
    await releaseFactoryPayout(order.id).catch(async (e) => {
      await writeAuditLog({
        action: "payout.release_failed",
        targetType: "Order",
        targetId: order.id,
        payload: { message: (e as Error).message },
        level: "ALERT",
      });
    });
  } else {
    // Balance landed but the buyer hasn't confirmed delivery yet — let
    // them know payment is in, but no payout or escrow release fires
    // until the closure path runs (via advanceOrderStatusAction once
    // they tap "I received it").
    await emitNotificationToMany([...clientIds, ...factoryIds, ...agentIds], {
      type: NotificationType.PAYMENT_RECEIVED,
      vars: { reference: order.reference },
      contextType: "Order",
      contextId: order.id,
    });
  }

  return { applied: true };
}

/**
 * Closure path used by both the finaliser and the delivery-confirmation
 * action: flip the order to COMPLETED, release every HELD escrow on it
 * (CTO audit F2), and dispatch the factory payout. Safe to call twice —
 * the `updateMany` only flips rows still in HELD and `releaseFactoryPayout`
 * is idempotent on the payout reference.
 */
export async function closeOrderOnCompletion(orderId: string): Promise<void> {
  await releaseFactoryPayout(orderId).catch(async (e) => {
    await writeAuditLog({
      action: "payout.release_failed",
      targetType: "Order",
      targetId: orderId,
      payload: { message: (e as Error).message },
      level: "ALERT",
    });
  });
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
          // Pricing v3 split: sourcing 1% supplier vs marketplace 1%
          // (same rate today but kept separate so they can diverge
          // without changing this query). The request's `origin`
          // tells us which flow this order came from.
          request: { select: { origin: true } },
        },
      },
      factoryOrg: {
        select: {
          // Wise is the live rail (CTO audit F8). The Stripe column
          // stays on the schema for historical orders but is no longer
          // read at payout time.
          payoutProvider: true,
          payoutAccountId: true,
          displayName: true,
        },
      },
    },
  });
  if (!order) return;

  // Release EVERY HELD escrow on the order — both the deposit row and
  // the balance row created when finalising the second payment. CTO
  // audit F2: this used to release the deposit-side only, leaving the
  // balance escrow HELD for life even though the factory had been paid
  // in full. The Payout row still anchors to the deposit escrow id so
  // legacy reports keep working; the new releaseMany covers the rest.
  const heldEscrows = await prisma.escrowTransaction.findMany({
    where: {
      orderId: order.id,
      status: EscrowStatus.HELD,
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (heldEscrows.length === 0) {
    throw new Error("No HELD escrow found for order — nothing to release.");
  }
  const primaryEscrow = heldEscrows[0]!;

  const pricingFlow =
    order.quote.request.origin === "SOURCING_FLOW" ? "sourcing" : "marketplace";
  const { grossCents, feeCents, netCents } = computeFactoryPayout(
    order.quote.unitPriceCentsFactory,
    order.quote.quantity,
    pricingFlow,
  );

  // Resolve the payout rail. CTO audit F8: the legacy Stripe-Connect
  // fallback was retired alongside the Wise migration. Orgs onboarded
  // before then carry a non-null `payoutProvider` (the migration
  // backfilled them); anything still missing both fields is treated as
  // "factory hasn't completed payout onboarding yet".
  const provider: PayoutProvider | null = order.factoryOrg.payoutProvider;
  const accountId = order.factoryOrg.payoutAccountId;

  const payoutReference = await generateUniqueReference("PAY");
  const now = new Date();

  let providerRef: string | null = null;
  let status: PayoutStatus = PayoutStatus.PENDING;
  let failureReason: string | null = null;
  // Default to WISE — the only live rail. The PROVIDER_TO_METHOD table
  // still maps each provider for historical orders.
  const method = provider ? PROVIDER_TO_METHOD[provider] : PayoutMethod.WISE;

  if (!provider || !accountId) {
    failureReason = "factory_payout_not_set_up";
  } else {
    const result = await dispatchProviderPayout(provider, {
      orgId: order.factoryOrgId,
      accountId,
      amountCents: netCents,
      currency: "EUR",
      idempotencyKey: `payout-${order.id}`,
      description: `Payout ${order.reference} (net of 6% supplier fee)`,
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
        // Anchor the payout to the primary (deposit) escrow id so
        // existing reporting joins keep their semantics. The full set
        // of released rows is reachable via Order → escrows.
        escrowId: primaryEscrow.id,
        amountCents: netCents,
        // Renamed from `commissionCents` — see Payout schema comment.
        supplierFeeCents: feeCents,
        method,
        status,
        scheduledAt: status === PayoutStatus.SENT ? null : now,
        sentAt: status === PayoutStatus.SENT ? now : null,
        providerRef,
        failureReason,
      },
    });
    // F2: release ALL HELD escrows in one updateMany so the balance
    // escrow no longer lingers HELD. releaseTrigger keeps the
    // DELIVERY_CONFIRMED label — after the F1b lifecycle changes,
    // closure literally requires the buyer's delivery confirmation.
    await tx.escrowTransaction.updateMany({
      where: {
        id: { in: heldEscrows.map((e) => e.id) },
        status: EscrowStatus.HELD,
      },
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
  return finalizeResearchFeeReceived({
    requestId: input.requestId,
    invoiceId: input.invoiceId,
    provider: "stripe",
    providerRef: input.stripePaymentIntentId,
  });
}

/**
 * Provider-agnostic research-fee finalize — same body, parameterised
 * provider/providerRef for the audit log. Used by the Wise reconciler.
 */
export async function finalizeResearchFeeReceived(input: {
  requestId: string;
  invoiceId: string;
  provider: "stripe" | "wise";
  providerRef: string;
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
    payload: { provider: input.provider, providerRef: input.providerRef },
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
