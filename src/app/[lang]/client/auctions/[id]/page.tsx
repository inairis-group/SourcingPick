import { notFound } from "next/navigation";
import { AuctionStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import {
  getAuctionDetail,
  getHighestBidInfo,
  listRecentBids,
} from "@/lib/auctions/queries";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { OrgAvatar } from "@/components/org/org-avatar";
import { Countdown } from "@/components/auctions/countdown";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { BidForm } from "@/components/auctions/bid-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const a = await getAuctionDetail(id);
  return { title: a ? `${a.reference} · ${a.title}` : "" };
}

export default async function ClientAuctionDetailPage({
  params,
}: PageProps<"/[lang]/client/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const auction = await getAuctionDetail(id);
  if (!auction) notFound();

  const [{ top, count }, recent] = await Promise.all([
    getHighestBidInfo(auction.id),
    listRecentBids(auction.id, 10),
  ]);

  const imageUrls = auction.images.map(
    (_, i) => `/api/auctions/image/${auction.id}/${i}`,
  );
  const currentBidCents = top?.amountCents ?? null;
  // First bid must meet starting; subsequent bids must add €1.
  const minBidCents =
    currentBidCents !== null
      ? currentBidCents + 100
      : auction.startingBidCents;

  const isOwnAuction = auction.factoryOrgId === user.organizationId;
  const now = Date.now();
  const isLive =
    auction.status === AuctionStatus.ACTIVE &&
    auction.startsAt.getTime() <= now &&
    auction.endsAt.getTime() > now;
  // "Are you currently winning?" — the top bidder's USER id, set by the
  // bid action. We compare to the current viewer.
  const isCurrentlyWinning = top
    ? recent.find((b) => b.id === top.id)
      ? false /* fast-path; deeper match below */
      : false
    : false;

  const tAuc = dict.auctions;
  const tCli = dict.client.auctions;
  const tFac = dict.factory.auctions;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/client/auctions`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {tAuc.backToBrowse}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductImageGallery
          imageUrls={imageUrls}
          productName={auction.title}
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-faint">
              {auction.reference}
            </p>
            <h1 className="text-2xl font-bold text-headline tracking-tight">
              {auction.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted">
              <OrgAvatar
                orgId={auction.factoryOrg.id}
                name={auction.factoryOrg.displayName}
                hasLogo={Boolean(auction.factoryOrg.logoUrl)}
                size="sm"
              />
              <span>
                {auction.factoryOrg.displayName} · {auction.factoryOrg.city},{" "}
                {auction.factoryOrg.country} ·{" "}
                {dict.categories[auction.category]}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-faint">
                  {currentBidCents !== null
                    ? tAuc.currentBidLabel
                    : tAuc.startingBidLabel}
                </span>
                <span className="text-2xl font-bold text-headline">
                  {formatEUR(
                    (currentBidCents ?? auction.startingBidCents) / 100,
                    lang,
                  )}
                </span>
                <span className="text-[11px] text-muted mt-0.5">
                  {count} {tFac.bidsSuffix}
                </span>
              </div>
              <div className="flex flex-col text-end">
                <span className="text-[10px] uppercase tracking-wide text-faint">
                  {tAuc.endsInLabel}
                </span>
                <Countdown
                  endsAt={auction.endsAt.toISOString()}
                  labels={tAuc.countdown}
                  className="text-lg font-semibold"
                />
                <span className="text-[11px] text-faint mt-0.5">
                  {formatDate(auction.endsAt, lang, "medium")}
                </span>
              </div>
            </div>

            {isOwnAuction ? (
              <div className="rounded-md border border-warning-edge bg-warning-soft/30 p-3 text-xs text-warning leading-snug">
                {tCli.cannotBidOnOwn}
              </div>
            ) : !isLive ? (
              <div className="rounded-md border border-line bg-subtle p-3 text-xs text-muted leading-snug">
                {auction.status === AuctionStatus.ACTIVE &&
                auction.startsAt.getTime() > now
                  ? tCli.notStartedYet.replace(
                      "{date}",
                      formatDate(auction.startsAt, lang, "medium"),
                    )
                  : tCli.notLiveAnymore}
              </div>
            ) : (
              <BidForm
                auctionId={auction.id}
                minBidCents={minBidCents}
                buyNowCents={auction.buyNowCents}
              />
            )}
            {!isOwnAuction && isCurrentlyWinning && (
              <p className="text-xs text-success font-medium">
                {tCli.youAreWinning}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <Metric
              label={tFac.quantityLabel}
              value={String(auction.quantity)}
            />
            <Metric
              label={dict.factory.catalogue.moqLabel}
              value={String(auction.moq)}
            />
            <Metric
              label={dict.factory.catalogue.leadTimeLabel}
              value={formatLeadTime(
                auction.leadTimeDays,
                auction.leadTimeUnit,
                dict,
              )}
            />
            <Metric
              label={dict.client.requests.incotermLabel}
              value={auction.incoterm}
            />
            {auction.reserveCents !== null && (
              <Metric
                label={tFac.reserveLabel}
                value={formatEUR(auction.reserveCents / 100, lang)}
              />
            )}
            <Metric
              label={tFac.endsAtLabel}
              value={formatDate(auction.endsAt, lang, "short")}
            />
          </dl>
        </div>
      </div>

      <section className="mt-10 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
          {tAuc.descriptionTitle}
        </h2>
        <MarkdownDisplay source={auction.description} />
      </section>

      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
          {tAuc.recentBidsTitle}
        </h2>
        {recent.length === 0 ? (
          <p className="text-xs text-muted">{tAuc.recentBidsEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line-subtle">
            {recent.map((b) => (
              <li
                key={b.id}
                className="py-2 flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-fg truncate">
                  {b.bidderOrg.displayName}
                </span>
                <span className="flex items-center gap-3 text-xs text-muted">
                  <span>{formatDate(b.createdAt, lang, "short")}</span>
                  <span className="font-mono font-semibold text-headline">
                    {formatEUR(b.amountCents / 100, lang)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-semibold text-headline">{value}</span>
    </div>
  );
}
