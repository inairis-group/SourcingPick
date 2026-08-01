import { notFound } from "next/navigation";
import { AttachmentContext, MarketplaceProductStatus } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { OrgAvatar } from "@/components/org/org-avatar";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import {
  ListingBadges,
  ListingPrice,
} from "@/components/marketplace/listing-price";
import { MediaGrid } from "@/components/attachments/media-grid";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/marketplace/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const p = await prisma.marketplaceProduct.findUnique({
    where: { id },
    select: { name: true, reference: true, status: true },
  });
  if (!p || p.status !== MarketplaceProductStatus.PUBLISHED) return {};
  return { title: `${p.reference} · ${p.name}` };
}

export default async function PublicMarketplaceProductPage({
  params,
}: PageProps<"/[lang]/marketplace/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const product = await prisma.marketplaceProduct.findFirst({
    where: {
      id,
      status: MarketplaceProductStatus.PUBLISHED,
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
      certifications: true,
      images: true,
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
      },
    },
  });
  if (!product) notFound();

  // Fire-and-forget view counter on the public surface too.
  prisma.marketplaceProduct
    .update({
      where: { id: product.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => { });

  const imageUrls = product.images.map(
    (_, i) => `/api/marketplace/image/${product.id}/${i}`,
  );

  const signupHref = `/${lang}/signup/client`;
  const loginHref = `/${lang}/login`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link
        href={`/${lang}/marketplace`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.client.marketplace.backToBrowse}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductImageGallery
          imageUrls={imageUrls}
          productName={product.name}
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-faint">
              {product.reference}
            </p>
            <h1 className="text-2xl font-bold text-headline tracking-tight">
              {product.name}
            </h1>
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

          {product.certifications.length > 0 && (
            <p className="text-xs text-muted">
              <span className="uppercase tracking-wide text-faint">
                {dict.client.requests.certsLabel}:{" "}
              </span>
              {product.certifications.join(", ")}
            </p>
          )}

          <MarkdownDisplay source={product.description} />

          <div
            className={cn(
              "mt-2 rounded-lg border border-line bg-surface p-5",
              "flex flex-col gap-3",
            )}
          >
            <h2 className="text-sm font-semibold text-headline">
              {dict.publicMarketplace.orderTitle}
            </h2>
            <p className="text-xs text-muted">
              {dict.publicMarketplace.orderBody}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Link
                href={`${signupHref}?next=${encodeURIComponent(`/${lang}/client/marketplace/${product.id}`)}`}
                className={cn(buttonClass({ variant: "primary", size: "md" }))}
              >
                {dict.publicMarketplace.signupToBuyCta}
              </Link>
              <Link
                href={`${loginHref}?callbackUrl=${encodeURIComponent(`/${lang}/client/marketplace/${product.id}`)}`}
                className={cn(buttonClass({ variant: "secondary", size: "md" }))}
              >
                {dict.publicMarketplace.loginCta}
              </Link>
            </div>
          </div>
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
