import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { QuoteBoard } from "../_design/boards/quote";
import { quote as content } from "../_design/content/quote";

/**
 * Route for the canvas's “Devis” artboard.
 *
 * The page itself is `quote.tsx`, transcribed from Site-Devis.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function QuotePage({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <QuoteBoard lang={lang} />;
}
