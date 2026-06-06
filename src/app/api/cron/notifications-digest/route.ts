import { NextResponse, type NextRequest } from "next/server";
import { dispatchDailyDigests } from "@/lib/notifications/digest";

/**
 * Cron endpoint — daily notification digest.
 *
 * Flushes every undigested notification for users on
 * `emailDigestMode = DAILY` into a single summary email. Idempotent
 * within the day (already-digested rows are skipped server-side).
 *
 * Auth (same model as the other cron routes):
 *   - Vercel Cron auto-sends `Authorization: Bearer ${CRON_SECRET}`
 *     from the `crons` entry in `vercel.json`.
 *   - On VPS, schedule a curl with the same header.
 *
 * Cadence: once daily at ~07:00 UTC (operator's choice). Running
 * more often is harmless — it'll find an empty backlog.
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

  const result = await dispatchDailyDigests();
  return NextResponse.json({
    ok: true,
    ...result,
  });
}
