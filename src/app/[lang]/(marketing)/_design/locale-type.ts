import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";

/**
 * Chinese and Arabic typography for the pages written by hand in the canvas's
 * style (the SEO pack's article frame, the CBM simulator).
 *
 * The canvas's designer set Chinese and Arabic differently from the Latin
 * languages, the same way on every artboard, and the porter applies those
 * rules to the boards it generates (scripts/design/localize.py). This is the
 * same set of rules for inline styles: the display, mono and body faces
 * become the locale's face (the mono one stays on figures), no capitals and
 * no tracking, display line heights open to 1.3, the 12.5px mono labels go
 * to 13.5px, and Chinese display headings go from 600 to 700.
 */

export const DISPLAY = "'Unbounded', 'Trebuchet MS', sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace";
export const BODY = "'Onest', 'Segoe UI', system-ui, sans-serif";

const FACES: Partial<Record<Locale, string>> = {
  zh: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  ar: "'Readex Pro', 'Segoe UI', Tahoma, sans-serif",
};

export function localType(
  lang: Locale,
  style: CSSProperties,
  { figures = false }: { figures?: boolean } = {},
): CSSProperties {
  const face = FACES[lang];
  if (!face) return style;
  const family = style.fontFamily;
  const keepMono = family === MONO && figures;
  const out: CSSProperties = { ...style };
  if ((family === DISPLAY || family === MONO || family === BODY) && !keepMono) out.fontFamily = face;
  if (out.textTransform === "uppercase") out.textTransform = "none";
  if (out.letterSpacing !== undefined && out.letterSpacing !== 0 && out.letterSpacing !== "0") out.letterSpacing = 0;
  if (family === DISPLAY && typeof out.lineHeight === "number" && out.lineHeight < 1.3) out.lineHeight = 1.3;
  if (family === MONO && !keepMono && out.fontSize === "12.5px") out.fontSize = "13.5px";
  if (lang === "zh" && family === DISPLAY && (out.fontWeight === 600 || out.fontWeight === "600")) out.fontWeight = 700;
  return out;
}

/** The arrow of a button, pointing the way the language reads. */
export const ARROW_PATHS: Record<"ltr" | "rtl", readonly [string, string]> = {
  ltr: ["M5 12h14", "M13 6l6 6-6 6"],
  rtl: ["M19 12H5", "M11 6l-6 6 6 6"],
};
