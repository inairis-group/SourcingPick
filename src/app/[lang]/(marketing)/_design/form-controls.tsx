"use client";

import { useFormStatus } from "react-dom";
import { cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { countriesFor } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/config";

/**
 * Controls that stand in for something the canvas could draw but not operate.
 *
 * Both keep the artboard's inline styles — they arrive as props from the
 * transcribed markup and are applied unchanged — so nothing here decides what
 * anything looks like.
 */

/**
 * The submit control.
 *
 * The canvas draws it as a link, because a picture has nothing to submit. The
 * porter turns any anchor the route map resolved to nothing into one of these
 * (see emit.py), so this is generic: it is not the quote form's button, it is
 * the button for any transcribed form.
 *
 * Disabled while the action runs, which is also the only thing standing
 * between an impatient visitor and three identical quote requests.
 */
export function SubmitButton({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        ...style,
        border: style?.border ?? "none",
        cursor: pending ? "progress" : "pointer",
        opacity: pending ? 0.7 : 1,
        // The canvas draws the button as an <a>, which has no font
        // inheritance problem; a <button> does.
        font: "inherit",
        fontFamily: style?.fontFamily,
        fontSize: style?.fontSize,
        fontWeight: style?.fontWeight,
        transition: "opacity var(--duration-fast) var(--ease-default)",
      }}
    >
      {children}
    </button>
  );
}

/**
 * The destination country.
 *
 * The artboard draws a select with one option in it — a placeholder — because
 * drawing 249 would be absurd. The list is the app's existing ISO 3166 one,
 * localised by `Intl.DisplayNames`, so no country names are shipped as
 * translations. The placeholder keeps the designer's wording, passed through
 * as the transcribed child.
 */
export function CountrySelect({
  lang,
  style,
  children,
  ...rest
}: {
  lang: Locale;
  style?: CSSProperties;
  children?: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  // The transcribed child *is* the placeholder <option>; wrapping it in
  // another one put an <option> inside an <option> and broke hydration. It is
  // cloned instead, so the designer's wording survives and the option gains
  // the empty value that makes "nothing chosen" mean nothing chosen rather
  // than a country named after the prompt.
  const placeholder = isValidElement(children)
    ? cloneElement(children as ReactElement<{ value?: string }>, { value: "" })
    : children;

  return (
    <select {...rest} style={style} defaultValue="">
      {placeholder}
      {countriesFor(lang).map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
