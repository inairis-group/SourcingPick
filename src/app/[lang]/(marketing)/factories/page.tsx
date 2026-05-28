import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WalletDoneIcon,
  SecurityCheckIcon,
  GlobeIcon,
  Mail01Icon,
  ShoppingBag03Icon,
  TruckDeliveryIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factories.metaTitle };
}

const BENEFIT_ICONS = [
  SecurityCheckIcon, // qualified demand
  WalletDoneIcon, // guaranteed payment
  ShoppingBag03Icon, // two ways to sell
  GlobeIcon, // global payouts
  TruckDeliveryIcon, // logistics + insurance
  Mail01Icon, // dedicated agent
] as const;

export default async function FactoriesPage({
  params,
}: PageProps<"/[lang]/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.factories;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-16">
        <div className="max-w-3xl animate-fade-up">
          <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
            {t.eyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight">
            {t.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted max-w-2xl">
            {t.subtitle}
          </p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              href={`/${lang}/signup/factory`}
              className={cn(buttonClass({ variant: "primary", size: "lg" }))}
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className={cn(buttonClass({ variant: "secondary", size: "lg" }))}
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {t.benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i] ?? SecurityCheckIcon;
            return (
              <div
                key={b.title}
                className="rounded-xl border border-line bg-surface p-6 flex flex-col gap-3"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <HugeiconsIcon icon={Icon} size={22} strokeWidth={1.5} />
                </span>
                <h3 className="text-md font-semibold text-headline">
                  {b.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{b.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works for factories */}
      <section className="bg-subtle border-y border-line-subtle">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
              {t.steps.eyebrow}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
              {t.steps.title}
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {t.steps.items.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-action text-on-action text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="text-md font-semibold text-headline">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
            {t.faq.eyebrow}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
            {t.faq.title}
          </h2>
        </div>
        <FaqAccordion items={t.faq.items} />
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
