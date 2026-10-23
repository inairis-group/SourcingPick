import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { TermsBoard } from "../../_design/boards/terms";
import { terms as content } from "../../_design/content/terms";
import { pageAlternates } from "@/lib/seo/alternates";

/**
 * Route for the canvas's “CGV” artboard.
 *
 * The page itself is `terms.tsx`, transcribed from Site-CGV.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/legal/terms">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: content.title[lang],
    description: content.description[lang],
    alternates: pageAlternates(lang, "/legal/terms"),
  };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/legal/terms">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <TermsBoard lang={lang} />;
}
