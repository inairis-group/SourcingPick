import { notFound } from "next/navigation";
import { Link } from "@/components/ui/link";
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

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const a = await getAuctionDetail(id);
  return { title: a ? `${a.reference} · ${a.title}` : "" };
}

export default async function PublicAuctionDetailPage({
  params,
}: PageProps<"/[lang]/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const auction = await getAuctionDetail(id);
  if (!auction) notFound();

  const [{ top, count }, recent] = await Promise.all([
    getHighestBidInfo(auction.id),
    listRecentBids(auction.id, 8),
  ]);

  const imageUrls = auction.images.map(
    (_, i) => `/api/auctions/image/${auction.id}/${i}`,
  );
  const currentBidCents = top?.amountCents ?? null;
  const minNextBidCents =
    (currentBidCents ?? auction.startingBidCents) +
    (currentBidCents ? 100 : 0);

  const tAuc = dict.auctions;
  const tFac = dict.factory.auctions;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
      <Link
        href={`/${lang}/auctions`}
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
                {auction.factoryOrg.displayName} ·{" "}
                {auction.factoryOrg.city}, {auction.factoryOrg.country} ·{" "}
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

            {auction.buyNowCents !== null && (
              <p className="text-xs text-muted">
                {tAuc.buyNowAvailable.replace(
                  "{amount}",
                  formatEUR(auction.buyNowCents / 100, lang),
                )}
              </p>
            )}

            <div className="rounded-md border border-info-edge bg-info-soft/30 px-3 py-2 text-xs text-info leading-snug">
              {tAuc.signInToBidBody}{" "}
              <Link
                href={`/${lang}/login?next=/client/auctions/${auction.id}`}
                variant="inline"
                className="text-xs"
              >
                {tAuc.signInToBidCta}
              </Link>
            </div>
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-info mb-3">
          {tAuc.descriptionTitle}
        </h2>
        <MarkdownDisplay source={auction.description} />
      </section>

      <RecentBids
        bids={recent}
        title={tAuc.recentBidsTitle}
        emptyMessage={tAuc.recentBidsEmpty}
        timeAgoFormatter={(d) => formatDate(d, lang, "short")}
        amountFormatter={(c) => formatEUR(c / 100, lang)}
      />

      {/* Suppress unused warning for the value computed above — it surfaces
          on the client page where the bid form mounts. */}
      <span data-min-next={minNextBidCents} hidden />
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

function RecentBids({
  bids,
  title,
  emptyMessage,
  timeAgoFormatter,
  amountFormatter,
}: {
  bids: Array<{
    id: string;
    amountCents: number;
    createdAt: Date;
    bidderOrg: { displayName: string };
  }>;
  title: string;
  emptyMessage: string;
  timeAgoFormatter: (d: Date) => string;
  amountFormatter: (cents: number) => string;
}) {
  return (
    <section className="mt-6 rounded-lg border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-info mb-3">
        {title}
      </h2>
      {bids.length === 0 ? (
        <p className="text-xs text-muted">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle">
          {bids.map((b) => (
            <li
              key={b.id}
              className="py-2 flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-fg truncate">
                {b.bidderOrg.displayName}
              </span>
              <span className="flex items-center gap-3 text-xs text-muted">
                <span>{timeAgoFormatter(b.createdAt)}</span>
                <span className="font-mono font-semibold text-headline">
                  {amountFormatter(b.amountCents)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
