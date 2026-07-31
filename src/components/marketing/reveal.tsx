"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Viewport-triggered entrance animation.
 *
 * Replaces bare `animate-fade-up` on anything below the fold.
 * `animate-fade-up` is a plain CSS animation, so it starts the moment the
 * element renders — sections further down the page finish animating long
 * before the user scrolls to them. This defers the animation until the
 * element is actually on screen.
 *
 * The hidden-until-revealed state lives in CSS behind
 * `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`
 * (see globals.css), NOT in this component. That matters: if the JS never
 * loads, or IntersectionObserver is missing, the content is visible by
 * default rather than stuck at opacity 0.
 *
 * One-shot by design — the observer unobserves on first intersection, so
 * scrolling back up never replays it.
 */
type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms, for sequencing siblings. */
  delay?: number;
  /** Element to render. Defaults to a plain div. */
  as?: ElementType;
};

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support — show it and move on.
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-revealed", "");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      {
        // Fire slightly before the element reaches the bottom edge, so the
        // animation is already underway by the time it's comfortably in view.
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.01,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
