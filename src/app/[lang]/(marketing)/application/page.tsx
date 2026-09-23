import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { AppBoard } from "../_design/boards/app";
import { app as content } from "../_design/content/app";

/**
 * Route for the canvas's “Application” artboard.
 *
 * The page itself is `app.tsx`, transcribed from Site-Application.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/application">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function AppPage({ params }: PageProps<"/[lang]/application">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AppBoard lang={lang} />;
}
