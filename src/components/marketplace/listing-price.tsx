import type { MarketplaceCondition } from "@prisma/client";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { FlashCountdown } from "./flash-countdown";

/**
 * Price block for marketplace cards + detail pages.
 *
 * Renders, in order:
 *   - The sale price (priceCentsClient).
 *   - If compareAtCents is set and strictly greater, a strikethrough
 *     "was" price and a percent-off pill.
 *
 * The compare-at value is stored buyer-side (already includes the
 * platform markup) so the strikethrough is apples-to-apples with the
 * displayed sale price.
 */
export function ListingPrice({
  priceCentsClient,
  compareAtCents,
  locale,
  dict,
  size = "md",
}: {
  priceCentsClient: number;
  compareAtCents: number | null;
  locale: Locale;
  dict: Dictionary;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount =
    compareAtCents !== null && compareAtCents > priceCentsClient;
  const percentOff = hasDiscount
    ? Math.round(((compareAtCents! - priceCentsClient) / compareAtCents!) * 100)
    : null;

  const priceClass = cn(
    "font-semibold text-headline tabular-nums",
    size === "sm" && "text-sm",
    size === "md" && "text-base",
    size === "lg" && "text-2xl",
  );
  const compareClass = cn(
    "line-through text-faint tabular-nums",
    size === "sm" ? "text-xs" : "text-sm",
  );

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={priceClass}>
        {formatEUR(priceCentsClient / 100, locale)}
      </span>
      {hasDiscount && (
        <>
          <span className={compareClass}>
            {formatEUR(compareAtCents! / 100, locale)}
          </span>
          <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-danger-soft text-danger border border-danger-edge text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">
            {dict.client.marketplace.percentOff.replace(
              "{n}",
              String(percentOff),
            )}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Condition + flash-sale badges. Server-rendered base, with a small
 * `<FlashCountdown>` client child that ticks the remaining time. The
 * countdown component is the only client boundary — the rest of the
 * badge stays in the server payload.
 *
 * `locale` is no longer used here since the countdown formats itself
 * with raw d/h/m/s units (universal), but we keep it in the signature
 * for forward compatibility (e.g. localised "ends in" prefix).
 */
export function ListingBadges({
  condition,
  flashSaleEndsAt,
  dict,
}: {
  condition: MarketplaceCondition;
  flashSaleEndsAt: Date | null;
  dict: Dictionary;
  locale: Locale;
}) {
  const flashActive =
    flashSaleEndsAt !== null && flashSaleEndsAt.getTime() > Date.now();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {condition !== "NEW" && (
        <span
          className={cn(
            "inline-flex items-center h-5 px-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide",
            condition === "USED"
              ? "bg-warning-soft text-warning border-warning-edge"
              : "bg-info-soft text-info border-info-edge",
          )}
        >
          {dict.factory.catalogue.conditions[condition]}
        </span>
      )}
      {flashActive && (
        <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-danger text-on-action border border-danger-edge text-[10px] font-semibold uppercase tracking-wide">
          <FlashIcon />
          {dict.client.marketplace.flashSaleBadge}
          <FlashCountdown endsAt={flashSaleEndsAt!} />
        </span>
      )}
    </div>
  );
}

function FlashIcon() {
  return (
    <svg
      width="8"
      height="10"
      viewBox="0 0 8 10"
      fill="currentColor"
      aria-hidden
    >
      <path d="M5 0L0 5.5h3L2 10l5-5.5H4L5 0z" />
    </svg>
  );
}

