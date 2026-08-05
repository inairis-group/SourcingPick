import { NextResponse, type NextRequest } from "next/server";
import { InvoiceType, WebhookSource } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { finalizeBuyerOrderPayment } from "@/lib/payments/finalize";
import {
  PINGPONG_SIGNATURE_HEADER,
  parsePingPongEvent,
  verifyPingPongSignature,
} from "@/lib/payments/pingpong/webhook";

/**
 * PingPong webhook — the buyer-payment side of the rail.
 *
 * Feeds the same provider-agnostic escrow seam every rail before it used:
 * `finalizeBuyerOrderPayment({ orderId, type, amountCents, provider,
 * providerRef })`, where providerRef is the idempotency key. That function
 * creates the Invoice, records the EscrowTransaction as HELD, advances the
 * Order state machine and releases the factory payout when the balance is paid
 * and delivery confirmed. None of that is PingPong's business, which is why it
 * survived the rail change untouched.
 *
 * Reads the body as raw text and verifies before parsing — signing a
 * re-serialised payload is how a signature check ends up validating something
 * other than what was sent.
 *
 * Every delivery is recorded in WebhookEvent first, so an event we reject is
 * still visible in the admin dashboard and replayable.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get(PINGPONG_SIGNATURE_HEADER);

  const verified = verifyPingPongSignature(raw, signature);
  if (!verified.ok) {
    // 400, not 500: a bad signature will never succeed on retry.
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const event = parsePingPongEvent(payload);
  if (!event) {
    return NextResponse.json({ error: "unrecognised_payload" }, { status: 400 });
  }

  // Record before acting. If handling throws, ops can still see what arrived.
  // WebhookEvent has no unique key on the provider id, so idempotency is not
  // enforced here — it is enforced where it matters, on
  // EscrowTransaction.providerRef inside finalizeBuyerOrderPayment. A
  // duplicate delivery therefore costs one extra audit row and moves no money.
  await prisma.webhookEvent.create({
    data: {
      source: WebhookSource.PINGPONG,
      eventType: event.type,
      signature,
      payload: payload as object,
    },
  });

  if (event.type !== "payment.succeeded") {
    // Acknowledged and stored, deliberately not acted on.
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const d = event.data;
  const orderId = typeof d.orderId === "string" ? d.orderId : null;
  const providerRef = typeof d.transactionId === "string" ? d.transactionId : event.id;
  const amountCents = typeof d.amountCents === "number" ? d.amountCents : null;
  const legRaw = typeof d.leg === "string" ? d.leg : null;
  const type = legRaw === "BALANCE" ? InvoiceType.BALANCE : InvoiceType.DEPOSIT;

  if (!orderId || amountCents === null) {
    return NextResponse.json({ error: "missing_order_reference" }, { status: 400 });
  }

  await finalizeBuyerOrderPayment({
    orderId,
    type,
    amountCents,
    provider: "pingpong",
    providerRef,
  });

  return NextResponse.json({ ok: true });
}
