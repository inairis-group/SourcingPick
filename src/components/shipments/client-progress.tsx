import type { ShipmentStatus } from "@prisma/client";
import { formatDate } from "@/lib/i18n/formatters";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { ShipmentStatusBadge } from "./status-badge";

/**
 * Delivery progress on the buyer's order page.
 *
 * The §1.2 boundary made visible without breaching it: these are the shipment
 * events the internal team allows to auto-surface (see CLIENT_VISIBLE_STATUSES
 * in lib/shipments/status.ts), rendered under SourcingPick's own chrome. No
 * shipper name, no logistics price, no incident detail — the caller's query
 * doesn't even select them.
 *
 * Renders nothing when there are no visible events, so orders that never went
 * through a shipper look exactly as they did before.
 */
export function ClientShipmentProgress({
  events,
  lang,
  dict,
}: {
  events: { id: string; status: ShipmentStatus; createdAt: Date }[];
  lang: Locale;
  dict: Dictionary;
}) {
  if (events.length === 0) return null;

  return (
    <div className="border-line bg-surface mb-6 rounded-lg border p-5">
      <h2 className="text-info mb-4 text-sm font-semibold tracking-wide uppercase">
        {dict.shipper.deliveryProgress}
      </h2>
      <ol className="flex flex-col gap-3">
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-3 text-sm">
            <ShipmentStatusBadge status={e.status} dict={dict} />
            <span className="text-faint text-xs">{formatDate(e.createdAt, lang)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
