import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Landing-page hero — centred type on an inset, rounded surface.
 *
 * No photograph and no mock-UI composition: the headline is the whole hero.
 * The lockup (emphasised phrase in a filled dark box) does the work an image
 * would otherwise do, which is the same bet the reference site makes.
 *
 * Why the card is light rather than dark
 * --------------------------------------
 * Three reasons, all structural:
 *
 *   1. Rhythm. The next section is three fixed-dark stacking panels. A dark
 *      hero would run straight into them as one continuous dark mass; light
 *      here gives light → dark → light → dark down the page.
 *   2. Dark mode. `--color-ink-deep` (#0a1330) sits almost exactly on the dark
 *      page background (#0b1220), so a dark hero card would all but disappear
 *      in that theme. Theme-following surface tokens hold up in both.
 *   3. The navbar. It's a floating `bg-page/85` pill — light and translucent.
 *      Over a dark card it reads as a misplaced element.
 *
 * It also keeps the emphasis box dark-on-light, which is the distinctive half
 * of the lockup; inverting it to white-on-dark is a weaker mark.
 */
export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="px-4 pt-24 pb-8 sm:px-6 lg:pt-28">
      <div className="border-line bg-subtle max-w-8xl relative mx-auto overflow-hidden rounded-3xl border shadow-sm">
        {/* Brand-tinted bloom from the top edge. Applied as a single layer at
            a flat opacity rather than as a pre-tinted colour, so it lands
            correctly over both the light and dark values of `bg-subtle`
            without needing a second token. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% -5%, var(--color-brand-500), transparent 72%)",
            // Raised from 0.10: on a near-white surface a brand tint has far
            // less room to register than the same glow would on a dark one.
            opacity: 0.18,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:px-10 sm:py-32 lg:py-40">
          <p
            className="animate-fade-up text-info mb-4 text-sm font-medium tracking-wide uppercase"
            style={{ animationDelay: "0ms" }}
          >
            {dict.marketing.hero.eyebrow}
          </p>

          {/* The emphasised phrase sits in a filled box, so the headline reads
              as a lockup rather than a sentence. The split lives in the
              dictionary (lead / emphasis / trail) rather than being derived
              here — the emphasised words aren't in the same position in every
              language, and in Arabic they aren't even on the same side.
              `box-decoration-clone` keeps the padding and radius intact when
              the box wraps across lines, which at this width it will. */}
          <h1
            className="animate-fade-up font-display text-headline text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {dict.marketing.hero.title.lead}
            <span className="bg-ink-deep rounded-lg box-decoration-clone px-3 py-0.5 text-white">
              {dict.marketing.hero.title.emphasis}
            </span>
            {dict.marketing.hero.title.trail}
          </h1>

          <p
            className="animate-fade-up text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            {dict.marketing.hero.subtitle}
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
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

          <p
            className="animate-fade-up text-faint mt-6 text-sm"
            style={{ animationDelay: "320ms" }}
          >
            {dict.marketing.hero.assurance}
          </p>
        </div>
      </div>
    </section>
  );
}
