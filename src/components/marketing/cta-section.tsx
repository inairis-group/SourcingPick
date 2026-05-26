import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
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
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      {/* Fixed dark surface (ink-deep) so the banner reads identically in
          light and dark mode — flipping bg-headline made the card go white
          on dark, killing contrast against the dark page background. */}
      <div className="relative overflow-hidden rounded-xl bg-ink-deep text-white px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        {/* Decorative dot grid — sparse on the left where the text sits, dense
            on the right. Slow linear drift (40s loop) — paused under
            prefers-reduced-motion via the global base layer. */}
        <div
          aria-hidden
          className="cta-dots absolute inset-0 pointer-events-none opacity-30"
        />

        <div className="relative max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {dict.marketing.cta.title}
          </h2>
          <p className="mt-4 text-md text-white/75 leading-relaxed">
            {dict.marketing.cta.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/${locale}/signup`}
              className={`${buttonClass({ variant: "primary", size: "lg" })} bg-action text-on-action hover:bg-action-hover`}
            >
              {dict.marketing.cta.primaryButton}
            </Link>
            {!hidePricingLink && (
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center justify-center h-12 px-5 text-md font-semibold rounded-md text-white hover:bg-white/10 transition-colors duration-fast"
              >
                {dict.marketing.cta.secondaryButton}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
