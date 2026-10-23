import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { HowItWorksBoard } from "../_design/boards/howItWorks";
import { howItWorks as content } from "../_design/content/howItWorks";
import { pageAlternates } from "@/lib/seo/alternates";

/**
 * Route for the canvas's “Comment-ca-marche” artboard.
 *
 * The page itself is `howItWorks.tsx`, transcribed from Site-Comment-ca-marche.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/comment-ca-marche">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: content.title[lang],
    description: content.description[lang],
    alternates: pageAlternates(lang, "/comment-ca-marche"),
  };
}

export default async function HowItWorksPage({ params }: PageProps<"/[lang]/comment-ca-marche">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <HowItWorksBoard lang={lang} />;
}
