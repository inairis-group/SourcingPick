import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { ContactBoard } from "../_design/boards/contact";
import { contact as content } from "../_design/content/contact";

/**
 * Route for the canvas's “Contact” artboard.
 *
 * The page itself is `contact.tsx`, transcribed from Site-Contact.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ContactBoard lang={lang} />;
}
