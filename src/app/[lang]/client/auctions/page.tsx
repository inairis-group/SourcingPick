import { notFound } from "next/navigation";
import { BidStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listActiveAuctions } from "@/lib/auctions/queries";
import { AuctionCard } from "@/components/auctions/auction-card";
import { DashboardHeader } from "@/components/dashboard/primitives";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auctions.browseTitle };
}

export default async function ClientAuctionsPage({
  params,
}: PageProps<"/[lang]/client/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const auctions = await listActiveAuctions();
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.auctions.eyebrow}
        title={dict.auctions.browseTitle}
        description={dict.auctions.browseDescription}
      />

      {auctions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-semibold text-headline">
            {dict.auctions.emptyTitle}
          </p>
          <p className="text-xs text-muted mt-1">{dict.auctions.emptyBody}</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((a) => {
            const stats = statsById.get(a.id);
            return (
              <li key={a.id}>
                <AuctionCard
                  auction={a}
                  href={`/${lang}/client/auctions/${a.id}`}
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
