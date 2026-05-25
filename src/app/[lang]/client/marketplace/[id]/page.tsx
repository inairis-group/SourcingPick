import { notFound } from "next/navigation";
import { MarketplaceProductStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { BuyForm } from "./_components/buy-form";

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
      deletedAt: null,
    },
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      description: true,
      priceCentsClient: true,
      moq: true,
      stockAvailable: true,
      leadTimeDays: true,
      certifications: true,
      images: true,
      factoryOrg: {
        select: { displayName: true, country: true, city: true },
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
    .catch(() => {});

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
        <div className="flex flex-col gap-3">
          <div className="aspect-[4/3] bg-subtle rounded-lg border border-line overflow-hidden relative">
            {imageUrls[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrls[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          {imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {imageUrls.slice(1, 6).map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-line bg-subtle overflow-hidden relative"
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
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-faint">
              {product.reference}
            </p>
            <h1 className="text-2xl font-bold text-headline tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-muted mt-1">
              {product.factoryOrg.displayName} · {product.factoryOrg.city},{" "}
              {product.factoryOrg.country} ·{" "}
              {dict.categories[product.category]}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-headline">
              {formatEUR(product.priceCentsClient / 100, lang)}
            </span>
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
              value={`${product.leadTimeDays} ${dict.factory.tenders.daysSuffix}`}
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

          <p className="text-sm text-fg leading-snug whitespace-pre-wrap">
            {product.description}
          </p>

          <div className="mt-2 rounded-lg border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
              {dict.client.marketplace.orderTitle}
            </h2>
            <BuyForm
              productId={product.id}
              moq={product.moq}
              stockAvailable={product.stockAvailable}
              defaultIncoterm="DAP"
              unitPriceCentsClient={product.priceCentsClient}
              lang={lang}
            />
          </div>
        </div>
      </div>
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
