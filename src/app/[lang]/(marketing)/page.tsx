import { cookies } from "next/headers";
import { Hero } from "@/components/marketing/hero";
import { HomeIntro, INTRO_COOKIE } from "@/components/marketing/home-intro";
import { ProductPanels } from "@/components/marketing/product-panels";
import { HowItWorks } from "@/components/marketing/how-it-works";
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

  const [dict, cookieStore] = await Promise.all([getDictionary(lang), cookies()]);

  // Decide server-side whether the intro plays, so repeat visitors never get
  // the markup at all — no flash, no hydration mismatch. Session cookie, so
  // it resets when the browser closes. (This page is already dynamic: the
  // marketing layout reads the session for the navbar.)
  const showIntro = !cookieStore.has(INTRO_COOKIE);

  return (
    <>
      {showIntro && <HomeIntro locale={lang} />}
      <Hero dict={dict} locale={lang} />
      <ProductPanels dict={dict} />
      <HowItWorks dict={dict} />
      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
