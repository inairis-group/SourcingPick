import { Link } from "@/components/ui/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { Eyebrow } from "./sections";

type T = Dictionary["site"]["home"];

/** The app pitch, with the six things it carries. */
export function AppSection({ t }: { t: T }) {
  const a = t.app;
  const features = [a.feature1, a.feature2, a.feature3, a.feature4, a.feature5, a.feature6];
  return (
    <section id="application" className="bg-navy-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h2 className="font-display text-navy-900 mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance lg:text-[40px]">
              {a.title}
            </h2>
            <p className="text-navy-600 mt-5 text-[17px] leading-relaxed">{a.intro}</p>

            {/* Store buttons are deliberately not links: the app isn't
                shipped, and a dead App Store link is worse than a label
                saying "soon". */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { soon: a.storeSoon1, name: a.storeApple },
                { soon: a.storeSoon2, name: a.storeGoogle },
              ].map((s) => (
                <span
                  key={s.name}
                  className="border-navy-100 inline-flex flex-col rounded-xl border bg-white px-5 py-2.5"
                >
                  <span className="text-navy-600 text-[11px]">{s.soon}</span>
                  <span className="text-navy-900 text-[15px] font-semibold">{s.name}</span>
                </span>
              ))}
            </div>

            <p className="text-navy-600 mt-4 text-sm">
              {a.releaseLabel}{" "}
              <span className="bg-amber-soft text-amber-ink font-mono rounded px-1.5 py-0.5 text-xs font-semibold">
                {a.releaseDate}
              </span>{" "}
              {a.releaseSep} {a.releaseLangs}
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="border-navy-100 rounded-2xl border bg-white p-5">
                <h3 className="text-navy-900 text-[15px] font-semibold">{f.title}</h3>
                <p className="text-navy-600 mt-1.5 text-sm leading-relaxed">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * Pricing.
 *
 * Every figure here is a dictionary value taken from the design, including
 * its own placeholders (TARIF, À CONFIRMER). They render as visible
 * placeholders on purpose — inventing a freight rate would be inventing a
 * quote, and the design's whole argument is that it refuses to do that.
 */
export function Pricing({ t, lang }: { t: T; lang: Locale }) {
  const p = t.pricing;
  const logistics = [
    [p.logistics.row1, p.logistics.row1Value],
    [p.logistics.row2, p.logistics.row2Value],
    [p.logistics.row3, p.logistics.row3Value],
    [p.logistics.row4, p.logistics.row4Value],
    [p.logistics.row5, p.logistics.row5Value],
    [p.logistics.row6, p.logistics.row6Value],
  ];
  const tiers = [
    [p.sourcing.tier1, p.sourcing.tier1Fee, p.sourcing.tier1Rate],
    [p.sourcing.tier2, p.sourcing.tier2Fee, p.sourcing.tier2Rate],
    [p.sourcing.tier3, p.sourcing.tier3Fee, p.sourcing.tier3Rate],
  ];

  return (
    <section id="tarifs" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h2 className="font-display text-navy-900 mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance lg:text-[46px]">
            {p.title}
          </h2>
          <p className="text-navy-600 mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed">
            {p.intro}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="border-navy-100 rounded-2xl border p-7">
            <h3 className="font-display text-navy-900 text-xl font-semibold">
              {p.logistics.title}
            </h3>
            <p className="text-action mt-1 text-sm font-semibold">{p.logistics.note}</p>
            <dl className="mt-6 flex flex-col">
              {logistics.map(([label, value]) => (
                <div
                  key={label}
                  className="border-navy-100 flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
                >
                  <dt className="text-navy-900 text-[15px]">{label}</dt>
                  <dd className="text-navy-600 font-mono text-xs font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={`/${lang}/devis`}
              className="bg-action hover:bg-action-hover duration-fast mt-6 inline-flex h-11 items-center rounded-full px-6 text-[15px] font-semibold text-white transition-colors"
            >
              {p.logistics.cta}
            </Link>
          </div>

          <div className="border-navy-100 bg-navy-25 rounded-2xl border p-7">
            <h3 className="font-display text-navy-900 text-xl font-semibold">
              {p.sourcing.title}
            </h3>
            <p className="text-action mt-1 text-sm font-semibold">{p.sourcing.note}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {tiers.map(([band, fee, rate]) => (
                <li key={band} className="border-navy-100 rounded-xl border bg-white p-4">
                  <p className="text-navy-900 text-[15px] font-semibold">{band}</p>
                  <p className="text-navy-600 mt-1 text-sm">{fee}</p>
                  <p className="text-action mt-0.5 text-sm font-semibold">{rate}</p>
                </li>
              ))}
            </ul>
            <p className="text-navy-600 mt-4 text-xs leading-relaxed">
              {p.sourcing.source}{" "}
              <span className="bg-amber-soft text-amber-ink font-mono rounded px-1.5 py-0.5 font-semibold">
                {p.sourcing.sourceTbc}
              </span>
            </p>
            <Link
              href={`/${lang}/devis`}
              className="text-action mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline"
            >
              {p.sourcing.cta} →
            </Link>
          </div>
        </div>

        <p className="text-navy-600 mt-6 text-center text-sm">
          {p.payment}{" "}
          <span className="bg-amber-soft text-amber-ink font-mono rounded px-1.5 py-0.5 text-xs font-semibold">
            {p.paymentTbc}
          </span>
          {p.paymentTail}
        </p>
      </div>
    </section>
  );
}

/** FAQ — details/summary so it works without JavaScript. */
export function Faq({ t }: { t: T }) {
  const f = t.faq;
  const items = [
    { q: f.q1, a: f.a1 },
    { q: f.q2, a: null },
    { q: f.q3, a: null },
    { q: f.q4, a: null },
    { q: f.q5, a: null },
  ];
  return (
    <section id="faq" className="bg-navy-25 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <h2 className="font-display text-navy-900 mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance lg:text-[40px]">
            {f.title}
          </h2>
          <p className="text-navy-600 mt-4 text-[15px]">
            {f.more}{" "}
            <a href={`mailto:${f.email}`} className="text-action font-semibold hover:underline">
              {f.email}
            </a>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="border-navy-100 group rounded-xl border bg-white px-5 py-4"
            >
              <summary className="text-navy-900 flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold">
                {it.q}
                <span
                  aria-hidden="true"
                  className="text-action shrink-0 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              {it.a && (
                <p className="text-navy-600 mt-3 text-[15px] leading-relaxed">{it.a}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing call to action. */
export function ClosingCta({ t, lang }: { t: T; lang: Locale }) {
  const c = t.cta;
  return (
    <section className="bg-navy-950 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-white text-balance lg:text-[46px]">
          {c.title}
        </h2>
        <p className="text-navy-300 mt-5 text-[17px] leading-relaxed">
          {c.body1}{" "}
          <span className="bg-amber-soft text-amber-ink font-mono rounded px-1.5 py-0.5 text-xs font-semibold">
            {c.delay}
          </span>
          {c.body2}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${lang}/devis`}
            className="bg-action hover:bg-action-hover duration-fast inline-flex h-13 items-center rounded-full px-7 text-base font-semibold text-white transition-colors"
          >
            {c.primary}
          </Link>
          <a
            href={`mailto:${c.email}`}
            className="duration-fast inline-flex h-13 items-center rounded-full border border-white/20 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            {c.email}
          </a>
        </div>
      </div>
    </section>
  );
}
