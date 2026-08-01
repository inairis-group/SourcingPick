import { NextResponse, type NextRequest } from "next/server";
import { dispatchShipmentReminders } from "@/lib/shipments/reminders";

/**
 * Cron endpoint — §6.3 repeating shipment reminders.
 *
 * Re-notifies the shipper and the internal team about every shipment sitting
 * in a status that awaits shipper action past the §5 24h window. Repeats on
 * each sweep until the status moves, which is what the spec asks for.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`, same as the other cron routes.
 * Cadence: every 6h — frequent enough that a 24h breach is noticed the same
 * working day, infrequent enough not to become noise.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const result = await dispatchShipmentReminders();
  return NextResponse.json({ ok: true, ...result });
}
