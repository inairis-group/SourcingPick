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
import type { Locale } from "@/lib/i18n/config";
import { MediaGrid } from "@/components/attachments/media-grid";
import { ProductForm } from "../_components/product-form";
import { ProductActions } from "./_components/product-actions";
import { PromotionForm } from "./_components/promotion-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/catalogue/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const p = await prisma.marketplaceProduct.findUnique({
    where: { id },
    select: { name: true, reference: true },
  });
  return { title: p ? `${p.reference} · ${p.name}` : "" };
}

export default async function FactoryProductDetailPage({
  params,
}: PageProps<"/[lang]/factory/catalogue/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const product = await prisma.marketplaceProduct.findFirst({
    where: { id, factoryOrgId: user.organizationId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      description: true,
      priceCentsFactory: true,
      priceCentsClient: true,
      compareAtCents: true,
      flashSaleEndsAt: true,
      condition: true,
      moq: true,
      stockAvailable: true,
      stockLowThreshold: true,
      leadTimeDays: true,
      certifications: true,
      images: true,
      status: true,
      publishedAt: true,
      viewsCount: true,
      soldCount: true,
    },
  });
  if (!product) notFound();

  const editable =
    product.status === MarketplaceProductStatus.DRAFT ||
    product.status === MarketplaceProductStatus.REJECTED;

  const imageUrls = product.images.map(
    (_, i) => `/api/marketplace/image/${product.id}/${i}`,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/factory/catalogue`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.factory.catalogue.backToList}
      </Link>
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {product.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {product.name}
        </h1>
        <p className="text-sm text-muted">
          {dict.categories[product.category]} ·{" "}
          {dict.factory.catalogue.statuses[product.status]}
        </p>
      </header>

      <div className="rounded-lg border border-line bg-surface p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <Metric
            label={dict.factory.catalogue.priceLabel}
            value={formatEUR(product.priceCentsFactory / 100, lang)}
          />
          <Metric
            label={dict.factory.catalogue.clientPriceLabel}
            value={formatEUR(product.priceCentsClient / 100, lang)}
            hint={dict.factory.catalogue.clientPriceHint}
          />
          <Metric
            label={dict.factory.catalogue.viewsLabel}
            value={formatNumber(product.viewsCount, lang)}
          />
          <Metric
            label={dict.factory.catalogue.soldLabel}
            value={formatNumber(product.soldCount, lang)}
          />
        </div>
      </div>

      <ProductActions
        productId={product.id}
        status={product.status}
        hasImages={product.images.length > 0}
      />

      {editable ? (
        <div className="mt-6">
          <ProductForm
            lang={lang}
            defaults={{
              id: product.id,
              name: product.name,
              category: product.category,
              description: product.description,
              priceCentsFactory: product.priceCentsFactory,
              compareAtCents: product.compareAtCents,
              flashSaleEndsAt: product.flashSaleEndsAt,
              condition: product.condition,
              moq: product.moq,
              stockAvailable: product.stockAvailable,
              stockLowThreshold: product.stockLowThreshold,
              leadTimeDays: product.leadTimeDays,
              certifications: product.certifications,
              existingImages: imageUrls,
            }}
          />
        </div>
      ) : (
        <>
          <ReadOnlyDetail
            product={product}
            imageUrls={imageUrls}
            dict={dict}
            lang={lang}
          />
          {(product.status === MarketplaceProductStatus.PUBLISHED ||
            product.status === MarketplaceProductStatus.OUT_OF_STOCK) && (
            <section className="mt-6 rounded-lg border border-line bg-surface p-5">
              <header className="mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                  {dict.factory.catalogue.promotionTitle}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {dict.factory.catalogue.promotionDescription}
                </p>
              </header>
              <PromotionForm
                productId={product.id}
                defaults={{
                  compareAtCents: product.compareAtCents,
                  flashSaleEndsAt: product.flashSaleEndsAt,
                }}
              />
            </section>
          )}
        </>
      )}

      {/* Factory curates this listing's video/file attachments. Renders
          nothing when there are none. canManage → delete controls; the
          delete action re-checks factory ownership server-side. */}
      <MediaGrid
        contextType={AttachmentContext.MARKETPLACE_PRODUCT}
        contextId={product.id}
        title={dict.factory.catalogue.mediaSectionTitle}
        className="mt-6"
        canManage
      />
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

function ReadOnlyDetail({
  product,
  imageUrls,
  dict,
  lang,
}: {
  product: {
    description: string;
    moq: number;
    stockAvailable: number;
    leadTimeDays: number;
    certifications: string[];
  };
  imageUrls: string[];
  dict: Awaited<ReturnType<typeof getDictionary>>;
  lang: Locale;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 mt-6 flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
        {dict.factory.catalogue.detailsTitle}
      </h2>
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {imageUrls.map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-line bg-subtle relative overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-fg whitespace-pre-wrap leading-snug">
        {product.description}
      </p>
      <div className="grid grid-cols-3 gap-3 text-xs pt-3 border-t border-line-subtle">
        <Metric
          label={dict.factory.catalogue.moqLabel}
          value={formatNumber(product.moq, lang)}
        />
        <Metric
          label={dict.factory.catalogue.stockLabel}
          value={formatNumber(product.stockAvailable, lang)}
        />
        <Metric
          label={dict.factory.catalogue.leadTimeLabel}
          value={`${product.leadTimeDays} ${dict.factory.tenders.daysSuffix}`}
        />
      </div>
      {product.certifications.length > 0 && (
        <div className="text-xs">
          <span className="text-faint uppercase tracking-wide">
            {dict.client.requests.certsLabel}:{" "}
          </span>
          {product.certifications.join(", ")}
        </div>
      )}
    </div>
  );
}
