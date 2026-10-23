import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { FaqBoard } from "../_design/boards/faq";
import { faq as content } from "../_design/content/faq";
import { faqJsonLd, JsonLd } from "@/lib/seo/structured-data";

/**
 * Route for the canvas's “FAQ” artboard.
 *
 * The page itself is `faq.tsx`, transcribed from Site-FAQ.dc.html. This file
 * only resolves the locale and hands it over; anything added here should be
 * behaviour, never markup, or the next re-port will silently drop it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: content.title[lang], description: content.description[lang] };
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  // The questions as the page shows them: each open/close question's header
  // and its answer, read from the same strings the board renders.
  const t = content.text[lang];
  const pairs = content.frDisclosures.map(([q, a, end]) => ({
    question: t.slice(q, a).join(" ").trim(),
    answer: t.slice(a, end).join(" ").trim(),
  }));
  return (
    <>
      <JsonLd data={faqJsonLd(pairs.filter((p) => p.question && p.answer))} />
      <FaqBoard lang={lang} />
    </>
  );
}
