"use client";

import { Children, cloneElement, isValidElement, useId, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

/**
 * A question that opens and closes.
 *
 * The canvas draws every disclosure open — an artboard is a picture of the
 * content, so it has to be — and marks each header `aria-expanded="true"`.
 * That attribute is the seam: the porter turns any element with a direct-child
 * `<button aria-expanded>` into one of these, so this is generic rather than
 * the FAQ page's accordion. The same rule catches the ones on the home and
 * pricing pages.
 *
 * It opens in the state the canvas drew it in. Collapsing all seventeen FAQ
 * answers by default would be the conventional choice and is not the drawn
 * one, and this file is not the place to decide that.
 *
 * The children arrive already transcribed: the first is the header button, the
 * rest are the panel. The button is cloned rather than re-created, so its
 * styling stays the design's.
 */
export function Disclosure({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  const [head, ...panel] = Children.toArray(children);
  const [open, setOpen] = useState(true);
  const panelId = useId();

  const header =
    isValidElement(head) &&
    cloneElement(head as ReactElement<Record<string, unknown>>, {
      onClick: () => setOpen((v) => !v),
      "aria-expanded": open,
      "aria-controls": panelId,
      // The canvas draws the icon as a cross, because every question is drawn
      // open. Turned 45° it is the plus that means "closed" — the same glyph
      // the designer gave us, doing the other half of its job.
      "data-open": open ? "true" : "false",
      className: "sp-disclosure-head",
    });

  return (
    <div style={style}>
      {header || head}
      {/* The panel only gets a display when it is open: `hidden` works by
          setting `display: none` from the UA stylesheet, and an inline
          display would outrank it and leave the answer on screen. Inheriting
          the gap keeps a multi-part panel spaced as the wrapper spaced it. */}
      <div
        id={panelId}
        hidden={!open}
        style={open ? { display: "flex", flexDirection: "column", gap: "inherit" } : undefined}
      >
        {panel}
      </div>
    </div>
  );
}
