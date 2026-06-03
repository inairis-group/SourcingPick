import { Link } from "@/components/ui/link";
import { OrgAvatar } from "@/components/org/org-avatar";
import { Countdown } from "@/components/auctions/countdown";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Storefront auction card — used on the public + client browse lists.
 * Hero image (first one), title, category, factory + location, current
 * high bid (or starting bid when no bids yet), countdown.
 */
export function AuctionCard({
  auction,
  href,
  lang,
  categoryLabel,
  currentBidCents,
  bidCount,
  labels,
}: {
  auction: {
    id: string;
    reference: string;
    title: string;
    images: string[];
    startingBidCents: number;
    endsAt: Date;
    factoryOrg: {
      id: string;
      displayName: string;
      country: string;
      city: string;
      logoUrl: string | null;
    };
  };
  href: string;
  lang: Locale;
  categoryLabel: string;
  /** Highest bid in cents, or null when no bids yet. */
  currentBidCents: number | null;
  bidCount: number;
  labels: {
    startingBidLabel: string;
    currentBidLabel: string;
    bidsSuffix: string;
    countdown: {
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
      ended: string;
    };
  };
}) {
  const heroSrc =
    auction.images.length > 0
      ? `/api/auctions/image/${auction.id}/0`
      : null;
  const priceLabel =
    currentBidCents !== null
      ? labels.currentBidLabel
      : labels.startingBidLabel;
  const priceCents = currentBidCents ?? auction.startingBidCents;

  return (
    <Link
      href={href}
      variant="muted"
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-line bg-surface overflow-hidden",
        "hover:border-line-strong transition-colors duration-fast",
      )}
    >
      <div className="aspect-4/3 bg-subtle relative">
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroSrc}
            alt={auction.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {auction.reference}
        </p>
        <h3 className="text-sm font-semibold text-headline tracking-tight line-clamp-2">
          {auction.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <OrgAvatar
            orgId={auction.factoryOrg.id}
            name={auction.factoryOrg.displayName}
            hasLogo={Boolean(auction.factoryOrg.logoUrl)}
            size="xs"
          />
          <span className="truncate">
            {auction.factoryOrg.displayName} · {auction.factoryOrg.city},{" "}
            {auction.factoryOrg.country}
          </span>
        </div>
        <p className="text-[11px] text-faint uppercase tracking-wide">
          {categoryLabel}
        </p>
        <div className="flex items-end justify-between gap-2 mt-1 pt-3 border-t border-line-subtle">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-faint">
              {priceLabel}
            </span>
            <span className="text-base font-bold text-headline">
              {formatEUR(priceCents / 100, lang)}
            </span>
            <span className="text-[10px] text-faint mt-0.5">
              {bidCount} {labels.bidsSuffix}
            </span>
          </div>
          <div className="text-end">
            <Countdown
              endsAt={auction.endsAt.toISOString()}
              labels={labels.countdown}
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
