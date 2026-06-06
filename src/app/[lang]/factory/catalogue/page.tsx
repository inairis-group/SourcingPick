import Image from "next/image";
import { notFound } from "next/navigation";
import { MarketplaceProductStatus, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/catalogue">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.catalogue.title };
}

const STATUS_ORDER: MarketplaceProductStatus[] = [
  MarketplaceProductStatus.DRAFT,
  MarketplaceProductStatus.REJECTED,
  MarketplaceProductStatus.PENDING_REVIEW,
  MarketplaceProductStatus.PUBLISHED,
  MarketplaceProductStatus.OUT_OF_STOCK,
  MarketplaceProductStatus.ARCHIVED,
];

export default async function FactoryCataloguePage({
  params,
}: PageProps<"/[lang]/factory/catalogue">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const products = await prisma.marketplaceProduct.findMany({
    where: { factoryOrgId: user.organizationId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      status: true,
      priceCentsClient: true,
      priceCentsFactory: true,
      stockAvailable: true,
      moq: true,
      leadTimeDays: true,
      images: true,
      viewsCount: true,
      soldCount: true,
    },
  });

  const grouped = new Map<MarketplaceProductStatus, typeof products>();
  for (const p of products) {
    if (!grouped.has(p.status)) grouped.set(p.status, []);
    grouped.get(p.status)!.push(p);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {dict.factory.catalogue.eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {dict.factory.catalogue.title}
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            {dict.factory.catalogue.description}
          </p>
        </div>
        <Link
          href={`/${lang}/factory/catalogue/new`}
          className={cn(buttonClass({ variant: "primary", size: "sm" }))}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.5} />
          <span className="ms-1.5">{dict.factory.catalogue.newCta}</span>
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {dict.factory.catalogue.emptyTitle}
          </p>
          <p className="text-sm text-muted mb-4">
            {dict.factory.catalogue.emptyBody}
          </p>
          <Link
            href={`/${lang}/factory/catalogue/new`}
            className={cn(buttonClass({ variant: "primary", size: "sm" }))}
          >
            {dict.factory.catalogue.newCta}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {STATUS_ORDER.filter((s) => (grouped.get(s)?.length ?? 0) > 0).map(
            (status) => {
              const items = grouped.get(status)!;
              return (
                <section key={status}>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-faint mb-3">
                    {dict.factory.catalogue.statuses[status]} · {items.length}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/${lang}/factory/catalogue/${p.id}`}
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
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-mono uppercase tracking-wide text-faint">
                                  {p.reference}
                                </p>
                                <p className="text-sm font-semibold text-headline truncate">
                                  {p.name}
                                </p>
                              </div>
                              <StatusPill status={p.status} dict={dict} />
                            </div>
                            <p className="text-xs text-muted">
                              {dict.categories[p.category]}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-line-subtle">
                              <Metric
                                label={dict.factory.catalogue.priceLabel}
                                value={formatEUR(p.priceCentsFactory / 100, lang)}
                              />
                              <Metric
                                label={dict.factory.catalogue.stockLabel}
                                value={formatNumber(p.stockAvailable, lang)}
                              />
                              <Metric
                                label={dict.factory.catalogue.soldLabel}
                                value={formatNumber(p.soldCount, lang)}
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: MarketplaceProductStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const tone: Record<MarketplaceProductStatus, string> = {
    DRAFT: "bg-subtle text-muted border-line",
    PENDING_REVIEW: "bg-warning-soft text-warning border-warning-edge",
    PUBLISHED: "bg-success-soft text-success border-success-edge",
    REJECTED: "bg-danger-soft text-danger border-danger-edge",
    OUT_OF_STOCK: "bg-warning-soft text-warning border-warning-edge",
    ARCHIVED: "bg-subtle text-faint border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        tone[status],
      )}
    >
      {dict.factory.catalogue.statuses[status]}
    </span>
  );
}
