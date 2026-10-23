import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { HomeBoard } from "./_design/boards/home";
import { home as content } from "./_design/content/home";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

/**
 * Route for the canvas's “Accueil” artboard.
 *
 * The page itself is `home.tsx`, transcribed from Main.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <HomeBoard lang={lang} />
    </>
  );
}
