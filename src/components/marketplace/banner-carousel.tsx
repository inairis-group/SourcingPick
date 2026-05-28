"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/ui/link";
import { BannerCard, type BannerCardData } from "./banner-card";
import { cn } from "@/lib/utils";

export type BannerSlide = {
  id: string;
  /** Resolved CTA destination (locale-prefixed) or null. */
  href: string | null;
  card: BannerCardData;
};

const AUTO_ADVANCE_MS = 6000;

/**
 * Marketplace banner carousel. One slide visible at a time on a sliding
 * track, auto-advancing every 6s, with an animated dot indicator (the
 * active dot widens into a pill). Pauses on hover/focus. A single banner
 * renders without controls. Honours prefers-reduced-motion (the global CSS
 * rule collapses the slide transition; auto-advance still works but the
 * jump is instant).
 */
export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  // Keep a ref so the interval callback reads the latest index without
  // re-subscribing every tick.
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((indexRef.current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  // Clamp if the slide set shrinks (e.g. cache refresh).
  const active = Math.min(index, count - 1);

  const wrap = (slide: BannerSlide) =>
    slide.href ? (
      <Link href={slide.href} variant="muted" className="block">
        <BannerCard banner={slide.card} />
      </Link>
    ) : (
      <BannerCard banner={slide.card} />
    );

  if (count === 1) {
    return wrap(slides[0]);
  }

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
    >
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-slow ease-emphasize"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="w-full shrink-0"
              aria-hidden={i !== active}
            >
              {wrap(slide)}
            </div>
          ))}
        </div>
      </div>

      {/* Animated dot indicator */}
      <div className="flex items-center justify-center gap-1.5">
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive}
              className={cn(
                "h-2 rounded-full transition-all duration-base ease-default",
                isActive
                  ? "w-6 bg-action"
                  : "w-2 bg-line hover:bg-muted",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
