import { Link } from "@/components/ui/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Home page sections for the 2026-09 redesign.
 *
 * The artboards are fixed 1440×8000 mockups with absolute positioning; these
 * rebuild them responsively rather than transplanting that CSS, so the design
 * survives a phone. Type, colour and rhythm are taken from the artboards:
 * Unbounded headings, the navy ground, and the alternating white / #EEF3FF
 * section bands.
 */

type T = Dictionary["site"]["home"];

/** Small uppercase mono pill the design uses to label every band. */
export function Eyebrow({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "font-mono inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold tracking-[0.08em] uppercase",
        tone === "light"
          ? "border-navy-100 text-action bg-white"
          : "border-white/15 bg-white/10 text-white",
      )}
    >
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  intro,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "font-display mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-[46px]",
          dark ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed",
            dark ? "text-navy-300" : "text-navy-600",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

/** Hero — navy ground, highlighter sweep on the middle word. */
export function Hero({ t, lang }: { t: T; lang: Locale }) {
  const h = t.hero;
  return (
    <section className="bg-navy-950 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-24 lg:pt-24 lg:pb-28">
        <div className="max-w-2xl">
          <Eyebrow>{h.eyebrow}</Eyebrow>

          <h1 className="font-display mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl lg:text-[62px]">
            {h.title1}{" "}
            {/* The design highlights one word with a marker sweep rather than
                a colour change — it survives on a dark ground where a tint
                would not. */}
            <span className="bg-gradient-to-b from-transparent from-[60%] via-amber-edge via-[60%] to-transparent to-[90%] box-decoration-clone px-0.5">
              {h.title2}
            </span>{" "}
            {h.title3}
          </h1>

          <p className="text-navy-300 mt-7 max-w-xl text-[19px] leading-relaxed">
            {h.body}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={`/${lang}/devis`}
              className="bg-action hover:bg-action-hover duration-fast inline-flex h-13 items-center rounded-full px-7 text-base font-semibold text-white transition-colors"
            >
              {h.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/comment-ca-marche`}
              className="duration-fast inline-flex h-13 items-center rounded-full border border-white/20 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              {h.ctaSecondary}
            </Link>
          </div>

          <ul className="text-navy-300 mt-10 flex flex-wrap gap-x-7 gap-y-2 text-sm">
            {[h.stat1, h.stat2, h.stat3].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span aria-hidden="true" className="bg-brand-onnavy h-1.5 w-1.5 rounded-full" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The six warehouse operations, plus the sourcing and not-yet cards. */
export function Operations({ t, lang }: { t: T; lang: Locale }) {
  const o = t.ops;
  const steps = [o.step1, o.step2, o.step3, o.step4, o.step5, o.step6];
  return (
    <section id="services" className="bg-navy-25 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <SectionHead title={o.title} intro={o.intro} />

        <ol className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.num}
              className="border-navy-100 rounded-2xl border bg-white p-6"
            >
              <span className="font-mono text-action text-xs font-semibold tracking-[0.08em]">
                {s.num}
              </span>
              <h3 className="font-display text-navy-900 mt-3 text-lg font-semibold">
                {s.title}
              </h3>
              <p className="text-navy-600 mt-2 text-[15px] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="border-action/25 bg-brand-50 rounded-2xl border p-6 lg:col-span-2">
            <Eyebrow>{o.sourcing.tag}</Eyebrow>
            <h3 className="font-display text-navy-900 mt-4 text-xl font-semibold">
              {o.sourcing.title}
            </h3>
            <p className="text-navy-600 mt-2 text-[15px] leading-relaxed">
              {o.sourcing.body}
            </p>
            <Link
              href={`/${lang}/devis`}
              className="text-action mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline"
            >
              {o.sourcing.cta} →
            </Link>
          </div>

          {/* Kept deliberately plain: the design lists what is NOT sold yet,
              and dressing it up would undercut the point. */}
          <div className="border-navy-100 rounded-2xl border border-dashed bg-white p-6">
            <span className="bg-amber-soft text-amber-ink inline-flex rounded-full px-3 py-1 text-xs font-semibold">
              {o.future.tag}
            </span>
            <h3 className="font-display text-navy-900 mt-4 text-lg font-semibold">
              {o.future.title}
            </h3>
            <p className="text-navy-600 mt-2 text-[15px] leading-relaxed">{o.future.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Six statuses, mirroring what the buyer sees in the app. */
export function Flow({ t }: { t: T }) {
  const f = t.flow;
  const steps = [f.step1, f.step2, f.step3, f.step4, f.step5, f.step6];
  return (
    <section id="comment-ca-marche" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <SectionHead eyebrow={f.eyebrow} title={f.title} intro={f.intro} />
        <ol className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="border-navy-100 bg-navy-25 rounded-2xl border p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="bg-action inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <span className="bg-emerald-soft text-emerald rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  {s.status}
                </span>
              </div>
              <h3 className="font-display text-navy-900 mt-4 text-lg font-semibold">
                {s.title}
              </h3>
              <p className="text-navy-600 mt-2 text-[15px] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The trust section — what's true today, and what you won't find here. */
export function Transparency({ t }: { t: T }) {
  const x = t.trust;
  const trues = [x.true1, x.true2, x.true3, x.true4, x.true5];
  const wonts = [x.wont1, x.wont2, x.wont3, x.wont4];
  return (
    <section id="transparence" className="bg-navy-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <SectionHead eyebrow={x.eyebrow} title={x.title} intro={x.intro} dark />

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="font-mono text-brand-onnavy text-xs font-semibold tracking-[0.08em] uppercase">
            {x.addressLabel}
          </p>
          <p className="mt-2 text-white" lang="zh">{x.addressZh}</p>
          <p className="text-navy-300 mt-1 text-sm">{x.addressLatin}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-display text-lg font-semibold text-white">{x.trueTitle}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {trues.map((s) => (
                <li key={s} className="text-navy-200 flex gap-3 text-[15px]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-display text-lg font-semibold text-white">{x.wontTitle}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {wonts.map((s) => (
                <li key={s} className="text-navy-200 flex gap-3 text-[15px]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
