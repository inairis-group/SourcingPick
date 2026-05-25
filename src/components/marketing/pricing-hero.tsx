import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function PricingHero({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-20">
      <div className="max-w-3xl animate-fade-up">
        <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
          {dict.pricing.eyebrow}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight">
          {dict.pricing.title}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">
          {dict.pricing.subtitle}
        </p>
      </div>
    </section>
  );
}
