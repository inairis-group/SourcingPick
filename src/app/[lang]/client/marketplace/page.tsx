import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Category,
  MarketplaceCondition,
  MarketplaceProductStatus,
  Role,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import {
  ListingBadges,
  ListingPrice,
} from "@/components/marketplace/listing-price";
import { DeliveryEtaNotice } from "@/components/marketplace/delivery-eta-notice";
import { MarketplaceBannerRail } from "@/components/marketplace/banner-rail";
import { MarketplaceFilters } from "./_components/filters";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/marketplace">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.marketplace.title };
}

export default async function ClientMarketplacePage({
  params,
  searchParams,
}: PageProps<"/[lang]/client/marketplace">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const rawCategory =
    typeof search?.category === "string" ? search.category : "";
  const rawCondition =
    typeof search?.condition === "string" ? search.condition : "";
  const rawQuery = typeof search?.q === "string" ? search.q.trim() : "";
  const dealsOnly = search?.deals === "1";

  const category = (Object.values(Category) as string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : undefined;
  const condition = (Object.values(MarketplaceCondition) as string[]).includes(
    rawCondition,
  )
    ? (rawCondition as MarketplaceCondition)
    : undefined;

  const products = await prisma.marketplaceProduct.findMany({
    where: {
      status: MarketplaceProductStatus.PUBLISHED,
      deletedAt: null,
      ...(category ? { category } : {}),
      ...(condition ? { condition } : {}),
      // See marketing/marketplace/page.tsx for the AND-of-ORs rationale.
      AND: [
        ...(dealsOnly
          ? [
            {
              OR: [
                { flashSaleEndsAt: { gt: new Date() } },
                { compareAtCents: { not: null } },
              ],
            },
          ]
          : []),
        ...(rawQuery
          ? [
            {
              OR: [
                { name: { contains: rawQuery, mode: "insensitive" as const } },
                {
                  description: {
                    contains: rawQuery,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          ]
          : []),
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 60,
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      priceCentsClient: true,
      compareAtCents: true,
      flashSaleEndsAt: true,
      condition: true,
      stockAvailable: true,
      leadTimeDays: true,
      moq: true,
      images: true,
      factoryOrg: { select: { displayName: true, country: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.client.marketplace.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.client.marketplace.title}
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          {dict.client.marketplace.description}
        </p>
      </header>

      <MarketplaceBannerRail locale={lang} />

      <MarketplaceFilters
        lang={lang}
        category={category}
        condition={condition}
        deals={dealsOnly}
        query={rawQuery}
      />

      <DeliveryEtaNotice dict={dict} />

      {products.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center mt-6">
          <p className="text-sm text-muted">
            {dict.client.marketplace.empty}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/${lang}/client/marketplace/${p.id}`}
                variant="muted"
                className="block rounded-lg border border-line bg-surface overflow-hidden hover:bg-subtle transition-colors duration-fast"
              >
                <div className="aspect-4/3 bg-subtle relative">
                  {p.images.length > 0 ? (
                    <Image
                      src={`/api/marketplace/image/${p.id}/0`}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-faint text-xs">
                      {dict.factory.catalogue.noImage}
                    </div>
                  )}
                  <div className="absolute top-2 inset-s-2">
                    <ListingBadges
                      condition={p.condition}
                      flashSaleEndsAt={p.flashSaleEndsAt}
                      dict={dict}
                      locale={lang}
                    />
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {p.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {p.factoryOrg.displayName} · {p.factoryOrg.country}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-2 pt-2 border-t border-line-subtle">
                    <ListingPrice
                      priceCentsClient={p.priceCentsClient}
                      compareAtCents={p.compareAtCents}
                      locale={lang}
                      dict={dict}
                    />
                    <span
                      className={cn(
                        "text-[11px] uppercase tracking-wide font-medium",
                        p.stockAvailable > 0 ? "text-success" : "text-muted",
                      )}
                    >
                      {p.stockAvailable > 0
                        ? `${formatNumber(p.stockAvailable, lang)} ${dict.client.marketplace.inStock}`
                        : dict.client.marketplace.outOfStock}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
