import { ShipmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Tone per shipment status. INCIDENT and CANCELLED are the two that must not
 * read as ordinary progress — they sit outside the linear flow and both mean
 * someone has to act.
 */
const TONE: Record<ShipmentStatus, string> = {
  QUOTE_REQUESTED: "border-line bg-subtle text-muted",
  QUOTE_CALCULATING: "border-line bg-subtle text-muted",
  QUOTE_VALIDATED: "border-info-edge bg-info-soft text-info",
  PREPARATION: "border-info-edge bg-info-soft text-info",
  PICKED_UP: "border-info-edge bg-info-soft text-info",
  IN_TRANSIT: "border-info-edge bg-info-soft text-info",
  AWAITING_FINAL_DELIVERY: "border-warning-edge bg-warning-soft text-warning",
  DELIVERED: "border-success-edge bg-success-soft text-success",
  INCIDENT: "border-danger-edge bg-danger-soft text-danger",
  CANCELLED: "border-line bg-subtle text-faint",
};

export function ShipmentStatusBadge({
  status,
  dict,
  className,
}: {
  status: ShipmentStatus;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium whitespace-nowrap",
        TONE[status],
        className,
      )}
    >
      {dict.shipper.statuses[status]}
    </span>
  );
}
