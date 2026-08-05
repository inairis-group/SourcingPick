import { NextResponse, type NextRequest } from "next/server";
import { handleInboundEmail } from "@/lib/email/inbound";

/**
 * Inbound-email webhook.
 *
 * Provider-agnostic on purpose: Postmark, SendGrid and Mailgun each name their
 * fields differently, and none of that belongs in the ingestion logic. This
 * route normalises a payload and hands it on.
 *
 * Auth is two independent layers, and both matter:
 *
 *  - `Authorization: Bearer ${INBOUND_EMAIL_SECRET}` proves the *webhook* is
 *    from our provider, not from anyone who found the URL.
 *  - The signed recipient token proves the *message* is a reply to a mail we
 *    sent. This is the one that can't be skipped, because the From header is
 *    forgeable and is therefore never used for routing.
 *
 * Always answers 200 for a mail we understood but chose not to act on
 * (unroutable, empty, target gone). Providers retry non-2xx, and retrying a
 * message that will never route is just noise — the body says what happened.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.INBOUND_EMAIL_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "INBOUND_EMAIL_SECRET not configured." },
      { status: 503 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v : null;

  // Every field any of the three providers might put the delivery address in.
  // We try them all and let the signature decide which one was real.
  const recipients = [
    str(payload.To),
    str(payload.to),
    str(payload.OriginalRecipient),
    str(payload.recipient),
    str(payload.envelope_to),
    ...(Array.isArray(payload.ToFull)
      ? payload.ToFull.map((e) =>
          typeof e === "object" && e !== null
            ? str((e as Record<string, unknown>).Email)
            : null,
        )
      : []),
  ]
    .filter((v): v is string => v !== null)
    // A single header can carry several addresses.
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

  const result = await handleInboundEmail({
    recipients,
    messageId:
      str(payload.MessageID) ??
      str(payload["Message-Id"]) ??
      str(payload.messageId) ??
      null,
    text: str(payload.TextBody) ?? str(payload.text) ?? str(payload["body-plain"]),
    html: str(payload.HtmlBody) ?? str(payload.html) ?? str(payload["body-html"]),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason });
  }
  return NextResponse.json({
    ok: true,
    deduped: result.deduped ?? false,
    kind: result.target.kind,
  });
}
