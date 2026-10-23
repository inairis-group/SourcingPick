import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { DeliveriesBoard } from "../_design/boards/deliveries";
import { deliveries as content } from "../_design/content/deliveries";

/**
 * Route for the canvas's “Livraisons” artboard.
 *
 * The page itself is `deliveries.tsx`, transcribed from Site-Livraisons.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 *
 * The page is drawn in French only; every language shows it in French.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/livraisons">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function DeliveriesPage({ params }: PageProps<"/[lang]/livraisons">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <DeliveriesBoard lang={lang} />;
}
