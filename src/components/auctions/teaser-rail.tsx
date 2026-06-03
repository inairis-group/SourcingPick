import "server-only";
import { BidStatus } from "@prisma/client";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { prisma } from "@/lib/db/client";
import { listActiveAuctions } from "@/lib/auctions/queries";
import { AuctionCard } from "@/components/auctions/auction-card";
import { Link } from "@/components/ui/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Marketplace-side teaser for live auctions. Renders the four soonest-to-end
 * auctions inline above (or below) the marketplace grid so buyers see them
 * without having to navigate to /auctions. Returns null when no auctions
 * are active — no empty state, the marketplace already has its own.
 *
 * `linkBase` controls where the cards and "see all" link point: pass
 * `/{lang}/auctions` for the public marketplace, `/{lang}/client/auctions`
 * for the signed-in client view.
 */
export async function AuctionTeaserRail({
  lang,
  dict,
  linkBase,
}: {
  lang: Locale;
  dict: Dictionary;
  linkBase: string;
}) {
  const all = await listActiveAuctions();
  if (all.length === 0) return null;
  const auctions = all.slice(0, 4);

  const bidStats = await prisma.bid.groupBy({
    by: ["auctionId"],
    where: {
      auctionId: { in: auctions.map((a) => a.id) },
      status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
    },
    _max: { amountCents: true },
    _count: { _all: true },
  });
  const statsById = new Map(
    bidStats.map((s) => [
      s.auctionId,
      { highest: s._max.amountCents, count: s._count._all },
    ]),
  );

  const t = dict.auctions;
  const labels = {
    startingBidLabel: t.startingBidLabel,
    currentBidLabel: t.currentBidLabel,
    bidsSuffix: dict.factory.auctions.bidsSuffix,
    countdown: t.countdown,
  };

  return (
    <section className="mt-10 pt-10 border-t border-line-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div className="flex flex-col gap-1 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {t.eyebrow}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-headline tracking-tight">
            {t.teaserTitle}
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t.teaserSubtitle}
          </p>
        </div>
        <Link
          href={linkBase}
          variant="muted"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors duration-fast"
        >
          {t.teaserCta}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={2}
            className="rtl:rotate-180"
          />
        </Link>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {auctions.map((a) => {
          const stats = statsById.get(a.id);
          return (
            <li key={a.id}>
              <AuctionCard
                auction={a}
                href={`${linkBase}/${a.id}`}
                lang={lang}
                categoryLabel={dict.categories[a.category]}
                currentBidCents={stats?.highest ?? null}
                bidCount={stats?.count ?? 0}
                labels={labels}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
