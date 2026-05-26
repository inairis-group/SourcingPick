"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fixed top progress bar that signals in-flight client navigation.
 *
 * Why this exists: Next 16's `useLinkStatus` is per-Link and only useful as
 * inline feedback near the clicked anchor. For a global bar covering the
 * whole app we listen at the document level:
 *   1. Capture-phase click on any internal `<a href="/...">` → start.
 *   2. Pathname or search-params change → complete.
 *
 * The bar uses an indeterminate sweep animation while pending (we don't
 * fake a percentage) and fades out once the new route lands.
 * `prefers-reduced-motion` users see a static accent bar instead of the
 * sweep — handled in globals.css.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Completion: pathname or search-params changed → navigation landed.
  // We don't include `pending` in deps — the effect must only fire on route
  // change. Including pending would re-trigger on every flip and feedback.
  useEffect(() => {
    if (completeTimer.current) clearTimeout(completeTimer.current);
    completeTimer.current = setTimeout(() => setPending(false), 220);
    return () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Start trigger: anchor clicks that resolve to an internal navigation.
  useEffect(() => {
    const startIfInternal = (e: MouseEvent) => {
      // Modified clicks open in new tabs / windows / downloads → not SPA nav.
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      if (/^(?:mailto|tel|javascript):/i.test(href)) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // No-op nav to the same URL: don't flash the bar.
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }

      setPending(true);
    };

    // Capture phase: fires before Next.js's own click handler.
    document.addEventListener("click", startIfInternal, true);
    return () =>
      document.removeEventListener("click", startIfInternal, true);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-[2px] overflow-hidden"
    >
      <span
        className={cn(
          "block h-full bg-action transition-opacity",
          pending
            ? "opacity-100 animate-top-progress"
            : "opacity-0 duration-base",
        )}
      />
    </div>
  );
}
