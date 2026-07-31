"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";

/**
 * Home-page intro overlay — a percentage counter and an oversized wordmark
 * that clear away once the page is genuinely ready.
 *
 * Honesty about the number
 * ------------------------
 * The counter is driven by real load milestones, not a scripted animation:
 * DOM parsed → 45, webfonts ready → 78, window `load` → 100, easing
 * smoothly between them so it never jumps. This follows the same rule the
 * routing progress bar sets ("we don't fake a percentage"), the difference
 * being that here there ARE real milestones to report. If the page is
 * already cached and loads instantly, the intro is correspondingly brief.
 *
 * Bounded
 * -------
 * A slow third-party asset can't hold the page hostage: past CAP_MS the
 * easing rate jumps and the counter completes regardless. Worst case is
 * ~2.5s, and globals.css carries a 6s CSS-only failsafe on top of that in
 * case this component throws before dismissing itself.
 *
 * Shown once per session
 * ----------------------
 * The `sp_seen_intro` session cookie is set the moment the intro starts, so
 * a mid-intro refresh won't replay it. The server reads that cookie and
 * omits this component entirely on repeat visits — which is why there is no
 * flash-then-hide and no hydration mismatch. Cookie rather than
 * sessionStorage specifically so the server can make that call.
 *
 * Never traps anyone: reduced motion hides it in CSS before first paint,
 * and <noscript> removes it when there'd be no JS to dismiss it.
 */

export const INTRO_COOKIE = "sp_seen_intro";

/** Past this, stop being patient and wind the counter up quickly. */
const CAP_MS = 2200;
/** Keep in step with --duration-slow in globals.css. */
const EXIT_MS = 320;

type Phase = "running" | "leaving" | "done";

export function HomeIntro({ locale }: { locale: Locale }) {
  // Server renders exactly this: phase "running" at 0%. Hydration matches,
  // then the effect below takes over.
  const [phase, setPhase] = useState<Phase>("running");
  const [pct, setPct] = useState(0);

  const percentFormat = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 0,
      });
    } catch {
      return null;
    }
  }, [locale]);

  useEffect(() => {
    // Set first: a refresh partway through shouldn't start over.
    document.cookie = `${INTRO_COOKIE}=1; path=/; samesite=lax`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // CSS has already hidden the overlay before first paint; this just
      // retires the now-invisible markup. Deferred into a frame rather than
      // called straight from the effect body, which would be a synchronous
      // cascading render (react-hooks/set-state-in-effect).
      const unmount = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(unmount);
    }

    let target = 12;
    let shown = 0;
    let frame = 0;
    let exitTimer: number | undefined;
    let cancelled = false;
    const startedAt = performance.now();

    const bump = (value: number) => {
      if (value > target) target = value;
    };

    const onDomReady = () => bump(45);
    const onWindowLoad = () => bump(100);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
    } else {
      bump(45);
    }

    if (document.readyState === "complete") {
      bump(100);
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    // Webfonts are the asset most likely to cause a visible reflow, so
    // they're worth waiting on before revealing the hero.
    document.fonts?.ready
      .then(() => {
        if (!cancelled) bump(78);
      })
      .catch(() => {
        /* FontFaceSet unavailable or rejected — the other milestones carry it. */
      });

    const capTimer = window.setTimeout(() => bump(100), CAP_MS);

    const tick = () => {
      if (cancelled) return;

      const overBudget = performance.now() - startedAt > CAP_MS;
      shown += (target - shown) * (overBudget ? 0.35 : 0.085);

      if (target >= 100 && shown >= 99.3) {
        setPct(100);
        setPhase("leaving");
        exitTimer = window.setTimeout(() => setPhase("done"), EXIT_MS + 40);
        return;
      }

      // Never show 100 before we've actually finished.
      setPct(Math.min(99, Math.floor(shown)));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(capTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      document.removeEventListener("DOMContentLoaded", onDomReady);
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  if (phase === "done") return null;

  const display = percentFormat ? percentFormat.format(pct / 100) : `${pct}%`;

  return (
    <>
      {/* Without JS nothing would ever dismiss the overlay, so remove it.
          dangerouslySetInnerHTML keeps React 19's <style> hoisting from
          lifting this rule out of the <noscript> and applying it always. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>.sp-intro{display:none!important}</style>",
        }}
      />

      <div
        data-phase={phase}
        aria-hidden="true"
        className="sp-intro z-intro bg-page fixed inset-0 overflow-hidden"
      >
        <span className="font-display text-headline absolute inset-s-6 top-6 text-2xl font-semibold tabular-nums sm:inset-s-8 sm:top-8 sm:text-3xl">
          {display}
        </span>

        {/* Bleeds off the inline-end edge, mirrored automatically in Arabic
            because `inset-s-0` resolves to inset-inline-start. */}
        <span className="font-display text-headline absolute inset-s-0 bottom-0 translate-y-[0.09em] text-[10vw] leading-[0.78] font-black tracking-tight whitespace-nowrap select-none">
          SourcingPick
        </span>
      </div>
    </>
  );
}
