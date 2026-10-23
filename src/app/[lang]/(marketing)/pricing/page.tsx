import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { PricingBoard } from "../_design/boards/pricing";
import { pricing as content } from "../_design/content/pricing";
import { pageAlternates } from "@/lib/seo/alternates";
import { pageMeta } from "@/lib/seo/fr-meta";

/**
 * Route for the canvas's “Tarifs” artboard.
 *
 * The page itself is `pricing.tsx`, transcribed from Site-Tarifs.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    ...pageMeta(lang, "/pricing", { title: content.title[lang], description: content.description[lang] }),
    alternates: pageAlternates(lang, "/pricing"),
  };
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <PricingBoard lang={lang} />;
}
