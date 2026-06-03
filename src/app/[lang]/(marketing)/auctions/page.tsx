import { notFound } from "next/navigation";
import { BidStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listActiveAuctions } from "@/lib/auctions/queries";
import { AuctionCard } from "@/components/auctions/auction-card";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auctions.browseTitle };
}

export default async function PublicAuctionsPage({
  params,
}: PageProps<"/[lang]/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const auctions = await listActiveAuctions();
  // Batch fetch the current highest bid + bid count for each auction.
  // One groupBy keeps the round-trip flat instead of N+1.
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

  const labels = {
    startingBidLabel: dict.auctions.startingBidLabel,
    currentBidLabel: dict.auctions.currentBidLabel,
    bidsSuffix: dict.factory.auctions.bidsSuffix,
    countdown: dict.auctions.countdown,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <header className="flex flex-col gap-2 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.auctions.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
          {dict.auctions.browseTitle}
        </h1>
        <p className="text-sm sm:text-md text-muted leading-relaxed max-w-2xl">
          {dict.auctions.browseDescription}
        </p>
      </header>

      {auctions.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-sm font-semibold text-headline">
            {dict.auctions.emptyTitle}
          </p>
          <p className="text-xs text-muted mt-1">
            {dict.auctions.emptyBody}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((a) => {
            const stats = statsById.get(a.id);
            return (
              <li key={a.id}>
                <AuctionCard
                  auction={a}
                  href={`/${lang}/auctions/${a.id}`}
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
      )}
    </div>
  );
}
