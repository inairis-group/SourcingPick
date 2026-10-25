"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The six step cards of /services park and stack (`.sp-step-card`, in
 * globals.css). Each is as tall as its own copy, so a shorter card parked
 * over a taller one left the bottom of the taller one showing under it.
 * This gives them all the height of the tallest, measured in the page's own
 * language and width, whenever they are stacking (`position: sticky`); on a
 * phone they are in ordinary flow and keep their own heights.
 */
export function StepStack() {
  const pathname = usePathname();

  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>(".sp-step-card")];
    if (cards.length < 2) return;

    const equalize = () => {
      for (const c of cards) c.style.minHeight = "";
      if (getComputedStyle(cards[0]).position !== "sticky") return;
      const tallest = Math.max(...cards.map((c) => c.getBoundingClientRect().height));
      for (const c of cards) c.style.minHeight = `${Math.ceil(tallest)}px`;
    };

    equalize();
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(equalize);
    };
    window.addEventListener("resize", onResize);
    void document.fonts?.ready.then(equalize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      for (const c of cards) c.style.minHeight = "";
    };
  }, [pathname]);

  return null;
}
