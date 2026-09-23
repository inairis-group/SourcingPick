// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-404.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/notFound.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { notFound as content } from "../../content/notFound";

export function NotFoundBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;

  return (
    <>
            <section style={{ "padding": "calc(96px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(120px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-440, minmax(0, 1fr) 440px)", "gap": "var(--sp-gap-48, 48px)", "alignItems": "center" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                  {t[0]}
                </span>
                <h1 style={s[0][lang]}>{t[1]}</h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[2]}
                </p>
                <div style={{ "display": "flex", "gap": "14px", "flexWrap": "wrap" }}>
                  <Link href={`/${lang}`} style={s[1][lang]}>
                    <span>{t[3]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 11l8-7 8 7v9H4z" />
                        <path d="M10 20v-5h4v5" />
                      </svg>
                    </span>
                  </Link>
                  <Link href={`/${lang}/devis`} style={s[2][lang]}><span>{t[4]}</span></Link>
                </div>
              </div>
              <div className="sp-hero-figure" style={{ "position": "relative", "width": "440px", "height": "440px", "borderRadius": "50%", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                <span className="sp-404-numeral" style={s[3][lang]}>{t[5]}</span>
                <img src="/design/picky-loupe.svg" alt={t[6]} style={{ "width": "340px", "height": "auto", "maxWidth": "100%" }} />
              </div>
            </section>
    </>
  );
}
