// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Application.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/app.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { app as content } from "../../content/app";
import { SubmitButton } from "../../form-controls";

export function AppBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(24px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-640, minmax(0, 1fr) 640px)", "gap": "var(--sp-gap-40, 40px)", "alignItems": "center" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "24px" }}>
                <div style={s[0][lang]}>{t[0]}</div>
                <h1 style={s[1][lang]}>{t[1]}</h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[2]}
                </p>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap" }}>
                  <Link href={`/${lang}/application`} data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "0 20px", "borderRadius": "14px", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v12" />
                      <path d="M7 11l5 5 5-5" />
                      <path d="M4 20h16" />
                    </svg>
                    <span style={{ "display": "flex", "flexDirection": "column" }}>
                      <span style={{ "fontSize": "11.5px", "color": "#B8C4E6" }}>
                        {t[3]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }} dir="ltr">
                        {t[4]}
                      </span>
                    </span>
                  </Link>
                  <Link href={`/${lang}/application`} data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "0 20px", "borderRadius": "14px", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v12" />
                      <path d="M7 11l5 5 5-5" />
                      <path d="M4 20h16" />
                    </svg>
                    <span style={{ "display": "flex", "flexDirection": "column" }}>
                      <span style={{ "fontSize": "11.5px", "color": "#B8C4E6" }}>
                        {t[5]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }} dir="ltr">
                        {t[6]}
                      </span>
                    </span>
                  </Link>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "fontSize": "14px", "color": "#4A5578" }}>
                    <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "5px 10px", "borderRadius": "999px", "background": "#FFF1CC", "color": "#7A4E00", "fontWeight": "600" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                      {t[7]}
                    </span>
                    <span dir="ltr">{t[8]}</span>
                  </span>
                </div>
              </div>
              <div className="sp-phone-stage" style={{ "position": "relative", "height": "700px" }}>
                <div style={s[2][lang]}>
                  <div style={{ "width": "300px", "height": "620px", "boxSizing": "border-box", "padding": "10px", "borderRadius": "46px", "background": "#0E1A3D", "boxShadow": "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763" }}>
                    <div style={{ "width": "100%", "height": "100%", "borderRadius": "37px", "background": "#FFFFFF", "overflow": "hidden", "display": "flex", "flexDirection": "column" }}>
                      <div style={{ "padding": "var(--sp-pad-44-20-0, 44px 20px 0)", "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                        <span aria-label={t[9]} style={{ "display": "inline-flex", "width": "36px", "height": "36px", "borderRadius": "12px", "background": "#F5F7FC", "alignItems": "center", "justifyContent": "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={v[0][lang]} />
                            <path d={v[1][lang]} />
                          </svg>
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "600" }}>
                          {t[10]}
                        </span>
                        <span aria-label={t[11]} style={{ "display": "inline-flex", "width": "36px", "height": "36px", "borderRadius": "12px", "background": "#F5F7FC", "alignItems": "center", "justifyContent": "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                            <path d="M10 20a2 2 0 004 0" />
                          </svg>
                        </span>
                      </div>
                      <div style={{ "padding": "16px 20px 0", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                        <div style={{ "padding": "16px", "borderRadius": "18px", "background": "#162456", "color": "#FFFFFF", "display": "flex", "flexDirection": "column", "gap": "6px" }}>
                          <span style={s[3][lang]}>{t[12]}</span>
                          <span style={s[4][lang]}>{t[13]}</span>
                          <span style={{ "fontSize": "12.5px", "color": "#C3CDEB" }}>
                            {t[14]}
                          </span>
                        </div>
                        <div style={{ "display": "flex", "flexDirection": "column" }}>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[15]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[16]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[17]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[18]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#FFFFFF", "border": "2.5px solid #155DFC", "boxSizing": "border-box", "boxShadow": "0 0 0 4px #EAF1FF" }} />
                            <span style={{ "fontSize": "13.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                              {t[19]}
                            </span>
                            <span style={s[5][lang]}>{t[20]}</span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#F5F7FC", "border": "2px solid #DCE3F2", "boxSizing": "border-box" }} />
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#6B7596" }}>
                              {t[21]}
                            </span>
                          </div>
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "8px", "minHeight": "46px", "padding": "0 10px", "borderRadius": "14px", "background": "#155DFC", "color": "#FFFFFF", "fontSize": "13.5px", "fontWeight": "600", "textAlign": "center" }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.5" />
                          </svg>
                          {t[22]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={s[6][lang]}>
                  <div style={{ "width": "300px", "height": "620px", "boxSizing": "border-box", "padding": "10px", "borderRadius": "46px", "background": "#0E1A3D", "boxShadow": "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763" }}>
                    <div style={{ "width": "100%", "height": "100%", "borderRadius": "37px", "background": "#FFFFFF", "overflow": "hidden", "display": "flex", "flexDirection": "column" }}>
                      <div style={{ "padding": "var(--sp-pad-44-20-0, 44px 20px 0)", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={s[7][lang]}>{t[23]}</span>
                        <span style={s[8][lang]}>{t[24]}</span>
                      </div>
                      <div style={{ "padding": "14px 20px 0", "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "8px" }}>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/truck-unloading.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[9][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[25]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/carton-inspection.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[10][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[26]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/wooden-crate.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[11][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[27]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/forklift-loading.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[12][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[28]}
                          </span>
                        </div>
                      </div>
                      <div style={{ "padding": "16px 20px 0", "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13px", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "20px", "height": "20px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          {t[29]}
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13px", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "20px", "height": "20px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          {t[30]}
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13px", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "20px", "height": "20px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFF1CC" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3.5 2" />
                            </svg>
                          </span>
                          {t[31]}
                        </div>
                      </div>
                      <div style={{ "padding": "16px 20px 0" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px", "borderRadius": "14px", "background": "#F5F7FC" }}>
                          <img src="/design/spot-1.svg" alt="" style={{ "width": "34px", "height": "auto", "flexShrink": "0", "maxWidth": "100%" }} />
                          <span style={{ "fontSize": "12.5px", "lineHeight": "1.4", "color": "#4A5578" }}>
                            {t[32]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <img src="/design/spot-2.svg" alt="" style={{ "position": "absolute", "left": "238px", "top": "548px", "width": "150px", "height": "auto", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "32px" }}>
              <h2 style={s[13][lang]}>{t[33]}</h2>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", "gap": "22px 28px" }}>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3h8l4 4v14H6z" />
                      <path d="M14 3v4h4" />
                      <path d="M9 13h6" />
                      <path d="M9 17h6" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[34]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[35]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 20h16" />
                      <path d="M14.5 4.5l5 5L9 20H4v-5z" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[36]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[37]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="6" width="18" height="13" rx="2" />
                      <path d="M3 10h18" />
                      <path d="M7 15h4" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[38]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[39]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[40]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[41]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 5h16v11H9l-5 4z" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[42]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[43]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[44]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[45]}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
              <div style={{ "padding": "var(--sp-pad-44, 44px)", "borderRadius": "28px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "display": "flex", "flexDirection": "column", "gap": "28px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                  <h2 style={s[14][lang]}>{t[46]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "720px" }}>
                    {t[47]}
                  </p>
                </div>
                <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r4, repeat(4, minmax(0, 1fr)))", "gap": "22px 28px" }}>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="4" width="7" height="7" rx="1" />
                        <rect x="13" y="4" width="7" height="7" rx="1" />
                        <rect x="4" y="13" width="7" height="7" rx="1" />
                        <rect x="13" y="13" width="7" height="7" rx="1" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[48]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[49]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 20h16" />
                        <path d="M14.5 4.5l5 5L9 20H4v-5z" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[50]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[51]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.5 3.5 0 015 5L10 17.5a2 2 0 01-3-3l7.5-7.5" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[52]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[53]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "42px", "height": "42px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 21V4" />
                        <path d="M5 4h11l-2 4 2 4H5" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[54]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[55]}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <a href="/connexion" style={s[15][lang]}>
                    <span>{t[56]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={v[2][lang]} />
                        <path d={v[3][lang]} />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </section>
            <section style={{ "background": "#155DFC", "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-520, minmax(0, 1fr) 520px)", "gap": "var(--sp-gap-56, 56px)", "alignItems": "center", "color": "#FFFFFF" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                <h2 style={s[16][lang]}>{t[57]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                  {t[58]}
                </p>
                <img src="/design/spot-3.svg" alt="" style={{ "width": "200px", "height": "auto", "maxWidth": "100%" }} />
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "16px 18px", "borderRadius": "20px", "background": "rgba(255,255,255,0.92)", "boxShadow": "0 16px 36px -20px rgba(14,26,61,0.45)" }}>
                  <img src="/design/spot-4.svg" alt="" style={{ "width": "40px", "height": "auto", "borderRadius": "10px", "flexShrink": "0", "maxWidth": "100%" }} />
                  <div style={{ "flex": "1", "display": "flex", "flexDirection": "column", "gap": "3px", "minWidth": "0" }}>
                    <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "10px" }}>
                      <span style={{ "fontSize": "12.5px", "fontWeight": "600", "color": "#4A5578" }}>
                        {t[59]}
                      </span>
                      <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                        {t[60]}
                      </span>
                    </div>
                    <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[61]}
                    </span>
                    <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#4A5578" }}>
                      {t[62]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "16px 18px", "borderRadius": "20px", "background": "rgba(255,255,255,0.92)", "boxShadow": "0 16px 36px -20px rgba(14,26,61,0.45)" }}>
                  <img src="/design/spot-4.svg" alt="" style={{ "width": "40px", "height": "auto", "borderRadius": "10px", "flexShrink": "0", "maxWidth": "100%" }} />
                  <div style={{ "flex": "1", "display": "flex", "flexDirection": "column", "gap": "3px", "minWidth": "0" }}>
                    <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "10px" }}>
                      <span style={{ "fontSize": "12.5px", "fontWeight": "600", "color": "#4A5578" }}>
                        {t[63]}
                      </span>
                      <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                        {t[64]}
                      </span>
                    </div>
                    <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[65]}
                    </span>
                    <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#4A5578" }}>
                      {t[66]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "16px 18px", "borderRadius": "20px", "background": "rgba(255,255,255,0.92)", "boxShadow": "0 16px 36px -20px rgba(14,26,61,0.45)" }}>
                  <img src="/design/spot-4.svg" alt="" style={{ "width": "40px", "height": "auto", "borderRadius": "10px", "flexShrink": "0", "maxWidth": "100%" }} />
                  <div style={{ "flex": "1", "display": "flex", "flexDirection": "column", "gap": "3px", "minWidth": "0" }}>
                    <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "10px" }}>
                      <span style={{ "fontSize": "12.5px", "fontWeight": "600", "color": "#4A5578" }}>
                        {t[67]}
                      </span>
                      <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                        {t[68]}
                      </span>
                    </div>
                    <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[69]}
                    </span>
                    <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#4A5578" }}>
                      {t[70]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "16px 18px", "borderRadius": "20px", "background": "rgba(255,255,255,0.92)", "boxShadow": "0 16px 36px -20px rgba(14,26,61,0.45)" }}>
                  <img src="/design/spot-4.svg" alt="" style={{ "width": "40px", "height": "auto", "borderRadius": "10px", "flexShrink": "0", "maxWidth": "100%" }} />
                  <div style={{ "flex": "1", "display": "flex", "flexDirection": "column", "gap": "3px", "minWidth": "0" }}>
                    <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "10px" }}>
                      <span style={{ "fontSize": "12.5px", "fontWeight": "600", "color": "#4A5578" }}>
                        {t[71]}
                      </span>
                      <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                        {t[72]}
                      </span>
                    </div>
                    <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[73]}
                    </span>
                    <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#4A5578" }}>
                      {t[74]}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-120-fr-420, 120px minmax(0, 1fr) 420px)", "gap": "32px", "alignItems": "center", "padding": "var(--sp-pad-40-44, 40px 44px)", "borderRadius": "28px", "background": "#EAF1FF", "border": "1px solid #DCE3F2" }}>
                <div style={{ "position": "relative", "width": "120px", "height": "120px" }}>
                  <img src="/design/spot-4.svg" alt="" style={{ "width": "104px", "height": "auto", "maxWidth": "100%" }} />
                  <span style={s[17][lang]}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3.5 2" />
                    </svg>
                    {t[75]}
                  </span>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                  <h2 style={s[18][lang]}>{t[76]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[77]}
                  </p>
                  <p style={{ "margin": "0", "fontSize": "15px", "color": "#4A5578" }}>
                    {t[78]}
                  </p>
                </div>
                <form style={{ "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <label style={{ "display": "flex", "flexDirection": "column", "gap": "8px", "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                    <span>{t[79]}</span>
                    <input type="email" placeholder={t[80]} style={s[19][lang]} />
                  </label>
                  <SubmitButton data-pk="inert" style={s[20][lang]}>
                    <span>{t[81]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                    </span>
                  </SubmitButton>
                </form>
              </div>
            </section>
    </>
  );
}
