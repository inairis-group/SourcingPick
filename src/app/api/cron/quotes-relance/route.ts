import { NextResponse, type NextRequest } from "next/server";
import { dispatchQuoteRelances } from "@/lib/quotes/relance";

/**
 * Cron endpoint — daily quote-reminder sweep.
 *
 * Pings buyer + agent on quotes that have been sitting at
 * SENT_TO_CLIENT for 3+ business days without a decision. One ping per
 * quote, then we drop it — the agent can call manually after that.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}` (same model as the
 * other cron routes). Cadence: once a day, 07:00 UTC.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured." },
      { status: 503 },
    );
  }
  const got = req.headers.get("authorization");
  if (got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const result = await dispatchQuoteRelances();
  return NextResponse.json({ ok: true, ...result });
}
