import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { CookiesBoard } from "../../_design/boards/cookies";
import { cookies as content } from "../../_design/content/cookies";

/**
 * Route for the canvas's “Cookies” artboard.
 *
 * The page itself is `cookies.tsx`, transcribed from Site-Cookies.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/legal/cookies">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function CookiesPage({ params }: PageProps<"/[lang]/legal/cookies">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <CookiesBoard lang={lang} />;
}
