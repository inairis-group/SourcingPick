import { NextResponse, type NextRequest } from "next/server";
import { sweepExpiredFlashSales } from "@/lib/marketplace/flash-sale-sweep";

/**
 * Cron endpoint — clears expired flash-sale fields on marketplace listings.
 *
 * Auth:
 *   - Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when a
 *     `crons` entry in `vercel.json` triggers this URL.
 *   - On a VPS, run the same URL from `cron`/`systemd` with the same
 *     Authorization header. Same secret, same route, same auth model.
 *
 * Returns the number of rows cleared so the cron log is meaningful.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  // If CRON_SECRET isn't set, refuse rather than running unauthenticated —
  // a misconfigured prod could otherwise let anyone hit this endpoint.
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

  const result = await sweepExpiredFlashSales();
  return NextResponse.json({ ok: true, ...result });
}
