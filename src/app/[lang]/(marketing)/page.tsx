import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { Hero, Operations, Flow, Transparency } from "./_home/sections";
import { AppSection, Pricing, Faq, ClosingCta } from "./_home/sections-2";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const h = dict.site.home.hero;
  return {
    title: `${h.title1} ${h.title2} ${h.title3}`.replace(/\s+/g, " ").trim(),
    description: h.body,
  };
}

/**
 * Home page — the 2026-09 redesign approved by Adam.
 *
 * Section order is the canvas's own: hero, warehouse operations, the six
 * statuses, transparency, the app, pricing, FAQ, closing CTA. Every string
 * comes from `site.home.*`, generated directly from the artboards, so all
 * four locales carry the designer's copy rather than a translation of it.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.site.home;

  return (
    <>
      <Hero t={t} lang={lang} />
      <Operations t={t} lang={lang} />
      <Flow t={t} />
      <Transparency t={t} />
      <AppSection t={t} />
      <Pricing t={t} lang={lang} />
      <Faq t={t} />
      <ClosingCta t={t} lang={lang} />
    </>
  );
}
