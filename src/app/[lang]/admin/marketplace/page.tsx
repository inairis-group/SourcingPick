import { notFound } from "next/navigation";
import {AdminScope, MarketplaceProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModerationQueue } from "./_components/moderation-queue";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/marketplace">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.marketplace.title };
}

export default async function AdminMarketplacePage({
  params,
}: PageProps<"/[lang]/admin/marketplace">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.MARKETPLACE);
  const dict = await getDictionary(lang);

  const pending = await prisma.marketplaceProduct.findMany({
    where: {
      status: MarketplaceProductStatus.PENDING_REVIEW,
    },
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      reference: true,
      name: true,
      category: true,
      description: true,
      priceCentsFactory: true,
      priceCentsClient: true,
      moq: true,
      leadTimeDays: true,
      certifications: true,
      images: true,
      updatedAt: true,
      publishedAt: true,
      factoryOrg: {
        select: { displayName: true, country: true, city: true, kycStatus: true },
      },
    },
  });

  const rows = pending.map((p) => ({
    id: p.id,
    reference: p.reference,
    name: p.name,
    category: p.category,
    categoryLabel: dict.categories[p.category],
    description: p.description,
    priceCentsFactory: p.priceCentsFactory,
    priceCentsClient: p.priceCentsClient,
    priceFactoryEur: formatEUR(p.priceCentsFactory / 100, lang),
    priceClientEur: formatEUR(p.priceCentsClient / 100, lang),
    moq: p.moq,
    leadTimeDays: p.leadTimeDays,
    certifications: p.certifications,
    images: p.images.map((_, i) => `/api/marketplace/image/${p.id}/${i}`),
    submittedAtLabel: formatDate(p.updatedAt, lang, "medium"),
    factoryName: p.factoryOrg.displayName,
    factoryLocation: `${p.factoryOrg.city}, ${p.factoryOrg.country}`,
    factoryKycVerified: p.factoryOrg.kycStatus === "VERIFIED",
    // Partner item #4: PUBLISHED listings that were edited fall back
    // to PENDING_REVIEW. `publishedAt` survives the round-trip, so a
    // non-null value here means "this is a re-review, not a brand-new
    // listing." The queue surfaces a pill so admin can prioritise.
    isReReview: p.publishedAt !== null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {dict.admin.marketplace.eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {dict.admin.marketplace.title}
          </h1>
          <p className="text-sm text-muted">
            {dict.admin.marketplace.description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${lang}/admin/marketplace/banners`}
            className={cn(buttonClass({ variant: "secondary", size: "md" }))}
          >
            {dict.admin.banners.manageCta}
          </Link>
          <Link
            href={`/${lang}/admin/marketplace/new`}
            className={cn(buttonClass({ variant: "primary", size: "md" }))}
          >
            {dict.admin.adminListing.newCta}
          </Link>
        </div>
      </header>

      <ModerationQueue items={rows} />
    </div>
  );
}
