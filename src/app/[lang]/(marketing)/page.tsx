import { Hero } from "@/components/marketing/hero";
import { Pillars } from "@/components/marketing/pillars";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Trust } from "@/components/marketing/trust";
import { CtaSection } from "@/components/marketing/cta-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const title = dict.brand.tagline;
  const description = dict.marketing.hero.subtitle;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict} locale={lang} />
      <Pillars dict={dict} />
      <HowItWorks dict={dict} />
      <Trust dict={dict} />
      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
