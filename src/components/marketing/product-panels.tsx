import type { CSSProperties } from "react";
import { Reveal } from "./reveal";
import {
  DesktopFrame,
  PhoneScreen,
  SourcingScreen,
  MarketplaceScreen,
  CertificationScreen,
  SOURCING_PHONE,
  MARKETPLACE_PHONE,
  CERTIFICATION_PHONE,
} from "./app-preview";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * The three disciplines — sourcing, marketplace, certification — as full-bleed
 * panels that park and get covered by the next one.
 *
 * The stacking is pure `position: sticky` (see `.panel-stack-item` in
 * globals.css). No scroll listener, no observer, no scrubbed transforms —
 * which is both why it costs nothing at runtime and why it survives
 * `prefers-reduced-motion` untouched: it degrades to three ordinary stacked
 * sections, which is essentially the design this replaced.
 *
 * Each panel carries an oversized vector render of the matching product screen
 * (components/marketing/app-preview.tsx), anchored to the inline-end edge and
 * deliberately running past it so the panel crops it. The point of the section
 * is that the product exists; a full app window bleeding off the card makes
 * that case far better than a small picture centred inside one.
 *
 * Panels are fixed-dark (`bg-ink-deep`), the same call cta-section.tsx makes,
 * which is what lets the light app windows read as screens against them.
 *
 * Copy still comes from `marketing.pillars.*` — the wording is unchanged, only
 * the layout is, so renaming the namespace would have churned four locale
 * files for nothing.
 */

const PANELS = [
  {
    key: "sourcing",
    Screen: SourcingScreen,
    phone: SOURCING_PHONE,
    nav: "Requests",
    path: "app.sourcingpick.com/requests/REQ-2214",
  },
  {
    key: "marketplace",
    Screen: MarketplaceScreen,
    phone: MARKETPLACE_PHONE,
    nav: "Marketplace",
    path: "app.sourcingpick.com/marketplace",
  },
  {
    key: "certification",
    Screen: CertificationScreen,
    phone: CERTIFICATION_PHONE,
    nav: "Certification",
    path: "app.sourcingpick.com/certification",
  },
] as const;

export function ProductPanels({ dict }: { dict: Dictionary }) {
  const copy = dict.marketing.pillars;

  return (
    // 90vw rather than a max-width container: the panels read as near-full-bleed
    // slabs, and the 5vw either side acts as the gutter.
    <section className="mx-auto w-[90vw] py-20 lg:py-32">
      <Reveal className="mb-12 max-w-3xl lg:mb-20">
        <p className="text-info mb-3 text-xs font-medium tracking-wide uppercase">{copy.eyebrow}</p>
        <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {copy.title}
        </h2>
      </Reveal>

      <div className="flex flex-col gap-4">
        {PANELS.map(({ key, Screen, phone, nav, path }, i) => {
          const panel = copy[key];
          return (
            <article
              key={key}
              /* --panel-index staggers each panel's sticky offset so the
                 previously parked panels stay visible as thin edges above
                 the current one. */
              style={{ "--panel-index": i } as CSSProperties}
              className={cn(
                "panel-stack-item bg-ink-deep h-full flex-1 overflow-hidden rounded-3xl text-white",
                // ring + sheen give the panel a visible edge in dark mode,
                // where bg-ink-deep is only 1.02:1 against the page and
                // shadow-lg registers barely at all.
                "sheen-top ring-1 ring-white/10 ring-inset",
                "px-6 py-14 sm:px-12 sm:py-20 lg:px-20 lg:py-24",
                // 90vh, paired with the reduced park offset in
                // .panel-stack-item so that offset + height still fits the
                // viewport — a sticky panel taller than the viewport parks
                // with its bottom clipped and no way to scroll it into view.
                "flex min-h-[70vh] md:min-h-[90vh] flex-col",
                "shadow-lg",
              )}
            >
              {/* Both renders are direct children of the panel, not of the copy
                  column, so they anchor to its padding box and run past it —
                  the panel's `overflow-hidden` does the cropping, and that crop
                  is the effect: a screen continuing beyond the card rather than
                  a picture sitting inside one. Decorative, so the heading and
                  body carry the meaning.

                  Phone below lg — a desktop window shrunk to phone width is an
                  illegible smudge. `max-w-80` caps it at device width so the
                  768–1023px band doesn't render a metre-wide "phone";
                  `inset-x-0 + mx-auto` centres it with no transform, so no RTL
                  variant is needed. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -bottom-10 mx-auto w-[95%] max-w-80 lg:hidden"
              >
                <PhoneScreen data={phone} />
              </div>

              {/* Desktop window from lg: natural size, leading edge anchored at
                  52% so it always clears the 46% copy column whatever the
                  viewport. A fixed negative pull from the far edge was
                  width-dependent and landed on top of the copy. Logical inset,
                  so it mirrors in Arabic. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-s-[52%] top-28 hidden lg:block"
              >
                <DesktopFrame active={nav} path={path}>
                  <Screen />
                </DesktopFrame>
              </div>

              {/* On mobile the copy stacks at the top so the window has the
                  lower half of the panel to itself. From lg it spreads to
                  headline-top / body-bottom beside the window, capped short of
                  half-width so it never runs under it.

                  `z-10` is the belt to that braces: even if a long translation
                  pushes the column wider than expected, the text paints over
                  the window rather than under it. `relative` also puts it above
                  the .sheen-top layer. */}
              <div className="relative z-10 flex w-full flex-1 flex-col gap-6 lg:max-w-[46%] lg:justify-between lg:gap-10">
                <Reveal className="max-w-2xl">
                  <p className="font-mono text-xs tracking-wide text-white/50 uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display mt-4 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
                    {panel.title}
                  </h3>
                </Reveal>

                <Reveal delay={180}>
                  <p className="text-md max-w-md leading-relaxed text-white/75 lg:text-lg">
                    {panel.body}
                  </p>
                </Reveal>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
