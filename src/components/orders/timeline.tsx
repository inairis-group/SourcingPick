import { OrderStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Wallet01Icon,
  PackageIcon,
  SecurityCheckIcon,
  TruckIcon,
  PackageDeliveredIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const HAPPY_PATH: OrderStatus[] = [
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PREPARATION,
  OrderStatus.QC,
  OrderStatus.SHIPPED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.COMPLETED,
];

const STEP_ICONS: Record<OrderStatus, typeof Wallet01Icon> = {
  PAYMENT_PENDING: Wallet01Icon,
  PREPARATION: PackageIcon,
  QC: SecurityCheckIcon,
  SHIPPED: TruckIcon,
  IN_TRANSIT: TruckIcon,
  COMPLETED: PackageDeliveredIcon,
  CANCELLED: Cancel01Icon,
};

/**
 * Horizontal timeline showing the order's progress through the happy-path
 * states. Cancelled orders short-circuit to a single banner.
 */
export function OrderTimeline({
  status,
  shippedAt,
  deliveredAt,
  estimatedEta,
  lang,
  dict,
}: {
  status: OrderStatus;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  estimatedEta: Date | null;
  lang: Locale;
  dict: Dictionary;
}) {
  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-line bg-subtle px-4 py-3">
        <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
        <p className="text-sm text-muted">{dict.orders.cancelledBanner}</p>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.indexOf(status);
  const current = HAPPY_PATH[currentIndex];
  const activeDate =
    current === OrderStatus.SHIPPED && shippedAt
      ? formatDate(shippedAt, lang, "short")
      : current === OrderStatus.COMPLETED && deliveredAt
        ? formatDate(deliveredAt, lang, "short")
        : current !== OrderStatus.COMPLETED && estimatedEta
          ? `${dict.client.orders.eta} ${formatDate(estimatedEta, lang, "short")}`
          : null;

  return (
    <>
      {/* Desktop: horizontal stepper with labels under each dot. */}
      <ol className="hidden sm:flex items-start justify-between gap-2">
        {HAPPY_PATH.map((step, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          const dateLabel =
            step === OrderStatus.SHIPPED && shippedAt
              ? formatDate(shippedAt, lang, "short")
              : step === OrderStatus.COMPLETED && deliveredAt
                ? formatDate(deliveredAt, lang, "short")
                : active && step !== OrderStatus.COMPLETED && estimatedEta
                  ? `${dict.client.orders.eta} ${formatDate(estimatedEta, lang, "short")}`
                  : null;

          return (
            <li
              key={step}
              className="flex flex-col items-center text-center flex-1 min-w-0"
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors flex-shrink-0",
                  done
                    ? "bg-success-soft border-success-edge text-success"
                    : active
                      ? "bg-action border-action text-on-action"
                      : "bg-surface border-line text-faint",
                )}
              >
                <HugeiconsIcon
                  icon={done ? CheckmarkCircle02Icon : STEP_ICONS[step]}
                  size={16}
                  strokeWidth={1.5}
                />
              </span>
              <span
                className={cn(
                  "mt-2 text-[10px] md:text-[11px] font-medium uppercase tracking-wide leading-snug",
                  active
                    ? "text-headline"
                    : done
                      ? "text-fg"
                      : "text-faint",
                )}
              >
                {dict.orders.statuses[step]}
              </span>
              {dateLabel && (
                <span className="text-[10px] text-muted mt-0.5">
                  {dateLabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact dot strip + a current-step caption underneath.
          Stops labels from colliding and shows the user where they are. */}
      <div className="sm:hidden flex flex-col gap-3">
        <ol className="flex items-center gap-2">
          {HAPPY_PATH.map((step, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;
            return (
              <li key={step} className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors flex-shrink-0",
                    done
                      ? "bg-success-soft border-success-edge text-success"
                      : active
                        ? "bg-action border-action text-on-action"
                        : "bg-surface border-line text-faint",
                  )}
                  aria-label={dict.orders.statuses[step]}
                >
                  <HugeiconsIcon
                    icon={done ? CheckmarkCircle02Icon : STEP_ICONS[step]}
                    size={14}
                    strokeWidth={1.5}
                  />
                </span>
                {idx < HAPPY_PATH.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1 transition-colors",
                      done ? "bg-success-edge" : "bg-line",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
        {current && (
          <div className="text-center">
            <p className="text-sm font-semibold text-headline">
              {dict.orders.statuses[current]}
            </p>
            <p className="text-[11px] text-muted">
              {currentIndex + 1} / {HAPPY_PATH.length}
              {activeDate && <> · {activeDate}</>}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
