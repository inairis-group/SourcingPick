// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Services.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/services.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { services as content } from "../../content/services";

export function ServicesBoard({ lang }: { lang: Locale }) {
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
              <div className="sp-hero-figure" style={{ "flexShrink": "0", "width": "440px", "height": "380px", "borderRadius": "28px", "background": "#EEF3FF", "border": "1px solid #DCE3F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                <img src="/design/consolidated-pallet.svg" alt={t[3]} style={{ "width": "400px", "height": "340px", "objectFit": "contain", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "calc(8px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(96px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "28px" }}>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/truck-unloading.svg" alt={t[4]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[5]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[2][lang]}>{t[6]}</span>
                  </div>
                  <h2 style={s[3][lang]}>{t[7]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[8]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[4][lang]}>{t[9]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[10]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[11]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[12]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[5][lang]}>{t[13]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[14]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[15]}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/carton-inspection.svg" alt={t[16]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[17]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[6][lang]}>{t[18]}</span>
                  </div>
                  <h2 style={s[7][lang]}>{t[19]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[20]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[8][lang]}>{t[21]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[22]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[23]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[24]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[9][lang]}>{t[25]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[26]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[27]}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/consolidated-pallet.svg" alt={t[28]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[29]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[10][lang]}>{t[30]}</span>
                  </div>
                  <h2 style={s[11][lang]}>{t[31]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[32]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[12][lang]}>{t[33]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[34]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[35]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[36]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[13][lang]}>{t[37]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[38]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[39]}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/wooden-crate.svg" alt={t[40]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[41]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[14][lang]}>{t[42]}</span>
                  </div>
                  <h2 style={s[15][lang]}>{t[43]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[44]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[16][lang]}>{t[45]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[46]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[47]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[48]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[17][lang]}>{t[49]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[50]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[51]}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/forklift-loading.svg" alt={t[52]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[53]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[18][lang]}>{t[54]}</span>
                  </div>
                  <h2 style={s[19][lang]}>{t[55]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[56]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[20][lang]}>{t[57]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[58]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[59]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[60]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[21][lang]}>{t[61]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[62]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[63]}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              <article className="sp-step-card" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", "gap": "var(--sp-gap-48, 48px)", "alignItems": "stretch", "padding": "var(--sp-pad-32, 32px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px" }}>
                <div style={{ "borderRadius": "20px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "minHeight": "300px" }}>
                  <img src="/design/container-ship.svg" alt={t[64]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "justifyContent": "center", "padding": "8px 8px 8px 0" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[65]}
                    </span>
                    <span style={{ "height": "1px", "width": "40px", "background": "#DCE3F2" }} />
                    <span style={s[22][lang]}>{t[66]}</span>
                  </div>
                  <h2 style={s[23][lang]}>{t[67]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[68]}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "28px", "paddingTop": "6px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[24][lang]}>{t[69]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[70]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[71]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          <span>{t[72]}</span>
                        </li>
                      </ul>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <span style={s[25][lang]}>{t[73]}</span>
                      <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                          </span>
                          <span>{t[74]}</span>
                        </li>
                        <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "8px", "alignItems": "center", "justifyContent": "center", "background": "#EAF1FF" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 3h8l4 4v14H6z" />
                              <path d="M14 3v4h4" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{t[75]}</span>
                        </li>
                      </ul>
                      <div style={{ "marginTop": "4px", "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "15px", "color": "#4A5578" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 21V4" />
                          <path d="M5 4h11l-2 4 2 4H5" />
                        </svg>
                        {t[76]}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </section>
            <section style={{ "background": "#0B1433", "padding": "calc(96px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(96px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "var(--sp-gap-40, 40px)" }}>
              <div className="sp-two-track" style={{ "display": "flex", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "var(--sp-gap-48, 48px)" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "maxWidth": "760px" }}>
                  <div style={s[26][lang]}>{t[77]}</div>
                  <h2 style={s[27][lang]}>{t[78]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                    {t[79]}
                  </p>
                </div>
                <img src="/design/picky-factory-visit.svg" alt="" style={{ "width": "240px", "height": "auto", "flexShrink": "0", "maxWidth": "100%" }} />
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r4, repeat(4, minmax(0, 1fr)))", "gap": "18px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-24, 24px)", "borderRadius": "20px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600" }}>
                    {t[80]}
                  </span>
                  <h3 style={s[28][lang]}>{t[81]}</h3>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#C3CDEB" }}>
                    {t[82]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-24, 24px)", "borderRadius": "20px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600" }}>
                    {t[83]}
                  </span>
                  <h3 style={s[29][lang]}>{t[84]}</h3>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#C3CDEB" }}>
                    {t[85]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-24, 24px)", "borderRadius": "20px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600" }}>
                    {t[86]}
                  </span>
                  <h3 style={s[30][lang]}>{t[87]}</h3>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#C3CDEB" }}>
                    {t[88]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-24, 24px)", "borderRadius": "20px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600" }}>
                    {t[89]}
                  </span>
                  <h3 style={s[31][lang]}>{t[90]}</h3>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#C3CDEB" }}>
                    {t[91]}
                  </p>
                </div>
              </div>
              <div>
                <Link href={sitePath(lang, "/pricing#remuneration")} style={s[32][lang]}>
                  <span>{t[92]}</span>
                  <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={v[1][lang]} />
                      <path d={v[2][lang]} />
                    </svg>
                  </span>
                </Link>
              </div>
            </section>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "32px", "padding": "var(--sp-pad-28-32, 28px 32px)", "border": "1.5px dashed #B7C5E6", "borderRadius": "24px" }}>
                <img src="/design/train-plane-sketch.svg" alt={t[93]} style={{ "width": "150px", "height": "auto", "flexShrink": "0", "maxWidth": "100%" }} />
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <h3 style={s[33][lang]}>{t[94]}</h3>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[95]}
                  </p>
                </div>
              </div>
            </section>
            <section style={{ "padding": "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-cta-band" style={{ "position": "relative", "overflow": "hidden", "borderRadius": "32px", "background": "#155DFC", "padding": "var(--sp-pad-72, 72px)", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)", "color": "#FFFFFF" }}>
                <div style={{ "position": "absolute", "inset": "0", "backgroundImage": "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", "backgroundSize": "44px 25.4px" }} />
                <div style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "700px" }}>
                  <h2 style={s[34][lang]}>{t[96]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[97]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <a href={sitePath(lang, "/devis")} style={s[35][lang]}>
                      <span>{t[98]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[3][lang]} />
                          <path d={v[4][lang]} />
                        </svg>
                      </span>
                    </a>
                    <a href="mailto:contact@sourcingpick.com" style={s[36][lang]}>
                      <span><span dir="ltr">{t[99]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={s[37][lang]}>{t[100]}</div>
                  <img src="/design/picky-arms-up.svg" alt={t[101]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
