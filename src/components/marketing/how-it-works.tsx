import Image from "next/image";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * How it works — the four steps, as a photographic bento.
 *
 * This section absorbed the page's "why teams trust us" block, which said the
 * same things in different words ("an agent takes over" / "a dedicated
 * agent", "escrow payment, delivery" / "built-in escrow"). Rather than run
 * both, the process is the only telling of it now.
 *
 * Bento rather than an even 4-up: steps 1 and 4 — the ask and the money — get
 * the wide cards and a side-by-side layout, steps 2 and 3 stack. The uneven
 * rhythm is what keeps a four-card row from reading as a spec sheet.
 *
 * Imagery is illustrative, so every `alt` is intentionally empty: the step
 * title and body already carry the meaning, and describing the stock photo
 * would only add noise for screen-reader users.
 */

/**
 * Unsplash-hosted, hotlinked from their CDN (permitted by the licence). Same
 * caveat as the hero: worth self-hosting under /public before launch so a
 * third-party origin isn't on the critical path for five images.
 */
const STEP_IMAGES = [
  // Desk, notebooks, laptops — specifying a requirement.
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1400&auto=format&fit=crop",
  // A team at work — the agent picking the file up.
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
  // Warehouse racking — the factories being quoted.
  "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1400&auto=format&fit=crop",
  // Freight on the road — release and delivery.
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1400&auto=format&fit=crop",
] as const;

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const hiw = dict.marketing.howItWorks;
  const steps = [hiw.step1, hiw.step2, hiw.step3, hiw.step4];

  return (
    <section className="bg-subtle border-line-subtle border-y">
      <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:py-32">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center lg:mb-20">
          <p className="text-info mb-3 text-xs font-medium tracking-wide uppercase">
            {hiw.eyebrow}
          </p>
          <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {hiw.title}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {steps.map((step, i) => {
            // Steps 1 and 4 lead each row of the bento.
            const wide = i === 0 || i === 3;
            return (
              <Reveal
                key={step.title}
                as="article"
                delay={80 + i * 70}
                className={cn(
                  "border-line bg-surface relative flex overflow-hidden rounded-3xl border",
                  "sheen-brand",
                  "duration-base ease-default transition-all hover:-translate-y-1 hover:shadow-md",
                  wide ? "flex-col md:col-span-2 md:flex-row" : "flex-col",
                )}
              >
                <div
                  className={cn(
                    // `relative` so the copy paints above the .sheen-brand wash.
                    "relative flex flex-col p-8 sm:p-10",
                    wide && "md:w-1/2 md:justify-center lg:p-14",
                  )}
                >
                  <span className="text-faint font-mono text-xs tracking-wide uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-headline mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">{step.body}</p>
                </div>

                <div
                  className={cn(
                    "relative",
                    wide
                      ? "m-4 min-h-55 rounded-2xl md:w-1/2 lg:min-h-70"
                      : "m-4 aspect-16/10 rounded-2xl",
                  )}
                >
                  <Image
                    src={STEP_IMAGES[i]}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="rounded-2xl object-cover"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
