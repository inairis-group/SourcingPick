import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { AboutBoard } from "../_design/boards/about";
import { about as content } from "../_design/content/about";
import { pageAlternates } from "@/lib/seo/alternates";
import { pageMeta } from "@/lib/seo/fr-meta";

/**
 * Route for the canvas's “A-propos” artboard.
 *
 * The page itself is `about.tsx`, transcribed from Site-A-propos.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    ...pageMeta(lang, "/about", { title: content.title[lang], description: content.description[lang] }),
    alternates: pageAlternates(lang, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AboutBoard lang={lang} />;
}
