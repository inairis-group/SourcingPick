import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { WarehouseBoard } from "../_design/boards/warehouse";
import { warehouse as content } from "../_design/content/warehouse";

/**
 * Route for the canvas's “Entrepot” artboard.
 *
 * The page itself is `warehouse.tsx`, transcribed from Site-Entrepot.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/entrepot">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function WarehousePage({ params }: PageProps<"/[lang]/entrepot">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <WarehouseBoard lang={lang} />;
}
