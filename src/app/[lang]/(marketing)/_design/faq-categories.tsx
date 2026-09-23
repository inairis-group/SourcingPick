"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

/**
 * The FAQ's category chips.
 *
 * The canvas draws six chips with the first one filled and the other five
 * outlined, above six groups of questions — all of them visible. That is a
 * table of contents showing where you are, not a filter: a filter would have
 * been drawn with only the chosen category's questions under it. So the chips
 * scroll, and the fill follows the reader.
 *
 * They are ordinary anchors to ordinary ids, which the porter puts on the
 * groups (`#faq-group-1`…`-6`). With no JavaScript they still work — they
 * jump, the browser handles the scroll, and the only thing missing is the
 * moving highlight. This component adds that and nothing else.
 *
 * The fill is not applied here: the transcribed chips carry the artboard's own
 * two states inline, and `.sp-faq-chip` in globals.css turns them into
 * something that follows `aria-current` instead of the first chip always.
 */
export function FaqCategories({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  const chips = Children.toArray(children).filter(isValidElement);
  const [current, setCurrent] = useState(0);
  // A click starts a scroll that takes a moment. Until it lands, the spy is
  // still reading the old position and would hand the highlight straight back
  // to the group you just left — which is exactly what it did on the first
  // chip pressed after the page settled.
  const jumpingUntil = useRef(0);

  useEffect(() => {
    const targets = chips
      .map((c) => {
        const href = (c.props as { href?: string }).href;
        return href?.startsWith("#") ? document.getElementById(href.slice(1)) : null;
      })
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // No observer support: the chips still scroll, the highlight just does not
    // move. Better than no chips.
    if (typeof IntersectionObserver === "undefined") return;

    // Which group is being read. A plain "is intersecting" test picks
    // whichever group is tallest on screen, which on this page is whichever
    // has the longest answer.
    //
    // The tolerance matters: jumping to a chip leaves that group's heading a
    // little BELOW the header, so a strict "has scrolled past the top" test
    // would hand the highlight back to the previous group the moment you
    // arrived. A group counts as current once its heading has reached the
    // upper third of the readable area.
    const header = 84;
    const pick = () => {
      if (Date.now() < jumpingUntil.current) return;
      const line = Math.max(120, window.innerHeight * 0.35);
      let best = 0;
      let bestTop = -Infinity;
      targets.forEach((el, i) => {
        const top = el.getBoundingClientRect().top - header;
        if (top <= line && top > bestTop) {
          bestTop = top;
          best = i;
        }
      });
      // Past the last group — the foot of the page — the last chip stays lit
      // rather than snapping back to the first.
      setCurrent(best);
    };

    const observer = new IntersectionObserver(pick, {
      // Fires on every crossing; `pick` then decides from real positions.
      threshold: [0, 1],
      rootMargin: `-${header}px 0px 0px 0px`,
    });
    for (const el of targets) observer.observe(el);
    window.addEventListener("scroll", pick, { passive: true });
    pick();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pick);
    };
    // `chips` is rebuilt every render from server-rendered children that never
    // change, so the ids are stable; re-running on identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips.length]);

  return (
    <nav style={style} aria-label="FAQ">
      {chips.map((chip, i) =>
        cloneElement(chip as ReactElement<Record<string, unknown>>, {
          key: i,
          className: "sp-faq-chip",
          "aria-current": i === current ? "true" : undefined,
          onClick: () => {
            setCurrent(i);
            jumpingUntil.current = Date.now() + 700;
          },
        }),
      )}
    </nav>
  );
}
