import "server-only";
import { InvoiceType, ResearchFeeStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import {
  finalizeBuyerOrderPayment,
  finalizeResearchFeeReceived,
} from "@/lib/stripe/finalize";

/**
 * Wise webhook reconciliation: match an incoming balance-credit event to
 * an outstanding obligation by parsing the wire memo, then dispatch to
 * the existing provider-agnostic finalizers (the same ones the Stripe
 * webhook calls — the only difference is `provider: "wise"` on the
 * recorded escrow row).
 *
 * Memo format the platform tells buyers to include (set in
 * `lib/wise/platform-account.ts#buildWireReference`):
 *
 *   ORD-{NNNNN}-DEP   30% deposit on order ref ORD-NNNNN
 *   ORD-{NNNNN}-BAL   70% balance on order ref ORD-NNNNN
 *   REQ-{NNNNNN}-FEE  research fee on request ref REQ-NNNNNN
 *
 * Real wire memos drift — banks insert "RE:" prefixes, truncate at 35
 * chars, lowercase, etc. We scan the memo with a regex that's permissive
 * about surrounding noise but strict about the structure we care about.
 */

// Buyers paste references through every keyboard layout known to humanity
// — extra spaces, lowercase, non-breaking spaces, hyphens turned to
// dashes by autocorrect. We normalise first (uppercase + collapse
// whitespace + strip odd unicode) then match with regex that tolerates
// any amount of whitespace / dashes between the parts. The captured
// reference is reassembled with single dashes so the downstream lookup
// against `Order.reference` stays exact.
const ORDER_MEMO_RE = /\bORD[\s-]*(\d{3,8})[\s-]+(DEP|BAL)\b/i;
const REQUEST_MEMO_RE = /\bREQ[\s-]*(\d{5,9})[\s-]+FEE\b/i;

function normaliseMemo(raw: string): string {
  return raw
    .normalize("NFKD")
    // Replace non-breaking spaces, en/em dashes, etc. with ASCII equivalents.
    .replace(/[  -​ ]/g, " ")
    .replace(/[‐-―]/g, "-")
    // Collapse repeated whitespace.
    .replace(/\s+/g, " ")
    .trim();
}

export type WiseBalanceCreditEvent = {
  /** Wise transfer / transaction id — used as the idempotency providerRef. */
  transactionId: string;
  /** Amount credited, in the smallest unit of `currency`. */
  amountCents: number;
  currency: string;
  /**
   * Any free-text fields the wire arrived with — Wise sometimes puts the
   * buyer's memo in `reference`, sometimes in `note` / `narrative`. We
   * scan all of them.
   */
  memoCandidates: string[];
};

export type ReconcileResult =
  | { matched: true; kind: "DEPOSIT" | "BALANCE" | "RESEARCH_FEE"; ref: string }
  | { matched: false; reason: string };

export async function reconcileWiseBalanceCredit(
  event: WiseBalanceCreditEvent,
): Promise<ReconcileResult> {
  const joinedMemo = normaliseMemo(
    event.memoCandidates.filter(Boolean).join(" "),
  );
  if (!joinedMemo) {
    return { matched: false, reason: "No memo / reference fields in event." };
  }

  const orderMatch = joinedMemo.match(ORDER_MEMO_RE);
  if (orderMatch) {
    const [, digits, rawKind] = orderMatch;
    // Always pass the canonical form to the DB lookup, never the raw
    // user-typed variant. This is what made the partner's "ord 12345 dep"
    // wires fall through before the normalisation pass landed.
    const orderRef = `ORD-${digits}`;
    const kind = rawKind.toUpperCase() as "DEP" | "BAL";
    return reconcileOrderPayment({
      orderRef,
      kind,
      transactionId: event.transactionId,
      amountCents: event.amountCents,
    });
  }

  const requestMatch = joinedMemo.match(REQUEST_MEMO_RE);
  if (requestMatch) {
    const [, digits] = requestMatch;
    const requestRef = `REQ-${digits}`;
    return reconcileResearchFee({
      requestRef,
      transactionId: event.transactionId,
    });
  }

  return {
    matched: false,
    reason: `No recognised reference pattern found in memo: "${joinedMemo.slice(0, 200)}"`,
  };
}

async function reconcileOrderPayment(input: {
  orderRef: string;
  kind: "DEP" | "BAL";
  transactionId: string;
  amountCents: number;
}): Promise<ReconcileResult> {
  const order = await prisma.order.findUnique({
    where: { reference: input.orderRef },
    select: {
      id: true,
      reference: true,
      depositCents: true,
      balanceCents: true,
    },
  });
  if (!order) {
    await writeAuditLog({
      action: "wise.reconcile_no_match",
      level: "WARN",
      payload: {
        orderRef: input.orderRef,
        kind: input.kind,
        transactionId: input.transactionId,
      },
    });
    return { matched: false, reason: `Order ${input.orderRef} not found.` };
  }

  const expected =
    input.kind === "DEP" ? order.depositCents : order.balanceCents;
  // Tolerate a tiny FX-rounding drift; Wise can round in either direction
  // when the buyer wires from a non-EUR account. Use the expected amount
  // for the recorded invoice/escrow either way — the buyer-side variance
  // is the platform's problem to absorb at this scale.
  if (Math.abs(input.amountCents - expected) > 100) {
    await writeAuditLog({
      action: "wise.reconcile_amount_mismatch",
      level: "WARN",
      targetType: "Order",
      targetId: order.id,
      payload: {
        kind: input.kind,
        expectedCents: expected,
        receivedCents: input.amountCents,
        transactionId: input.transactionId,
      },
    });
    return {
      matched: false,
      reason: `Amount mismatch on ${order.reference}: expected ${expected}c, got ${input.amountCents}c.`,
    };
  }

  await finalizeBuyerOrderPayment({
    orderId: order.id,
    type:
      input.kind === "DEP" ? InvoiceType.DEPOSIT : InvoiceType.BALANCE,
    amountCents: expected,
    provider: "wise",
    providerRef: input.transactionId,
  });

  return {
    matched: true,
    kind: input.kind === "DEP" ? "DEPOSIT" : "BALANCE",
    ref: order.reference,
  };
}

async function reconcileResearchFee(input: {
  requestRef: string;
  transactionId: string;
}): Promise<ReconcileResult> {
  const request = await prisma.sourcingRequest.findUnique({
    where: { reference: input.requestRef },
    select: {
      id: true,
      reference: true,
      researchFeeStatus: true,
      researchFeeInvoiceId: true,
    },
  });
  if (!request) {
    return {
      matched: false,
      reason: `Request ${input.requestRef} not found.`,
    };
  }
  if (request.researchFeeStatus !== ResearchFeeStatus.QUOTED) {
    return {
      matched: false,
      reason: `Request ${input.requestRef} research fee is not QUOTED (status: ${request.researchFeeStatus}).`,
    };
  }
  if (!request.researchFeeInvoiceId) {
    return {
      matched: false,
      reason: `Request ${input.requestRef} has no research-fee invoice on file.`,
    };
  }

  await finalizeResearchFeeReceived({
    requestId: request.id,
    invoiceId: request.researchFeeInvoiceId,
    provider: "wise",
    providerRef: input.transactionId,
  });

  return { matched: true, kind: "RESEARCH_FEE", ref: request.reference };
}
