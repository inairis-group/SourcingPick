import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Pillar = {
  key: "sourcing" | "marketplace" | "certification";
  icon: React.ReactNode;
};

const PILLARS: Pillar[] = [
  {
    key: "sourcing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
        <path
          d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "marketplace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
        <path
          d="M4 8h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 8zM8 8V5a4 4 0 1 1 8 0v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "certification",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
        <path
          d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.6 7.1 17.2l.9-5.5-4-3.9L9.5 7 12 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Pillars({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-2xl mb-12 lg:mb-16 animate-fade-up">
        <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
          {dict.marketing.pillars.eyebrow}
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
          {dict.marketing.pillars.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line rounded-lg overflow-hidden border border-line">
        {PILLARS.map((p, i) => {
          const copy = dict.marketing.pillars[p.key];
          return (
            <div
              key={p.key}
              className="bg-surface p-6 lg:p-8 flex flex-col gap-4 animate-fade-up transition-colors duration-base hover:bg-subtle/40"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                {p.icon}
              </span>
              <h3 className="text-lg font-semibold text-headline">{copy.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{copy.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
