import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon } from "@hugeicons/core-free-icons";
import type { DeliveryEstimate } from "@/lib/delivery/calculator";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";

/**
 * Pricing-v3 Phase 3 — visual block rendering one DeliveryEstimate
 * result. Used embedded in the product page + the request wizard +
 * the standalone /delivery-calculator page. All copy is "approximate"
 * by design — the actual quote comes from the forwarder at tender
 * time.
 *
 * Renders an empty-state row when `estimate` is null so the caller
 * doesn't have to branch.
 */
export function DeliveryEstimateCard({
  estimate,
  dict,
  locale,
  weightKg,
}: {
  estimate: DeliveryEstimate | null;
  dict: Dictionary;
  locale: Locale;
  weightKg: number;
}) {
  const t = dict.delivery.estimate;
  return (
    <div className="rounded-lg border border-info-edge bg-info-soft/30 p-4 flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info-soft text-info">
        <HugeiconsIcon icon={PackageIcon} size={16} strokeWidth={1.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-info">
          {t.eyebrow}
        </p>
        {estimate ? (
          <>
            <p className="text-base font-semibold text-headline mt-0.5">
              {formatEUR(estimate.minCents / 100, locale)}
              {" – "}
              {formatEUR(estimate.maxCents / 100, locale)}
            </p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {t.approximate}{" "}
              {t.partnerPrefix}{" "}
              <span className="font-medium text-fg">{estimate.partnerName}</span>
              {". "}
              {t.bracketLabel.replace(
                "{kg}",
                formatNumber(weightKg, locale),
              )}{" "}
              {t.bracketSuffix.replace(
                "{matched}",
                formatNumber(estimate.matchedBracketKg, locale),
              )}
              {estimate.notes && (
                <>
                  {" "}
                  <span className="text-faint">· {estimate.notes}</span>
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-fg mt-0.5">{t.emptyTitle}</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {t.emptyBody}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
