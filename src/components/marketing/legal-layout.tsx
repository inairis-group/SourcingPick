import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Section = { heading: string; body: string[] };

type LegalLayoutProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  draftNotice: string;
  sections: Section[];
};

/**
 * Shared layout for terms / privacy / cookies pages.
 *
 * Typography is intentionally narrow (max-w-3xl) and dense for legal copy.
 * The draft notice banner reminds readers (and us) that these are v0 templates
 * pending counsel review.
 */
export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  draftNotice,
  sections,
}: LegalLayoutProps) {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="animate-fade-up">
          <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
            {eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-headline tracking-tight leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted">{lastUpdated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20 lg:pb-32">
        <div
          role="note"
          className="rounded-md border border-warning-edge bg-warning-soft px-4 py-3 mb-10 text-sm text-warning"
        >
          {draftNotice}
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
                <span className="text-faint font-mono text-base me-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-fg">
                {section.body.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

type LegalCopy = Dictionary["legal"]["terms"] | Dictionary["legal"]["privacy"] | Dictionary["legal"]["cookies"];

export function legalProps(dict: Dictionary, copy: LegalCopy) {
  return {
    eyebrow: dict.legal.eyebrow,
    draftNotice: dict.legal.draftNotice,
    lastUpdated: dict.legal.lastUpdated,
    title: copy.title,
    sections: copy.sections,
  };
}
