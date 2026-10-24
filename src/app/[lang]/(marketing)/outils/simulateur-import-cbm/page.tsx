import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { pageAlternates } from "@/lib/seo/alternates";
import { IMPORT_SIMULATOR } from "@/content/seo/import-simulator";
import { ImportSimulator } from "../../_design/import-simulator";
import { SeoArticle } from "../../_design/seo-article";

/**
 * /outils/simulateur-import-cbm — the SEO pack's free tool (matrix, part 2),
 * in every language; its copy is src/content/seo/import-simulator.ts.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/outils/simulateur-import-cbm">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = IMPORT_SIMULATOR[lang];
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: pageAlternates(lang, "/outils/simulateur-import-cbm"),
  };
}

export default async function SimulatorPage({ params }: PageProps<"/[lang]/outils/simulateur-import-cbm">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = IMPORT_SIMULATOR[lang];
  return (
    <SeoArticle lang={lang} eyebrow={c.eyebrow} h1={c.h1} lead={c.lead} image="/design/consolidated-pallet.svg" wide>
      <ImportSimulator lang={lang} quoteHref={sitePath(lang, "/devis")} />
    </SeoArticle>
  );
}
