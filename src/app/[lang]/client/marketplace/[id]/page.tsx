import { notFound } from "next/navigation";
import {
  AttachmentContext,
  MarketplaceProductStatus,
  Role,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
// (Sample form below — formatEUR shared with the listing card.)
import {
  ListingBadges,
  ListingPrice,
} from "@/components/marketplace/listing-price";
import { MediaGrid } from "@/components/attachments/media-grid";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { OrgAvatar } from "@/components/org/org-avatar";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { BuyForm } from "./_components/buy-form";
import { SampleForm } from "./_components/sample-form";
import { getOrTranslateProductCopy } from "@/lib/marketplace/translation";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/marketplace/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const p = await prisma.marketplaceProduct.findUnique({
    where: { id },
    select: { name: true, reference: true },
  });
  return { title: p ? `${p.reference} · ${p.name}` : "" };
}

export default async function ClientMarketplaceProductPage({
  params,
}: PageProps<"/[lang]/client/marketplace/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const product = await prisma.marketplaceProduct.findFirst({
    where: {
      id,
      status: MarketplaceProductStatus.PUBLISHED,
      blockedAt: null,
    },
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      description: true,
      priceCentsClient: true,
      compareAtCents: true,
      flashSaleEndsAt: true,
      condition: true,
      moq: true,
      stockAvailable: true,
      leadTimeDays: true,
      leadTimeUnit: true,
      images: true,
      incoterm: true,
      sampleAvailable: true,
      samplePriceCentsClient: true,
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
          users: {
            where: { subRole: "OWNER" },
            select: { locale: true },
            take: 1,
          },
        },
      },
    },
  });
  if (!product) notFound();

  // Best-effort view counter — fire and forget; failure shouldn't block render.
  prisma.marketplaceProduct
    .update({
      where: { id: product.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => { });

  // Partner #5: AI-translate the product copy if the buyer's locale
  // differs from the factory owner's authoring locale. Cached on the
  // product row — only the first reader of a new locale pays the API
  // bill.
  const sourceLocale = product.factoryOrg.users[0]?.locale ?? "en";
  const translated = await getOrTranslateProductCopy({
    productId: product.id,
    sourceLocale: sourceLocale as "fr" | "en" | "zh" | "ar",
    targetLocale: lang,
    name: product.name,
    description: product.description,
  });
  const displayName = translated.name;
  const displayDescription = translated.description;

  const imageUrls = product.images.map(
    (_, i) => `/api/marketplace/image/${product.id}/${i}`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/client/marketplace`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.client.marketplace.backToBrowse}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductImageGallery
          imageUrls={imageUrls}
          productName={displayName}
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-faint">
              {product.reference}
            </p>
            <h1 className="text-2xl font-bold text-headline tracking-tight">
              {displayName}
            </h1>
            {translated.translated && (
              <p className="text-[11px] text-faint mt-1">
                {dict.client.marketplace.translatedBadge}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted">
              <OrgAvatar
                orgId={product.factoryOrg.id}
                name={product.factoryOrg.displayName}
                hasLogo={Boolean(product.factoryOrg.logoUrl)}
                size="sm"
              />
              <span>
                {product.factoryOrg.displayName} · {product.factoryOrg.city},{" "}
                {product.factoryOrg.country} ·{" "}
                {dict.categories[product.category]}
              </span>
            </div>
          </div>

          <ListingBadges
            condition={product.condition}
            flashSaleEndsAt={product.flashSaleEndsAt}
            dict={dict}
            locale={lang}
          />

          <div className="flex items-baseline gap-4 flex-wrap">
            <ListingPrice
              priceCentsClient={product.priceCentsClient}
              compareAtCents={product.compareAtCents}
              locale={lang}
              dict={dict}
              size="lg"
            />
            <span className="text-xs text-faint uppercase">
              {dict.client.marketplace.unitPrice}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs py-3 border-y border-line-subtle">
            <Metric
              label={dict.factory.catalogue.stockLabel}
              value={formatNumber(product.stockAvailable, lang)}
              tone={product.stockAvailable > 0 ? "ok" : "warn"}
            />
            <Metric
              label={dict.factory.catalogue.moqLabel}
              value={formatNumber(product.moq, lang)}
            />
            <Metric
              label={dict.factory.catalogue.leadTimeLabel}
              value={formatLeadTime(
                product.leadTimeDays,
                product.leadTimeUnit,
                dict,
              )}
            />
          </div>

          {/* Partner #9: factory-side certifications no longer shown
              on buyer product pages — the concept wasn't landing in
              the client journey. Admin + factory still see them. */}

          <MarkdownDisplay source={displayDescription} />

          <div className="mt-2 rounded-lg border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
              {dict.client.marketplace.orderTitle}
            </h2>
            <BuyForm
              productId={product.id}
              moq={product.moq}
              stockAvailable={product.stockAvailable}
              // Partner #15: pulled from the listing, no longer a
              // buyer-side choice.
              defaultIncoterm={product.incoterm}
              unitPriceCentsClient={product.priceCentsClient}
              lang={lang}
            />
          </div>

          {/* Partner #31: sample purchase. Renders only when the
              factory has enabled it on the listing. */}
          {product.sampleAvailable &&
            product.samplePriceCentsClient !== null &&
            product.stockAvailable >= 1 && (
              <div className="mt-4 rounded-lg border border-line bg-surface p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-1">
                  {dict.client.marketplace.sampleTitle}
                </h2>
                <p className="text-xs text-muted mb-3 max-w-prose">
                  {dict.client.marketplace.sampleBody}
                </p>
                <SampleForm
                  productId={product.id}
                  samplePriceLabel={formatEUR(
                    product.samplePriceCentsClient / 100,
                    lang,
                  )}
                />
              </div>
            )}
        </div>
      </div>

      <MediaGrid
        contextType={AttachmentContext.MARKETPLACE_PRODUCT}
        contextId={product.id}
        title={dict.factory.catalogue.mediaSectionTitle}
        className="mt-8"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span
        className={
          tone === "warn"
            ? "text-sm font-semibold text-warning"
            : "text-sm font-semibold text-headline"
        }
      >
        {value}
      </span>
    </div>
  );
}
