// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Mentions-legales.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/legal.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { legal as content } from "../../content/legal";

export function LegalBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-64, 64px)", "alignItems": "start" }}>
              <nav aria-label={t[0]} style={{ "display": "flex", "flexDirection": "column", "gap": "4px", "padding": "10px", "borderRadius": "20px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                <Link href={sitePath(lang, "/legal/mentions-legales")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                  {t[1]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[0][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/privacy")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[2]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[1][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/cookies")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[3]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[2][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/terms")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[4]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[3][lang]} />
                  </svg>
                </Link>
              </nav>
              <article style={{ "display": "flex", "flexDirection": "column", "gap": "30px", "maxWidth": "820px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <h1 style={s[0][lang]}>{t[5]}</h1>
                  <p style={{ "margin": "0", "fontSize": "15px", "color": "#4A5578" }}>
                    {t[6]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[1][lang]}>{t[7]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[8]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[9]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[10]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[11]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[12]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[13]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[2][lang]}>{t[14]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[15]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[16]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[3][lang]}>{t[17]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[18]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[4][lang]}>{t[19]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[20]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[5][lang]}>{t[21]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[22]}{" "}
                      <Link href={sitePath(lang, "/legal/privacy")} style={{ "fontWeight": "600" }}>
                        {t[23]}
                      </Link>
                      {t[24]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[6][lang]}>{t[25]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[26]}{" "}
                      <Link href={sitePath(lang, "/legal/cookies")} style={{ "fontWeight": "600" }}>
                        {t[27]}
                      </Link>
                      {t[28]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[7][lang]}>{t[29]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[30]}{" "}
                      <Link href={sitePath(lang, "/legal/terms")} style={{ "fontWeight": "600" }}>
                        {t[31]}
                      </Link>
                      {t[32]}
                    </li>
                  </ul>
                </div>
              </article>
            </section>
    </>
  );
}
