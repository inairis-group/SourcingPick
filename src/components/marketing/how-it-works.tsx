import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const steps = [
    dict.marketing.howItWorks.step1,
    dict.marketing.howItWorks.step2,
    dict.marketing.howItWorks.step3,
    dict.marketing.howItWorks.step4,
  ];

  return (
    <section className="bg-subtle border-y border-line-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
            {dict.marketing.howItWorks.eyebrow}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
            {dict.marketing.howItWorks.title}
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-headline text-on-action font-mono font-semibold text-sm">
                {i + 1}
              </span>
              <h3 className="text-md font-semibold text-headline">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
