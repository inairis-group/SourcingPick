import { notFound } from "next/navigation";
import { KycStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { AdminProductForm } from "./_components/admin-product-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/marketplace/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.adminListing.title };
}

export default async function AdminCreateListingPage({
  params,
}: PageProps<"/[lang]/admin/marketplace/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const factories = await prisma.organization.findMany({
    where: {
      kycStatus: KycStatus.VERIFIED,
      deletedAt: null,
      type: "FACTORY",
    },
    select: {
      id: true,
      displayName: true,
      country: true,
    },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/marketplace`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.admin.adminListing.backToModeration}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.admin.adminListing.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.admin.adminListing.title}
        </h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          {dict.admin.adminListing.description}
        </p>
      </header>

      {factories.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm text-muted">
            {dict.admin.adminListing.noFactories}
          </p>
        </div>
      ) : (
        <AdminProductForm lang={lang} factories={factories} />
      )}
    </div>
  );
}
