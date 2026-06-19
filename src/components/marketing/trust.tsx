import type { Dictionary } from "@/lib/i18n/get-dictionary";

const CERT_BODIES = ["Bureau Veritas", "AFNOR", "SGS", "LNE"];

export function Trust({ dict }: { dict: Dictionary }) {
  const items = [
    {
      title: dict.marketing.trust.escrow.title,
      body: dict.marketing.trust.escrow.body,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
          <path
            d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12.5l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: dict.marketing.trust.agents.title,
      body: dict.marketing.trust.agents.body,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: dict.marketing.trust.certs.title,
      body: dict.marketing.trust.certs.body,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
          <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9 14l-2 7 5-3 5 3-2-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-2xl mb-12 lg:mb-16 animate-fade-up">
        <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
          {dict.marketing.trust.eyebrow}
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
          {dict.marketing.trust.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 animate-fade-up"
            style={{ animationDelay: `${100 + i * 70}ms` }}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              {item.icon}
            </span>
            <h3 className="text-md font-semibold text-headline">{item.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-12 pt-8 border-t border-line-subtle animate-fade-up"
        style={{ animationDelay: "320ms" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-faint mb-4">
          {dict.marketing.trust.partnersLabel}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {CERT_BODIES.map((name) => (
            <span
              key={name}
              className="text-base font-semibold text-muted transition-colors duration-base hover:text-fg"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
