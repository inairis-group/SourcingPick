"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "./motion.css";

/**
 * The previous site's motion, on these pages.
 *
 * The previous site (the Grok build of the same canvas, which still serves
 * /contact and /demande) ran the canvas's markup through a small motion
 * layer. It is reproduced here on the same structure, with the same
 * movements and timings (see motion.css):
 *
 * - the hero's drawing floats and drifts up a little as the page scrolls;
 *   its heading, line and buttons rise in as the page opens (motion.css);
 * - headings, cards and the six steps' columns rise into place as they
 *   come into view, once;
 * - the 220px drawings of the six operations float;
 * - the mascot moves: arms up hops and waves both arms among its sparkles,
 *   the badge nods, the magnifier scans, the factory visit floats; its
 *   right arm waves;
 * - on the home page's six-step line the dashes march, the current step
 *   rings and a container rides the line;
 * - a numbered list of steps is joined by a line drawn as it scrolls by;
 * - the quote buttons lift under the pointer.
 *
 * It only adds classes, a few SVG shapes and a mascot drawing in place of the
 * still one; none of the page's text or layout changes, and everything is
 * put back when the page changes. Nothing runs under prefers-reduced-motion,
 * and on a phone only the floating drawings and the button lift remain.
 */

const NARROW = "(max-width: 820px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/** The mascot drawings and what each one does, by file. */
const POSES: Record<string, "hop" | "nod" | "scan" | "float"> = {
  "picky-arms-up.svg": "hop",
  "picky-verified-badge.svg": "nod",
  "picky-loupe.svg": "scan",
  "picky-factory-visit.svg": "float",
};

/** Keyframes the animated mascot drawing carries inside itself. */
const MASCOT_STYLE = `
@keyframes spm-float{0%,100%{translate:0}50%{translate:0 -8px}}
@keyframes spm-hop{0%,100%{translate:0}40%{translate:0 -10px}}
@keyframes spm-scan{0%,100%{rotate:0deg}50%{rotate:-4deg}}
@keyframes spm-nod{0%,100%{translate:0}50%{translate:0 4px}}
@keyframes spm-arm{0%,100%{rotate:0deg}50%{rotate:-12deg}}
@keyframes spm-spark{0%,100%{opacity:.35}50%{opacity:1}}
.spm-pose{transform-box:view-box;transform-origin:50% 50%}
.spm-pose-float{transform-box:fill-box;animation:spm-float 6.5s ease-in-out infinite}
.spm-pose-hop{animation:spm-hop 2.8s ease-in-out infinite}
.spm-pose-scan{animation:spm-scan 3.2s ease-in-out infinite}
.spm-pose-nod{animation:spm-nod 3.4s ease-in-out infinite}
.spm-wave{transform-box:view-box;animation:spm-arm 2.6s ease-in-out infinite}
.spm-wave-late{animation-delay:.35s}
.spm-spark{transform-box:fill-box;transform-origin:50% 50%;animation:spm-spark 1.8s ease-in-out infinite}
`;

const SVG_NS = "http://www.w3.org/2000/svg";
const mascotCache = new Map<string, Promise<string | null>>();

function lastNumber(d: string): number {
  const all = d.match(/-?\d+(?:\.\d+)?/g);
  return all ? Number(all[all.length - 1]) : 0;
}

/** Wrap `nodes` in a <g class=…> pivoting on `origin`. */
function wrap(nodes: Element[], cls: string, origin: string) {
  const first = nodes[0];
  if (!first?.parentNode) return;
  const g = first.ownerDocument.createElementNS(SVG_NS, "g");
  g.setAttribute("class", cls);
  g.setAttribute("style", `transform-box: view-box; transform-origin: ${origin};`);
  first.parentNode.insertBefore(g, first);
  for (const n of nodes) g.appendChild(n);
}

/** The animated version of a mascot drawing, as an object URL. */
function animatedMascot(src: string, pose: string): Promise<string | null> {
  const key = `${src}#${pose}`;
  let job = mascotCache.get(key);
  if (!job) {
    job = fetch(src)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (!text || !text.includes('viewBox="-165 -185')) return null;
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const svg = doc.documentElement;
        if (svg.tagName.toLowerCase() !== "svg") return null;
        const paths = [...svg.querySelectorAll("path")];
        // A raised arm: drawn from the shoulder (±84) and ending above it.
        const arm = (side: "left" | "right") => {
          const own = paths.filter((p) => {
            const d = p.getAttribute("d") || "";
            return (side === "left" ? d.startsWith("M-84 ") : d.startsWith("M84 ")) && lastNumber(d) < 0;
          });
          const withHands: Element[] = [];
          for (const p of own) {
            withHands.push(p);
            const next = p.nextElementSibling;
            if (next?.tagName.toLowerCase() === "circle" && !withHands.includes(next)) withHands.push(next);
          }
          return withHands;
        };
        wrap(arm("right"), "spm-wave", "84px 4px");
        if (pose === "hop") {
          wrap(arm("left"), "spm-wave spm-wave-late", "-84px 2px");
          [...svg.querySelectorAll("rect")].forEach((r, i) => {
            if (r.getAttribute("width") === "10") {
              r.setAttribute("class", "spm-spark");
              r.setAttribute("style", `animation-delay:${(i * 0.18).toFixed(2)}s`);
            }
          });
        }
        const g = doc.createElementNS(SVG_NS, "g");
        g.setAttribute("class", `spm-pose spm-pose-${pose}`);
        while (svg.firstChild) g.appendChild(svg.firstChild);
        const style = doc.createElementNS(SVG_NS, "style");
        style.textContent = MASCOT_STYLE;
        svg.appendChild(style);
        svg.appendChild(g);
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
        return URL.createObjectURL(blob);
      })
      .catch(() => null);
    mascotCache.set(key, job);
  }
  return job;
}

export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const narrow = window.matchMedia(NARROW).matches;
    const undo: (() => void)[] = [];
    const addClass = (el: Element, ...cls: string[]) => {
      const fresh = cls.filter((c) => !el.classList.contains(c));
      el.classList.add(...fresh);
      undo.push(() => el.classList.remove(...fresh));
    };

    // The drawings of the six operations (drawn 220px wide) float, on every
    // screen; the quote buttons lift.
    for (const img of main.querySelectorAll("img")) {
      if (/(?:^|;)\s*width:\s*220px/.test(img.getAttribute("style") || "")) addClass(img, "spm-float");
    }
    for (const a of main.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      if (/\/(?:demande|devis)$/.test(new URL(a.href, location.href).pathname)) addClass(a, "spm-cta");
    }
    if (narrow) return () => undo.forEach((f) => f());

    const hero = main.querySelector(":scope > section");
    const heroImg = hero?.querySelector("img") ?? null;
    const heroArt = heroImg?.parentElement ?? null;
    if (heroImg) addClass(heroImg, "spm-hero-float");

    // The home page's six-step line.
    for (const svg of main.querySelectorAll("svg")) {
      const path = svg.querySelector("path");
      const d = path?.getAttribute("d") || "";
      if (!path || !d.startsWith("M20 60")) continue;
      addClass(path, "spm-dash");
      const circles = svg.querySelectorAll("circle");
      const last = circles[circles.length - 1];
      if (last) {
        const ring = last.cloneNode() as SVGCircleElement;
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#8DB2FF");
        ring.setAttribute("class", "spm-ring");
        last.parentNode?.insertBefore(ring, last);
        const traveler = document.createElementNS(SVG_NS, "rect");
        traveler.setAttribute("class", "spm-traveler");
        traveler.setAttribute("style", `offset-path: path('${d}');`);
        for (const [k, v] of Object.entries({ x: "-12", y: "-28", width: "24", height: "16", rx: "3", fill: "#FFC247", stroke: "#FFFFFF", "stroke-width": "2" })) {
          traveler.setAttribute(k, v);
        }
        svg.appendChild(traveler);
        undo.push(() => {
          ring.remove();
          traveler.remove();
        });
      }
    }

    // A numbered list of steps: the line joining its badges.
    const rails: { section: HTMLElement; badges: HTMLElement[] }[] = [];
    for (const section of main.querySelectorAll<HTMLElement>("section")) {
      const items = [...section.querySelectorAll(":scope > article")];
      if (items.length < 4) continue;
      const badges = items.map((a) => a.querySelector<HTMLElement>(":scope > span"));
      if (!badges.every((b) => b && /^\d$/.test(b.textContent?.trim() || ""))) continue;
      addClass(section, "spm-rail");
      badges.forEach((b) => addClass(b!, "spm-rail-badge"));
      rails.push({ section, badges: badges as HTMLElement[] });
    }
    const placeRails = () => {
      for (const { section, badges } of rails) {
        const box = section.getBoundingClientRect();
        const scale = section.offsetWidth ? box.width / section.offsetWidth : 1;
        if (!scale) continue;
        const first = badges[0].getBoundingClientRect();
        const last = badges[badges.length - 1].getBoundingClientRect();
        const rtl = getComputedStyle(section).direction === "rtl";
        const x = rtl ? (box.right - first.right) / scale + first.width / scale / 2 - 1 : (first.left - box.left) / scale + first.width / scale / 2 - 1;
        section.style.setProperty("--rail-x", `${Math.round(x)}px`);
        section.style.setProperty("--rail-top", `${Math.round((first.top - box.top) / scale + first.height / scale / 2)}px`);
        section.style.setProperty("--rail-bottom", `${Math.round((box.bottom - last.bottom) / scale + last.height / scale / 2)}px`);
      }
    };
    if (rails.length) {
      requestAnimationFrame(placeRails);
      window.addEventListener("resize", placeRails);
      undo.push(() => {
        window.removeEventListener("resize", placeRails);
        for (const { section } of rails) for (const p of ["--rail-x", "--rail-top", "--rail-bottom"]) section.style.removeProperty(p);
      });
    }

    // The mascot moves.
    let alive = true;
    for (const img of main.querySelectorAll("img")) {
      const src = img.getAttribute("src") || "";
      const pose = POSES[src.split("/").pop() || ""];
      if (!pose) continue;
      void animatedMascot(src, pose).then((url) => {
        if (!url || !alive || !img.isConnected) return;
        img.setAttribute("src", url);
        undo.push(() => img.setAttribute("src", src));
      });
    }
    undo.push(() => {
      alive = false;
    });

    // Rise into view: headings, cards, the steps' columns and badges.
    const stepCols = [...main.querySelectorAll("svg")]
      .filter((s) => (s.querySelector("path")?.getAttribute("d") || "").startsWith("M20 60"))
      .flatMap((s) => [...(s.nextElementSibling?.children ?? [])]);
    const cards = [...main.querySelectorAll<HTMLElement>("section > div")].filter((e) =>
      /border-radius:\s*2[24]px/.test(e.getAttribute("style") || ""),
    );
    const risers = [
      ...stepCols,
      ...main.querySelectorAll(".spm-rail-badge"),
      ...[...main.querySelectorAll("h2, article"), ...cards].filter(
        (e, i, all) => all.indexOf(e) === i && !hero?.contains(e) && !e.closest(".sp-step-card"),
      ).slice(0, 36),
    ].filter((e, i, all) => all.indexOf(e) === i) as HTMLElement[];

    const fold = window.innerHeight * 0.92;
    let queue = 0;
    let lastAt = 0;
    const reveal = (el: HTMLElement) => {
      const now = performance.now();
      if (now - lastAt > 640) queue = 0;
      lastAt = now;
      el.style.transitionDelay = `${queue * 90}ms`;
      queue += 1;
      el.classList.add("spm-in");
      el.classList.remove("spm-await");
      el.addEventListener(
        "transitionend",
        () => {
          el.classList.remove("spm-in");
          el.style.transitionDelay = "";
        },
        { once: true },
      );
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        for (const e of shown) {
          observer.unobserve(e.target);
          reveal(e.target as HTMLElement);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of risers) {
      const top = el.getBoundingClientRect().top;
      if (top < 0) continue; // already scrolled past: leave it be
      if (top < fold) continue; // on screen at load: shown as drawn
      el.classList.add("spm-await");
      observer.observe(el);
    }
    undo.push(() => {
      observer.disconnect();
      for (const el of risers) {
        el.classList.remove("spm-await", "spm-in");
        el.style.transitionDelay = "";
      }
    });

    // The hero's drawing drifts up as the page leaves it.
    if (hero && heroArt) {
      let frame = 0;
      const drift = () => {
        frame = 0;
        const top = (hero as HTMLElement).offsetTop;
        const span = (hero as HTMLElement).offsetHeight * 0.45 || 1;
        const progress = Math.min(1, Math.max(0, (window.scrollY - top) / span));
        heroArt.style.translate = progress ? `0 ${(-28 * progress).toFixed(2)}px` : "";
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(drift);
      };
      drift();
      window.addEventListener("scroll", onScroll, { passive: true });
      undo.push(() => {
        window.removeEventListener("scroll", onScroll);
        if (frame) cancelAnimationFrame(frame);
        heroArt.style.translate = "";
      });
    }

    const idle = () => {
      if (document.hidden) document.documentElement.setAttribute("data-spm-idle", "");
      else document.documentElement.removeAttribute("data-spm-idle");
    };
    document.addEventListener("visibilitychange", idle);
    undo.push(() => {
      document.removeEventListener("visibilitychange", idle);
      document.documentElement.removeAttribute("data-spm-idle");
    });

    return () => {
      for (let i = undo.length - 1; i >= 0; i--) undo[i]();
    };
  }, [pathname]);

  return null;
}
