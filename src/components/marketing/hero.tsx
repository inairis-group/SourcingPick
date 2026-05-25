import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background — a single brand-tinted radial, no decorative shapes */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 to-page pointer-events-none"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8  pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
            {dict.marketing.hero.eyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight">
            {dict.marketing.hero.title}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">
            {dict.marketing.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/${locale}/signup`}
              className={buttonClass({ variant: "primary", size: "lg" })}
            >
              {dict.marketing.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/marketplace`}
              className={buttonClass({ variant: "secondary", size: "lg" })}
            >
              {dict.marketing.hero.ctaSecondary}
            </Link>
          </div>

          <p className="mt-6 text-sm text-faint">
            {dict.marketing.hero.assurance}
          </p>
        </div>
      </div>
    </section>
  );
}
