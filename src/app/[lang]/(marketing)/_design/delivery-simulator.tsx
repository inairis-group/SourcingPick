"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";

/**
 * The shipment simulator on /livraisons.
 *
 * The canvas draws a form with the figures of its example filled in. This
 * stands in for the transcribed `<section id="simulateur">`, keeping its
 * markup server-rendered, and makes the "Comment c'est calculé" block follow
 * the five numeric fields.
 *
 * What it computes is what the page promises a visitor before they have an
 * account, and no more: the chargeable weight, never a price (the price of the
 * four modes stays behind a free sign-up, per the handoff's section 5).
 *
 *   actual weight      = cartons × weight per carton
 *   volumetric weight  = cartons × length × width × height (cm) ÷ 6 000
 *   chargeable weight  = the higher of the two
 *   volume             = cartons × length × width × height ÷ 1 000 000 (m³)
 *
 * The figures are written the way the page's language writes numbers. The
 * drawn result cells are found through the `data-sim` attributes the porter
 * puts on them, and updated in place: the fields are uncontrolled, so React
 * has nothing to reconcile against what is typed.
 */

const VOLUMETRIC_DIVISOR = 6000;

function read(input: HTMLInputElement | undefined): number {
  const value = Number((input?.value ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** The text node a drawn value is written in: the first one, before its unit. */
function textNode(el: Element | null | undefined): Text | null {
  if (!el) return null;
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim()) return n as Text;
  }
  return null;
}

function setText(node: Text | null, value: string) {
  if (node && node.nodeValue !== value) node.nodeValue = value;
}

/**
 * A drawn line with its figures replaced, in order: "20 × 18 kg" becomes
 * "12 × 7,5 kg". The units and the word order stay the translation's own.
 */
function refill(drawn: string, figures: string[]): string {
  let i = 0;
  return drawn.replace(/\d+(?:[.,]\d+)?/g, (m) => (i < figures.length ? figures[i++] : m));
}

export function DeliverySimulator({
  lang,
  id,
  className,
  style,
  children,
}: {
  lang: Locale;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;

    // Cartons, weight per carton, then length, width, height — the drawn order.
    const inputs = Array.from(section.querySelectorAll<HTMLInputElement>('input[type="text"]'));
    if (inputs.length < 5) return;
    for (const input of inputs) input.inputMode = "decimal";

    const card = (key: string) => section.querySelector<HTMLElement>(`[data-sim="${key}"]`);
    const real = card("real");
    const volumetric = card("vol");
    const chargeable = card("bill");
    const volume = card("volume");
    if (real) real.parentElement?.setAttribute("aria-live", "polite");

    const number = (n: number) => formatNumber(n, lang, { maximumFractionDigits: 1 });
    const cubic = (n: number) => formatNumber(n, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // The drawn example's lines, read once, before anything is rewritten.
    // Text nodes are rewritten in place, never replaced, so React keeps
    // owning the ones it rendered.
    const realDetail = textNode(real?.children[2]);
    const realLine = realDetail?.nodeValue ?? "";
    const volumeFigure = textNode(volume?.querySelector("b"));
    const volumeLine = volumeFigure?.nodeValue ?? "";
    const volumeTail = (volume
      ? Array.from(volume.childNodes).reverse().find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim())
      : null) as Text | null;
    const volumeTailLine = volumeTail?.nodeValue ?? "";

    const update = () => {
      const [cartons, weight, length, width, height] = inputs.map(read);
      const ready = cartons > 0 && weight > 0 && length > 0 && width > 0 && height > 0;

      const actual = cartons * weight;
      const perCartonVolumetric = (length * width * height) / VOLUMETRIC_DIVISOR;
      const volumetricTotal = cartons * perCartonVolumetric;
      const bill = Math.max(actual, volumetricTotal);
      const m3 = (cartons * length * width * height) / 1_000_000;
      const dash = "—";

      // The value span of a drawn card: its figure, before its unit.
      const fill = (el: HTMLElement | null, figure: string) => {
        if (el) setText(textNode(el.children[1]), figure);
      };
      fill(real, ready ? number(actual) : dash);
      fill(volumetric, ready ? number(volumetricTotal) : dash);
      fill(chargeable, ready ? number(bill) : dash);
      if (!ready) {
        setText(volumeFigure, dash);
        return;
      }
      setText(realDetail, refill(realLine, [number(cartons), number(weight)]));
      setText(volumeFigure, refill(volumeLine, [cubic(m3)]));
      setText(volumeTail, refill(volumeTailLine, [cartons, length, width, height].map(number)));
    };

    section.addEventListener("input", update);
    update();
    return () => section.removeEventListener("input", update);
  }, [lang]);

  return (
    <section ref={root} id={id} className={className} style={style}>
      {children}
    </section>
  );
}
