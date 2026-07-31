import type { CSSProperties } from "react";
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
import { Reveal } from "@/components/marketing/reveal";
import {
  DesktopFrame,
  PhoneScreen,
  KycScreen,
  TenderScreen,
  QuoteScreen,
  ProductionScreen,
  KYC_PHONE,
  TENDER_PHONE,
  QUOTE_PHONE,
  PRODUCTION_PHONE,
} from "@/components/marketing/app-preview";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factories.metaTitle };
}

/** One vector desktop render per step, in step order. */
const STEP_SCREENS = [
  {
    Screen: KycScreen,
    phone: KYC_PHONE,
    nav: "Settings" as const,
    path: "app.sourcingpick.com/onboarding/factory",
  },
  {
    Screen: TenderScreen,
    phone: TENDER_PHONE,
    nav: "Tenders" as const,
    path: "app.sourcingpick.com/tenders",
  },
  {
    Screen: QuoteScreen,
    phone: QUOTE_PHONE,
    nav: "Quotes" as const,
    path: "app.sourcingpick.com/quotes/new",
  },
  {
    Screen: ProductionScreen,
    phone: PRODUCTION_PHONE,
    nav: "Orders" as const,
    path: "app.sourcingpick.com/orders/ORD-58127",
  },
] as const;

const BENEFIT_ICONS = [
  SecurityCheckIcon, // qualified demand
  WalletDoneIcon, // guaranteed payment
  ShoppingBag03Icon, // two ways to sell
  GlobeIcon, // global payouts
  TruckDeliveryIcon, // logistics + insurance
  Mail01Icon, // dedicated agent
] as const;

/**
 * For factories & suppliers — built on the landing page's vocabulary so the
 * two read as one site: the inset hero card with its brand bloom, the
 * sticky-stacking dark panels, brand-sheened light cards, and the shared CTA.
 *
 * The four steps become the stacking panels because they're the sequence a
 * factory actually cares about, and the stack is the page's strongest device.
 * Same 90vh height and 90vw width as the landing panels; the extra panel just
 * parks 0.5rem lower than the landing page's last one (see .panel-stack-item,
 * whose offset is sized so height + offset still fits the viewport).
 */
export default async function FactoriesPage({ params }: PageProps<"/[lang]/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.factories;

  return (
    <>
      {/* Hero — same inset rounded card as the landing page. */}
      <section className="px-4 pt-24 pb-8 sm:px-6 lg:pt-28">
        <div className="border-line bg-subtle max-w-8xl relative mx-auto overflow-hidden rounded-3xl border shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% -5%, var(--color-brand-500), transparent 72%)",
              opacity: 0.18,
            }}
          />

          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:px-10 sm:py-32 lg:py-40">
            <p
              className="animate-fade-up text-info mb-4 text-sm font-medium tracking-wide uppercase"
              style={{ animationDelay: "0ms" }}
            >
              {t.eyebrow}
            </p>
            <h1
              className="animate-fade-up font-display text-headline text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              {t.title}
            </h1>
            <p
              className="animate-fade-up text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              {t.subtitle}
            </p>
            <div
              className="animate-fade-up mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href={`/${lang}/signup/factory`}
                className={buttonClass({ variant: "primary", size: "lg" })}
              >
                {t.ctaPrimary}
              </Link>
              <Link
                href={`/${lang}/pricing`}
                className={buttonClass({ variant: "secondary", size: "lg" })}
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits — light cards carrying the brand sheen and hover lift. */}
      <section className="max-w-8xl mx-auto px-4 py-20 sm:px-6 lg:py-32">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i] ?? SecurityCheckIcon;
            return (
              <Reveal
                key={b.title}
                as="article"
                delay={60 + i * 60}
                className={cn(
                  "border-line bg-surface relative flex flex-col gap-3 overflow-hidden rounded-3xl border p-8",
                  "sheen-brand",
                  "duration-base ease-default transition-all hover:-translate-y-1 hover:shadow-md",
                )}
              >
                {/* `relative` so the content paints above the sheen wash. */}
                <span className="bg-info-soft text-info relative inline-flex h-11 w-11 items-center justify-center rounded-xl">
                  <HugeiconsIcon icon={Icon} size={22} strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-headline relative mt-2 text-lg font-bold tracking-tight">
                  {b.title}
                </h3>
                <p className="text-muted relative text-sm leading-relaxed">{b.body}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Steps — the landing page's sticky stacking panels, at the same
          near-full-bleed 90vw width. */}
      <section className="mx-auto w-[90vw] py-20 lg:py-32">
        <Reveal className="mb-12 max-w-3xl lg:mb-20">
          <p className="text-info mb-3 text-xs font-medium tracking-wide uppercase">
            {t.steps.eyebrow}
          </p>
          <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {t.steps.title}
          </h2>
        </Reveal>

        <div className="flex flex-col gap-4">
          {t.steps.items.map((step, i) => {
            const { Screen, phone, nav, path } = STEP_SCREENS[i] ?? STEP_SCREENS[0];
            return (
              <article
                key={step.title}
                style={{ "--panel-index": i } as CSSProperties}
                className={cn(
                  "panel-stack-item bg-ink-deep overflow-hidden rounded-3xl text-white",
                  "sheen-top ring-1 ring-white/10 ring-inset",
                  "px-6 py-14 sm:px-12 sm:py-20 lg:px-20 lg:py-24",
                  "flex min-h-[70vh] md:min-h-[90vh] flex-col",
                  "shadow-lg",
                )}
              >
                {/* Same arrangement as the landing panels: the window anchors
                    to the panel's padding box and runs past it, cropped by
                    `overflow-hidden`. Anchored at 52% so it always clears the
                    46% copy column instead of landing on top of it, and
                    logical so it mirrors in Arabic. */}
                {/* Phone below lg — a scaled-down desktop window is illegible
                    on a narrow screen. Centred, hanging off the bottom edge,
                    cropped by the panel. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -bottom-10 mx-auto w-[95%] max-w-80 lg:hidden"
                >
                  <PhoneScreen data={phone} />
                </div>

                {/* Desktop window from lg. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-s-[52%] top-28 hidden lg:block"
                >
                  <DesktopFrame active={nav} path={path}>
                    <Screen />
                  </DesktopFrame>
                </div>

                {/* z-10 keeps the copy above the window even if a translation
                    runs longer than the column was sized for. On mobile the
                    copy stacks at the top, leaving the lower half to the
                    window. */}
                <div className="relative z-10 flex w-full flex-1 flex-col gap-6 lg:max-w-[46%] lg:justify-between lg:gap-10">
                  <Reveal className="max-w-2xl">
                    <p className="font-mono text-xs tracking-wide text-white/50 uppercase">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display mt-4 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                      {step.title}
                    </h3>
                  </Reveal>

                  <Reveal delay={180}>
                    <p className="text-md max-w-md leading-relaxed text-white/75 lg:text-lg">
                      {step.body}
                    </p>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-subtle border-line-subtle border-y">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-32">
          <Reveal className="mb-10">
            <p className="text-info mb-3 text-xs font-medium tracking-wide uppercase">
              {t.faq.eyebrow}
            </p>
            <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t.faq.title}
            </h2>
          </Reveal>
          <FaqAccordion items={t.faq.items} />
        </div>
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
