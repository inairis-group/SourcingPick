import { NextResponse, type NextRequest } from "next/server";
import { settleEndedAuctions } from "@/lib/auctions/settle";

/**
 * Cron endpoint — settles every ACTIVE auction whose endsAt has passed.
 * Each auction is settled in its own transaction + a buy-then-materialise
 * post-step that creates the Order so the buyer can pay via Wise. Safe
 * to run at any frequency; idempotent on auction status + materialised
 * order id.
 *
 * Auth model is identical to other cron endpoints — Authorization Bearer
 * with `CRON_SECRET`. Suggested cadence: every 1–5 minutes (Vercel Cron
 * or a VPS systemd timer).
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

  const result = await settleEndedAuctions();
  return NextResponse.json({ ok: true, ...result });
}
