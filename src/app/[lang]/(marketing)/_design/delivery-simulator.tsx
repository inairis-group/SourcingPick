"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

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
 * The page is drawn in French only, so the figures are always written the
 * French way. The drawn result cells are found through the `data-sim`
 * attributes the porter puts on them, and updated in place: the fields are
 * uncontrolled, so React has nothing to reconcile against what is typed.
 */

const VOLUMETRIC_DIVISOR = 6000;

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const cubic = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

export function DeliverySimulator({
  id,
  className,
  style,
  children,
}: {
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

    const update = () => {
      const [cartons, weight, length, width, height] = inputs.map(read);
      const ready = cartons > 0 && weight > 0 && length > 0 && width > 0 && height > 0;

      const actual = cartons * weight;
      const perCartonVolumetric = (length * width * height) / VOLUMETRIC_DIVISOR;
      const volumetricTotal = cartons * perCartonVolumetric;
      const bill = Math.max(actual, volumetricTotal);
      const m3 = (cartons * length * width * height) / 1_000_000;
      const dash = "—";

      // [value, detail] spans of a drawn card: the figure and what it is made of.
      const fill = (el: HTMLElement | null, figure: string, detail?: string) => {
        if (!el) return;
        setText(textNode(el.children[1]), figure);
        if (detail !== undefined && el.children[2]) el.children[2].textContent = detail;
      };
      const dims = `${number.format(length)} × ${number.format(width)} × ${number.format(height)}`;
      fill(real, ready ? number.format(actual) : dash, ready ? `${number.format(cartons)} × ${number.format(weight)} kg` : undefined);
      fill(volumetric, ready ? number.format(volumetricTotal) : dash);
      fill(chargeable, ready ? number.format(bill) : dash);

      if (volume) {
        const figure = volume.querySelector("b");
        if (figure) figure.textContent = ready ? `${cubic.format(m3)} m³` : dash;
        const last = Array.from(volume.childNodes).reverse().find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
        if (last && ready) last.nodeValue = `· ${number.format(cartons)} × ${dims} cm`;
      }
    };

    section.addEventListener("input", update);
    update();
    return () => section.removeEventListener("input", update);
  }, []);

  return (
    <section ref={root} id={id} className={className} style={style}>
      {children}
    </section>
  );
}
