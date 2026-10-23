// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Comment-ca-marche.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/howItWorks.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { howItWorks as content } from "../../content/howItWorks";

export function HowItWorksBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section className="sp-two-track" style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "760px" }}>
                <div style={s[0][lang]}>{t[0]}</div>
                <h1 style={s[1][lang]}>{t[1]}</h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "680px", "textWrap": "pretty" }}>
                  {t[2]}
                </p>
              </div>
              <div className="sp-hero-figure" style={{ "flexShrink": "0", "width": "420px", "height": "360px", "borderRadius": "28px", "background": "#EEF3FF", "border": "1px solid #DCE3F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                <img src="/design/forklift-loading.svg" alt={t[3]} style={{ "width": "380px", "height": "320px", "objectFit": "contain", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "calc(8px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "18px" }}>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[4]}
                </span>
                <h2 style={s[2][lang]}>{t[5]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[3][lang]}>{t[6]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[7]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[4][lang]}>{t[8]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[9]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[5][lang]}>{t[10]}</span>
                  <span style={s[6][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[11]}
                  </span>
                </div>
              </article>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[12]}
                </span>
                <h2 style={s[7][lang]}>{t[13]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[8][lang]}>{t[14]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[15]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[9][lang]}>{t[16]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[17]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[10][lang]}>{t[18]}</span>
                  <span style={s[11][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[19]}
                  </span>
                </div>
              </article>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[20]}
                </span>
                <h2 style={s[12][lang]}>{t[21]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[13][lang]}>{t[22]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[23]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[14][lang]}>{t[24]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[25]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[15][lang]}>{t[26]}</span>
                  <span style={s[16][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[27]}
                  </span>
                </div>
              </article>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[28]}
                </span>
                <h2 style={s[17][lang]}>{t[29]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[18][lang]}>{t[30]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[31]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[19][lang]}>{t[32]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[33]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[20][lang]}>{t[34]}</span>
                  <span style={s[21][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[35]}
                  </span>
                </div>
              </article>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[36]}
                </span>
                <h2 style={s[22][lang]}>{t[37]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[23][lang]}>{t[38]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[39]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[24][lang]}>{t[40]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[41]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[25][lang]}>{t[42]}</span>
                  <span style={s[26][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[43]}
                  </span>
                </div>
              </article>
              <article className="sp-how-row" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-76-1_1fr-fr-fr-230, 76px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 230px)", "gap": "28px", "alignItems": "start", "padding": "var(--sp-pad-30-32, 30px 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "18px", "background": "#162456", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600" }}>
                  {t[44]}
                </span>
                <h2 style={s[27][lang]}>{t[45]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[28][lang]}>{t[46]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#0E1A3D" }}>
                    {t[47]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={s[29][lang]}>{t[48]}</span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[49]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px", "borderRadius": "16px", "background": "#F5F7FC" }}>
                  <span style={s[30][lang]}>{t[50]}</span>
                  <span style={s[31][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F47C9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                    {t[51]}
                  </span>
                </div>
              </article>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px" }}>
              <div style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                <h2 style={s[32][lang]}>{t[52]}</h2>
                <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[53]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[54]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[55]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[56]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[57]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ "background": "#162456", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "22px", "color": "#FFFFFF" }}>
                <h2 style={s[33][lang]}>{t[58]}</h2>
                <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                        <circle cx="12" cy="9.5" r="2.5" />
                      </svg>
                    </span>
                    <span>{t[59]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
                        <path d="M4 7.5l8 4.5 8-4.5" />
                        <path d="M12 12v9" />
                      </svg>
                    </span>
                    <span>{t[60]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                    </span>
                    <span>{t[61]}</span>
                  </li>
                </ul>
                <img src="/design/spot-5.svg" alt="" style={{ "width": "150px", "height": "auto", "alignSelf": "flex-end", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-cta-band" style={{ "position": "relative", "overflow": "hidden", "borderRadius": "32px", "background": "#155DFC", "padding": "var(--sp-pad-72, 72px)", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)", "color": "#FFFFFF" }}>
                <div style={{ "position": "absolute", "inset": "0", "backgroundImage": "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", "backgroundSize": "44px 25.4px" }} />
                <div style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "700px" }}>
                  <h2 style={s[34][lang]}>{t[62]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[63]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <Link href={`/${lang}/devis`} style={s[35][lang]}>
                      <span>{t[64]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[0][lang]} />
                          <path d={v[1][lang]} />
                        </svg>
                      </span>
                    </Link>
                    <a href="mailto:contact@sourcingpick.com" style={s[36][lang]}>
                      <span><span dir="ltr">{t[65]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={s[37][lang]}>{t[66]}</div>
                  <img src="/design/picky-arms-up.svg" alt={t[67]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
