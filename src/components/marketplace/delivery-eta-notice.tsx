import { HugeiconsIcon } from "@hugeicons/react";
import { TruckDeliveryIcon } from "@hugeicons/core-free-icons";
import { getDeliveryEtas } from "@/lib/platform/settings";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Compact panel that surfaces the admin-configured estimated delivery
 * windows per continent. Renders nothing when no continent has been
 * configured — the partner explicitly wants zero copy if the values
 * aren't available, rather than placeholder text.
 *
 * Free-text per continent; the partner's recommended disclaimer is
 * shown below the rows so buyers know these are not commitments.
 */
export async function DeliveryEtaNotice({ dict }: { dict: Dictionary }) {
  const etas = await getDeliveryEtas();
  const rows: Array<{ label: string; value: string }> = [];
  if (etas.africa) rows.push({ label: dict.admin.deliveryEtas.africaLabel, value: etas.africa });
  if (etas.europe) rows.push({ label: dict.admin.deliveryEtas.europeLabel, value: etas.europe });
  if (etas.americas) rows.push({ label: dict.admin.deliveryEtas.americasLabel, value: etas.americas });
  if (etas.asia) rows.push({ label: dict.admin.deliveryEtas.asiaLabel, value: etas.asia });
  if (rows.length === 0) return null;

  return (
    <aside className="rounded-md border border-line-subtle bg-subtle/60 p-4 mt-4 flex gap-3">
      <HugeiconsIcon
        icon={TruckDeliveryIcon}
        size={18}
        strokeWidth={1.5}
        className="text-muted shrink-0 mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">
          {dict.client.marketplace.deliveryEtasTitle}
        </p>
        <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-muted">{r.label}</span>
              <span className="font-medium text-fg">{r.value}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-faint mt-2">
          {dict.client.marketplace.deliveryEtasDisclaimer}
        </p>
      </div>
    </aside>
  );
}
