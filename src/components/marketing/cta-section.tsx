import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  dict: Dictionary;
  locale: Locale;
  /** Hide the "see pricing" secondary link — e.g. on the pricing page itself. */
  hidePricingLink?: boolean;
};

export function CtaSection({ dict, locale, hidePricingLink }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:py-32">
      {/* Fixed dark surface (ink-deep) so the banner reads identically in
          light and dark mode — flipping bg-headline made the card go white
          on dark, killing contrast against the dark page background. */}
      <Reveal className="bg-ink-deep sheen-top relative overflow-hidden rounded-3xl px-6 py-14 text-white ring-1 ring-white/10 ring-inset sm:px-12 sm:py-20 lg:px-20 lg:py-24">
        {/* Decorative dot grid — sparse on the left where the text sits, dense
            on the right. Slow linear drift (40s loop) — paused under
            prefers-reduced-motion via the global base layer. */}
        <div aria-hidden className="cta-dots pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            {dict.marketing.cta.title}
          </h2>
          <p className="text-md mt-4 leading-relaxed text-white/75">
            {dict.marketing.cta.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/signup`}
              className={`${buttonClass({ variant: "primary", size: "lg" })} bg-action text-on-action hover:bg-action-hover`}
            >
              {dict.marketing.cta.primaryButton}
            </Link>
            {!hidePricingLink && (
              <Link
                href={`/${locale}/pricing`}
                className="text-md duration-fast inline-flex h-12 items-center justify-center rounded-md px-5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                {dict.marketing.cta.secondaryButton}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
