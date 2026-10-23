// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-CGV.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/terms.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { terms as content } from "../../content/terms";

export function TermsBoard({ lang }: { lang: Locale }) {
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
                <Link href={`/${lang}/legal/privacy`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[2]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[1][lang]} />
                  </svg>
                </Link>
                <Link href={`/${lang}/legal/cookies`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[3]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[2][lang]} />
                  </svg>
                </Link>
                <Link href={`/${lang}/legal/terms`} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                  {t[4]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.65", "color": "#0E1A3D" }}>
                    {t[7]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[1][lang]}>{t[8]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
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
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[2][lang]}>{t[13]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[14]}
                    </li>
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
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[3][lang]}>{t[19]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[20]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[21]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[22]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[23]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[4][lang]}>{t[24]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[25]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[26]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[27]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[28]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[29]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[5][lang]}>{t[30]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[31]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[32]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[33]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[34]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[35]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[6][lang]}>{t[36]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[37]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[38]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[39]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[40]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[7][lang]}>{t[41]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[42]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[43]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[44]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[45]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[8][lang]}>{t[46]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[47]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[48]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[49]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[50]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[9][lang]}>{t[51]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[52]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[53]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[54]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[55]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[10][lang]}>{t[56]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[57]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[58]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[59]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[60]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[11][lang]}>{t[61]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[62]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[63]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[64]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[12][lang]}>{t[65]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[66]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[67]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[68]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[69]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[13][lang]}>{t[70]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[71]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[72]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[73]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[74]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[14][lang]}>{t[75]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[76]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[77]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[78]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[15][lang]}>{t[79]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[80]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[81]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[82]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[16][lang]}>{t[83]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[84]}{" "}
                      <Link href={`/${lang}/legal/privacy`} style={{ "fontWeight": "600" }}>
                        {t[85]}
                      </Link>
                      {t[86]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[87]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[17][lang]}>{t[88]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[89]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[90]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[18][lang]}>{t[91]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[92]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[93]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[94]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[19][lang]}>{t[95]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[96]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[97]}
                    </li>
                  </ul>
                </div>
              </article>
            </section>
    </>
  );
}
