// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Confidentialite.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/privacy.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { privacy as content } from "../../content/privacy";

export function PrivacyBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-64, 64px)", "alignItems": "start" }}>
              <nav aria-label={t[0]} style={{ "display": "flex", "flexDirection": "column", "gap": "4px", "padding": "10px", "borderRadius": "20px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                <Link href={`/${lang}/legal/mentions-legales`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[1]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[0][lang]} />
                  </svg>
                </Link>
                <Link href={`/${lang}/legal/privacy`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                  {t[2]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[1][lang]} />
                  </svg>
                </Link>
                <Link href={`/${lang}/legal/cookies`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[3]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[2][lang]} />
                  </svg>
                </Link>
                <Link href={`/${lang}/legal/terms`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[4]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[3][lang]} />
                  </svg>
                </Link>
              </nav>
              <article style={{ "display": "flex", "flexDirection": "column", "gap": "30px", "maxWidth": "820px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <span className="sp-placeholder" style={s[0][lang]}>{t[5]}</span>
                  <h1 style={s[1][lang]}>{t[6]}</h1>
                  <p style={{ "margin": "0", "fontSize": "15px", "color": "#4A5578" }}>
                    {t[7]}{" "}
                    <span className="sp-placeholder" style={s[2][lang]}>{t[8]}</span>
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[3][lang]}>{t[9]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      <span className="sp-placeholder" style={s[4][lang]}>{t[10]}</span>
                      {t[11]}{" "}
                      <span className="sp-placeholder" style={s[5][lang]}>{t[12]}</span>
                      {t[13]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[6][lang]}>{t[14]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[15]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[16]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[17]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[18]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[19]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[7][lang]}>{t[20]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[21]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[22]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[23]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[24]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[8][lang]}>{t[25]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      <span className="sp-placeholder" style={s[9][lang]}>{t[26]}</span>
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[10][lang]}>{t[27]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[28]}{" "}
                      <span className="sp-placeholder" style={s[11][lang]}>{t[29]}</span>
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[12][lang]}>{t[30]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[31]}{" "}
                      <span className="sp-placeholder" style={s[13][lang]}>{t[32]}</span>
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[14][lang]}>{t[33]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[34]}{" "}
                      <span className="sp-placeholder" style={s[15][lang]}>{t[35]}</span>
                      {t[36]}
                    </li>
                  </ul>
                </div>
              </article>
            </section>
    </>
  );
}
