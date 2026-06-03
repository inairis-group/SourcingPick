import { notFound } from "next/navigation";
import { AuctionStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { auctionCommissionCents } from "@/lib/pricing/auctions";
import { AuctionForm } from "../_components/auction-form";
import { AuctionActions } from "./_components/auction-actions";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const a = await prisma.auction.findUnique({
    where: { id },
    select: { reference: true, title: true },
  });
  return { title: a ? `${a.reference} · ${a.title}` : "" };
}

export default async function FactoryAuctionDetailPage({
  params,
}: PageProps<"/[lang]/factory/auctions/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const auction = await prisma.auction.findFirst({
    where: {
      id,
      factoryOrgId: user.organizationId,
      deletedAt: null,
    },
  });
  if (!auction) notFound();

  const editable =
    auction.status === AuctionStatus.DRAFT ||
    auction.status === AuctionStatus.REJECTED;

  const imageUrls = auction.images.map(
    (_, i) => `/api/auctions/image/${auction.id}/${i}`,
  );

  const t = dict.factory.auctions;
  const estimatedCommission = auctionCommissionCents(
    auction.startingBidCents,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/factory/auctions`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {t.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {auction.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {auction.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.categories[auction.category]} · {t.statuses[auction.status]}
        </p>
      </header>

      {auction.status === AuctionStatus.REJECTED &&
        auction.rejectionReason && (
          <section className="rounded-lg border border-danger-edge bg-danger-soft/40 p-4 mb-6">
            <p className="text-sm font-semibold text-headline">
              {t.rejectedTitle}
            </p>
            <p className="text-xs text-muted mt-1 whitespace-pre-wrap">
              {auction.rejectionReason}
            </p>
          </section>
        )}

      <section className="rounded-lg border border-line bg-surface p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <Metric
            label={t.startingBidLabel}
            value={formatEUR(auction.startingBidCents / 100, lang)}
          />
          {auction.reserveCents !== null && (
            <Metric
              label={t.reserveLabel}
              value={formatEUR(auction.reserveCents / 100, lang)}
            />
          )}
          {auction.buyNowCents !== null && (
            <Metric
              label={t.buyNowLabel}
              value={formatEUR(auction.buyNowCents / 100, lang)}
            />
          )}
          <Metric
            label={t.estimatedCommissionLabel}
            value={formatEUR(estimatedCommission / 100, lang)}
            hint={t.estimatedCommissionHint}
          />
        </div>
      </section>

      <AuctionActions
        auctionId={auction.id}
        status={auction.status}
        hasImages={auction.images.length > 0}
      />

      {editable ? (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6">
          <AuctionForm
            lang={lang}
            defaults={{
              id: auction.id,
              title: auction.title,
              category: auction.category,
              description: auction.description,
              startingBidCents: auction.startingBidCents,
              reserveCents: auction.reserveCents,
              buyNowCents: auction.buyNowCents,
              quantity: auction.quantity,
              moq: auction.moq,
              leadTimeDays: auction.leadTimeDays,
              leadTimeUnit: auction.leadTimeUnit,
              incoterm: auction.incoterm,
              startsAt: auction.startsAt,
              endsAt: auction.endsAt,
              existingImages: imageUrls,
            }}
          />
        </div>
      ) : (
        <section className="rounded-lg border border-line bg-surface p-5 mt-6 flex flex-col gap-4">
          {imageUrls.length > 0 && (
            <ProductImageGallery
              imageUrls={imageUrls}
              productName={auction.title}
            />
          )}
          <MarkdownDisplay source={auction.description} />
          <div className="grid grid-cols-3 gap-3 text-xs pt-3 border-t border-line-subtle">
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
              label={t.endsAtLabel}
              value={formatDate(auction.endsAt, lang, "medium")}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-semibold text-headline">{value}</span>
      {hint && <span className="text-[10px] text-faint mt-0.5">{hint}</span>}
    </div>
  );
}
