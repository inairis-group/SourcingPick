import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { PrivacyBoard } from "../../_design/boards/privacy";
import { privacy as content } from "../../_design/content/privacy";
import { pageAlternates } from "@/lib/seo/alternates";

/**
 * Route for the canvas's “Confidentialite” artboard.
 *
 * The page itself is `privacy.tsx`, transcribed from Site-Confidentialite.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/legal/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: content.title[lang],
    description: content.description[lang],
    alternates: pageAlternates(lang, "/legal/privacy"),
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/legal/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <PrivacyBoard lang={lang} />;
}
