import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { LegalBoard } from "../../_design/boards/legal";
import { legal as content } from "../../_design/content/legal";
import { pageAlternates } from "@/lib/seo/alternates";
import { pageMeta } from "@/lib/seo/fr-meta";

/**
 * Route for the canvas's “Mentions-legales” artboard.
 *
 * The page itself is `legal.tsx`, transcribed from Site-Mentions-legales.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/legal/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    ...pageMeta(lang, "/legal/mentions-legales", { title: content.title[lang], description: content.description[lang] }),
    alternates: pageAlternates(lang, "/legal/mentions-legales"),
  };
}

export default async function LegalNoticePage({ params }: PageProps<"/[lang]/legal/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalBoard lang={lang} />;
}
