import { notFound } from "next/navigation";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { CtaSection } from "@/components/marketing/cta-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.pricing.title };
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <PricingHero dict={dict} />
      <PricingTiers dict={dict} locale={lang} />
      <CtaSection dict={dict} locale={lang} hidePricingLink />
    </>
  );
}
