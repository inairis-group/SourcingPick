import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { ServicesBoard } from "../_design/boards/services";
import { services as content } from "../_design/content/services";
import { JsonLd, organizationJsonLd } from "@/lib/seo/structured-data";
import { pageAlternates } from "@/lib/seo/alternates";

/**
 * Route for the canvas's “Services” artboard.
 *
 * The page itself is `services.tsx`, transcribed from Site-Services.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: content.title[lang],
    description: content.description[lang],
    alternates: pageAlternates(lang, "/services"),
  };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <ServicesBoard lang={lang} />
    </>
  );
}
