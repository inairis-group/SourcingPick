import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Category,
  MarketplaceCondition,
  MarketplaceProductStatus,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
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
import { LoadMoreNudge } from "./_components/load-more-nudge";
import { MarketplaceFilters } from "./_components/filters";

const PUBLIC_LIMIT = 20;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/marketplace">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.marketplace.title };
}

export default async function PublicMarketplacePage({
  params,
  searchParams,
}: PageProps<"/[lang]/marketplace">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
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

  // Fetch one extra to detect whether there are more products beyond the
  // public window — drives the "load more" / sign-up nudge.
  const products = await prisma.marketplaceProduct.findMany({
    where: {
      status: MarketplaceProductStatus.PUBLISHED,
      deletedAt: null,
      ...(category ? { category } : {}),
      ...(condition ? { condition } : {}),
      // Compose "deals only" + free-text search via AND so each can carry
      // its own OR-list. Without this, the second `OR` would silently
      // replace the first under Prisma's WHERE-merge semantics.
      AND: [
        ...(dealsOnly
          ? [
            {
              // "Deals only" = active flash sale OR a strikethrough.
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
    take: PUBLIC_LIMIT + 1,
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
      images: true,
      factoryOrg: { select: { displayName: true, country: true } },
    },
  });

  const hasMore = products.length > PUBLIC_LIMIT;
  const visible = products.slice(0, PUBLIC_LIMIT);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="flex flex-col gap-1 mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.client.marketplace.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
          {dict.client.marketplace.title}
        </h1>
        <p className="text-sm text-muted mt-2">
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

      {visible.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center mt-6">
          <p className="text-sm text-muted">{dict.client.marketplace.empty}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {visible.map((p) => (
            <li key={p.id}>
              <Link
                href={`/${lang}/marketplace/${p.id}`}
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

      <LoadMoreNudge lang={lang} hasMore={hasMore} totalShown={visible.length} />
    </div>
  );
}
