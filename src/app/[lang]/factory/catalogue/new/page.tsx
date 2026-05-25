import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { ProductForm } from "../_components/product-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/catalogue/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.catalogue.newTitle };
}

export default async function NewProductPage({
  params,
}: PageProps<"/[lang]/factory/catalogue/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

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
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.factory.catalogue.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.factory.catalogue.newTitle}
        </h1>
        <p className="text-sm text-muted">
          {dict.factory.catalogue.newDescription}
        </p>
      </header>

      <ProductForm lang={lang} />
    </div>
  );
}
