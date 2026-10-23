import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { WarehouseBoard } from "../_design/boards/warehouse";
import { warehouse as content } from "../_design/content/warehouse";
import { WarehouseMaintenance } from "./maintenance";
import { pageAlternates } from "@/lib/seo/alternates";

/**
 * Route for the canvas's “Entrepot” artboard.
 *
 * The page itself is `warehouse.tsx`, transcribed from Site-Entrepot.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */

/**
 * The warehouse is moving, so the page is in maintenance (maintenance.tsx).
 * Set back to `false` once the move is done: the board is untouched and
 * comes back as it was.
 */
const IN_MAINTENANCE = true;

export async function generateMetadata({ params }: PageProps<"/[lang]/entrepot">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: content.title[lang],
    description: content.description[lang],
    alternates: pageAlternates(lang, "/entrepot"),
  };
}

export default async function WarehousePage({ params }: PageProps<"/[lang]/entrepot">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  if (IN_MAINTENANCE) return <WarehouseMaintenance lang={lang} />;
  return <WarehouseBoard lang={lang} />;
}
