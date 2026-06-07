import { notFound } from "next/navigation";
import { AdminScope } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { ProductForm } from "@/app/[lang]/factory/catalogue/_components/product-form";

/**
 * Admin-side edit of any marketplace listing — partner round 4.
 *
 * Reuses the factory's ProductForm with `actorVariant="admin"` so the
 * admin sees the same field set the factory would, but the submission
 * routes to `adminUpdateProductAction` (no ownership check, status
 * preserved, factory notified). Edit page is reachable from the "Edit"
 * button on each row of the admin marketplace overview.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/marketplace/[id]/edit">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const p = await prisma.marketplaceProduct.findUnique({
    where: { id },
    select: { reference: true, name: true },
  });
  return {
    title: p ? `${p.reference} — ${p.name}` : "Edit listing",
  };
}

export default async function AdminEditListingPage({
  params,
}: PageProps<"/[lang]/admin/marketplace/[id]/edit">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.MARKETPLACE);
  const dict = await getDictionary(lang);

  const product = await prisma.marketplaceProduct.findUnique({
    where: { id },
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
      leadTimeUnit: true,
      certifications: true,
      depositPercentageBps: true,
      incoterm: true,
      sampleAvailable: true,
      samplePriceCentsClient: true,
      images: true,
      status: true,
      factoryOrg: { select: { displayName: true } },
    },
  });
  if (!product) notFound();

  const imageUrls = product.images.map(
    (_, i) => `/api/marketplace/image/${product.id}/${i}`,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/marketplace`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.admin.marketplace.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {product.reference} · {product.factoryOrg.displayName}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.admin.marketplace.editTitle}
        </h1>
        <p className="text-sm text-muted">
          {dict.admin.marketplace.editBody}
        </p>
      </header>

      <ProductForm
        lang={lang}
        actorVariant="admin"
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
          leadTimeUnit: product.leadTimeUnit,
          certifications: product.certifications,
          depositPercentageBps: product.depositPercentageBps,
          incoterm: product.incoterm,
          sampleAvailable: product.sampleAvailable,
          samplePriceCentsClient: product.samplePriceCentsClient,
          existingImages: imageUrls,
        }}
      />
    </div>
  );
}
