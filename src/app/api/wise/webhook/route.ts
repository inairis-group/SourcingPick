import { NextResponse } from "next/server";
import { WebhookSource, WebhookStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { verifyWiseWebhookSignature } from "@/lib/wise/webhook-signature";
import {
  reconcileWiseBalanceCredit,
  type WiseBalanceCreditEvent,
} from "@/lib/wise/reconcile";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Wise webhook receiver.
 *
 * Phase 1 (this scaffold): verify the RSA signature and audit-log every
 * verified event. **No business effects yet** — the per-event dispatcher
 * (incoming balance credit → finalize invoice, transfer state change →
 * mark payout, etc.) lands once the Stripe finalize.ts equivalent is
 * ported in Pass 3b's follow-up.
 *
 * Until `WISE_WEBHOOK_PUBLIC_KEY` is set + the exact signature header
 * name is confirmed against current Wise docs, every event is rejected
 * with 401. Fail-closed by design — never trust unsigned input.
 *
 * Wise expects a 200 to count delivery as successful; non-2xx triggers
 * exponential-backoff retries. We return 401 on signature failures
 * (Wise won't retry indefinitely on auth errors) and 500 only on
 * unexpected exceptions (which Wise will retry).
 */

// Wise's signature header name — TODO: confirm against docs. Wise's
// recent docs reference "X-Signature-SHA256" but some legacy material
// uses "X-Signature". Verify before flipping verification on in prod.
const SIGNATURE_HEADER_CANDIDATES = [
  "x-signature-sha256",
  "x-signature",
] as const;

export async function POST(req: Request): Promise<NextResponse> {
  // We must read the body as a string for signature verification — JSON-
  // parsing first would lose the exact bytes Wise signed.
  const rawBody = await req.text();
  const signature = pickSignatureHeader(req.headers);

  const verification = verifyWiseWebhookSignature({
    rawBody,
    signatureHeader: signature,
  });

  if (!verification.ok) {
    await writeAuditLog({
      action: "wise.webhook_rejected",
      level: "WARN",
      payload: { reason: verification.reason, signaturePresent: Boolean(signature) },
    });
    return NextResponse.json(
      { error: "Signature verification failed." },
      { status: 401 },
    );
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Body is not valid JSON." },
      { status: 400 },
    );
  }

  const eventType = readEventType(event);

  // Persist the verified delivery so the admin webhook dashboard can show
  // every Wise event — matched, unmatched, or unparseable — alongside
  // Stripe (partner item #6). The row is materialised before dispatch so
  // we can flip its status based on the outcome and link the audit log
  // entries by webhookEventId.
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      source: WebhookSource.WISE,
      eventType,
      signature: signature ?? null,
      payload: safeJsonForStorage(event, rawBody),
      status: WebhookStatus.RECEIVED,
      attempts: 1,
    },
    select: { id: true },
  });

  await writeAuditLog({
    action: "wise.webhook_received",
    targetType: "WebhookEvent",
    targetId: webhookEvent.id,
    payload: { type: eventType },
  });

  // Dispatch by event type. Today's handler reconciles incoming buyer
  // wires; transfer state-change handlers (factory payouts) land with
  // 3b.5 once the dispatch path is real.
  if (eventType === "balances#credit") {
    const credit = readBalanceCreditEvent(event);
    if (!credit) {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          lastError: "Unparseable balance-credit payload.",
          processedAt: new Date(),
        },
      });
      await writeAuditLog({
        action: "wise.webhook_unparseable_credit",
        level: "WARN",
        targetType: "WebhookEvent",
        targetId: webhookEvent.id,
        payload: { raw: rawBody.slice(0, 2000) },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }
    try {
      const result = await reconcileWiseBalanceCredit(credit);
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: result.matched
            ? WebhookStatus.PROCESSED
            : WebhookStatus.FAILED,
          lastError: result.matched ? null : result.reason,
          processedAt: new Date(),
        },
      });
      await writeAuditLog({
        action: result.matched
          ? "wise.reconcile_matched"
          : "wise.reconcile_unmatched",
        level: result.matched ? "INFO" : "WARN",
        targetType: "WebhookEvent",
        targetId: webhookEvent.id,
        payload: result.matched
          ? { kind: result.kind, ref: result.ref, transactionId: credit.transactionId }
          : { reason: result.reason, transactionId: credit.transactionId },
      });
    } catch (e) {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          lastError: e instanceof Error ? e.message : "Unknown error",
          processedAt: new Date(),
        },
      });
      await writeAuditLog({
        action: "wise.reconcile_failed",
        level: "ALERT",
        targetType: "WebhookEvent",
        targetId: webhookEvent.id,
        payload: { message: e instanceof Error ? e.message : "Unknown" },
      });
      // Return 500 so Wise retries with backoff.
      return NextResponse.json({ error: "Reconcile failed" }, { status: 500 });
    }
  } else {
    // Unhandled event type — record it but mark PROCESSED so it doesn't
    // sit in the FAILED bucket. Replay would do nothing useful anyway.
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: WebhookStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Safe JSON shape for the persisted webhook row. If the body wasn't valid
 * JSON or the parsed event is null, we fall back to a wrapper that keeps
 * the raw bytes — admins can still inspect what Wise actually sent.
 */
function safeJsonForStorage(event: unknown, rawBody: string): object {
  if (event && typeof event === "object") return event as object;
  return { _rawBody: rawBody.slice(0, 8000) };
}

/**
 * Coerce Wise's balance-credit payload into our internal shape. Wise's
 * exact field names vary across docs versions — we read every memo-ish
 * field we can find and let the reconciler regex the joined string.
 */
function readBalanceCreditEvent(event: unknown): WiseBalanceCreditEvent | null {
  if (!event || typeof event !== "object") return null;
  const e = event as Record<string, unknown>;
  const data = (e.data ?? e) as Record<string, unknown>;

  const transactionId = pickString(
    data.transaction_id,
    data.transactionId,
    data.transferId,
    data.id,
    e.id,
  );
  if (!transactionId) return null;

  const amount = pickNumber(
    data.amount_value,
    data.amount,
    (data.amount as { value?: unknown } | undefined)?.value,
  );
  const currency = pickString(
    data.currency,
    (data.amount as { currency?: unknown } | undefined)?.currency,
  );
  if (amount === null || !currency) return null;

  // Wise can return amount as a decimal string or number in major units —
  // convert to cents. If it's already a small integer (< 1000) the caller
  // probably meant cents; otherwise assume major units.
  const amountCents =
    Number.isInteger(amount) && amount > 1000
      ? amount
      : Math.round(amount * 100);

  const memoCandidates = [
    pickString(data.reference, data.reference_number, data.referenceNumber),
    pickString(data.note, data.narrative, data.description),
    pickString(data.merchant_reference, data.merchantReference),
  ].filter((s): s is string => Boolean(s));

  return {
    transactionId: String(transactionId),
    amountCents,
    currency: String(currency).toUpperCase(),
    memoCandidates,
  };
}

function pickString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim() !== "") return c;
  }
  return null;
}

function pickNumber(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && c.trim() !== "") {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function pickSignatureHeader(headers: Headers): string | null {
  for (const name of SIGNATURE_HEADER_CANDIDATES) {
    const v = headers.get(name);
    if (v) return v;
  }
  return null;
}

function readEventType(event: unknown): string {
  if (
    typeof event === "object" &&
    event !== null &&
    "event_type" in event &&
    typeof (event as { event_type: unknown }).event_type === "string"
  ) {
    return (event as { event_type: string }).event_type;
  }
  return "unknown";
}
