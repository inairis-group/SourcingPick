// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Accueil.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/home.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { home as content } from "../../content/home";
import { Disclosure } from "../../disclosure";

export function HomeBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section className="sp-hero" style={{ "position": "relative", "minHeight": "740px", "padding": "0 var(--sp-gutter, 120px) calc(60px * var(--sp-vs, 1))", "boxSizing": "border-box", "overflow": "hidden" }}>
              <div style={s[0][lang]} />
              <div className="sp-hero-copy" style={{ "position": "relative", "zIndex": "2", "width": "580px", "paddingTop": "92px", "display": "flex", "flexDirection": "column", "gap": "26px" }}>
                <div style={s[1][lang]}>{t[0]}</div>
                <h1 style={s[2][lang]}>
                  {t[1]}{" "}
                  <span style={{ "background": "linear-gradient(transparent 60%, #FFC247 60%, #FFC247 90%, transparent 90%)" }}>
                    {t[2]}
                  </span>
                  {" "}{t[3]}
                </h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "540px", "textWrap": "pretty" }}>
                  {t[4]}
                </p>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "flexWrap": "wrap" }}>
                  <Link href={`/${lang}/devis`} style={s[3][lang]}>
                    <span>{t[5]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={v[0][lang]} />
                        <path d={v[1][lang]} />
                      </svg>
                    </span>
                  </Link>
                  <Link href={`/${lang}#etapes`} style={s[4][lang]}><span>{t[6]}</span></Link>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "6px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "14.5px", "color": "#4A5578" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                        <circle cx="12" cy="9.5" r="2.5" />
                      </svg>
                    </span>
                    {t[7]}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "14.5px", "color": "#4A5578" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="8" r="3.5" />
                        <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
                        <path d="M16 4.8a3.5 3.5 0 010 6.4" />
                        <path d="M18 14.8c1.8.8 3 2.6 3.5 5.2" />
                      </svg>
                    </span>
                    {t[8]}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "14.5px", "color": "#4A5578" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 21V4" />
                        <path d="M5 4h11l-2 4 2 4H5" />
                      </svg>
                    </span>
                    {t[9]}
                  </div>
                </div>
              </div>
              <div className="sp-hero-art" dir="ltr" style={s[5][lang]}>
                <img src="/design/hero-warehouse-quay-ship.svg" alt={t[10]} style={{ "width": "800px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                <div className="sp-hero-label" dir={v[2][lang]} style={{ "position": "absolute", "left": "96px", "top": "64px", "display": "flex", "alignItems": "center", "gap": "8px", "padding": "8px 12px 8px 8px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "12px", "boxShadow": "0 10px 24px -12px rgba(14,26,61,0.35)", "fontSize": "13px", "fontWeight": "600", "color": "#0E1A3D", "whiteSpace": "nowrap" }}>
                  <span style={{ "display": "inline-flex", "width": "26px", "height": "26px", "borderRadius": "8px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
                      <path d="M4 7.5l8 4.5 8-4.5" />
                      <path d="M12 12v9" />
                    </svg>
                  </span>
                  {t[11]}
                </div>
                <div className="sp-hero-label" dir={v[3][lang]} style={{ "position": "absolute", "left": "430px", "top": "86px", "display": "flex", "alignItems": "center", "gap": "8px", "padding": "8px 12px 8px 8px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "12px", "boxShadow": "0 10px 24px -12px rgba(14,26,61,0.35)", "fontSize": "13px", "fontWeight": "600", "color": "#0E1A3D", "whiteSpace": "nowrap" }}>
                  <span style={{ "display": "inline-flex", "width": "26px", "height": "26px", "borderRadius": "8px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 16l2 4h14l2-4z" />
                      <path d="M6 16V9h12v7" />
                      <path d="M10 9V5h4v4" />
                    </svg>
                  </span>
                  {t[12]}
                </div>
                <div className="sp-hero-label" dir={v[4][lang]} style={{ "position": "absolute", "right": "52px", "top": "76px", "display": "flex", "alignItems": "center", "gap": "8px", "padding": "8px 12px 8px 8px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "12px", "boxShadow": "0 10px 24px -12px rgba(14,26,61,0.35)", "fontSize": "13px", "fontWeight": "600", "color": "#0E1A3D", "whiteSpace": "nowrap" }}>
                  <span style={{ "display": "inline-flex", "width": "26px", "height": "26px", "borderRadius": "8px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 21V4" />
                      <path d="M5 4h11l-2 4 2 4H5" />
                    </svg>
                  </span>
                  {t[13]}
                </div>
              </div>
            </section>
            <section id="services" style={{ "padding": "calc(104px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "var(--sp-gap-56, 56px)" }}>
              <div className="sp-two-track" style={{ "display": "flex", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "maxWidth": "760px" }}>
                  <div style={s[6][lang]}>{t[14]}</div>
                  <h2 style={s[7][lang]}>{t[15]}</h2>
                </div>
                <p style={{ "margin": "0", "maxWidth": "400px", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[16]}
                </p>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", "gap": "24px" }}>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/truck-unloading.svg" alt={t[17]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[18]}
                    </span>
                    <h3 style={s[8][lang]}>{t[19]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[20]}
                    </p>
                  </div>
                </article>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/carton-inspection.svg" alt={t[21]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[22]}
                    </span>
                    <h3 style={s[9][lang]}>{t[23]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[24]}
                    </p>
                  </div>
                </article>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/consolidated-pallet.svg" alt={t[25]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[26]}
                    </span>
                    <h3 style={s[10][lang]}>{t[27]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[28]}
                    </p>
                  </div>
                </article>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/wooden-crate.svg" alt={t[29]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[30]}
                    </span>
                    <h3 style={s[11][lang]}>{t[31]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[32]}
                    </p>
                  </div>
                </article>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/forklift-loading.svg" alt={t[33]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[34]}
                    </span>
                    <h3 style={s[12][lang]}>{t[35]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[36]}
                    </p>
                  </div>
                </article>
                <article className="sp-op-card" style={{ "display": "flex", "flexDirection": "column", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "210px", "background": "#EEF3FF", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "borderBottom": "1px solid #DCE3F2" }}>
                    <img src="/design/container-ship.svg" alt={t[37]} style={{ "width": "220px", "height": "auto", "display": "block", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "var(--sp-pad-26-28-30, 26px 28px 30px)", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                      {t[38]}
                    </span>
                    <h3 style={s[13][lang]}>{t[39]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578", "textWrap": "pretty" }}>
                      {t[40]}
                    </p>
                  </div>
                </article>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", "gap": "24px" }}>
                <article className="sp-two-track" style={{ "gridColumn": "var(--sp-span, span 2)", "display": "flex", "alignItems": "stretch", "background": "#162456", "borderRadius": "22px", "overflow": "hidden", "color": "#FFFFFF" }}>
                  <div style={{ "flex": "1", "padding": "var(--sp-pad-40-44, 40px 44px)", "display": "flex", "flexDirection": "column", "gap": "16px", "justifyContent": "center" }}>
                    <div style={s[14][lang]}>{t[41]}</div>
                    <h3 style={s[15][lang]}>{t[42]}</h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.6", "color": "#C3CDEB", "maxWidth": "470px" }}>
                      {t[43]}
                    </p>
                    <div style={{ "paddingTop": "6px" }}>
                      <Link href={`/${lang}/devis`} style={s[16][lang]}>
                        <span>{t[44]}</span>
                        <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={v[5][lang]} />
                            <path d={v[6][lang]} />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div style={{ "width": "330px", "flexShrink": "0", "background": "#1E3170", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                    <img src="/design/picky-factory-visit.svg" alt={t[45]} style={{ "width": "290px", "height": "auto", "maxWidth": "100%" }} />
                  </div>
                </article>
                <article style={{ "display": "flex", "flexDirection": "column", "border": "1.5px dashed #B7C5E6", "borderRadius": "22px", "overflow": "hidden" }}>
                  <div style={{ "height": "190px", "display": "flex", "alignItems": "flex-end", "justifyContent": "center" }}>
                    <img src="/design/train-plane-sketch.svg" alt={t[46]} style={{ "width": "210px", "height": "auto", "opacity": "0.9", "maxWidth": "100%" }} />
                  </div>
                  <div style={{ "padding": "8px 28px 30px", "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                    <span style={s[17][lang]}>{t[47]}</span>
                    <h3 style={s[18][lang]}>{t[48]}</h3>
                    <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#4A5578" }}>
                      {t[49]}
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section id="etapes" style={{ "background": "#0B1433", "padding": "calc(104px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "color": "#FFFFFF", "display": "flex", "flexDirection": "column", "gap": "var(--sp-gap-48, 48px)" }}>
              <div className="sp-two-track" style={{ "display": "flex", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "maxWidth": "760px" }}>
                  <div style={s[19][lang]}>{t[50]}</div>
                  <h2 style={s[20][lang]}>{t[51]}</h2>
                </div>
                <p style={{ "margin": "0", "maxWidth": "400px", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                  {t[52]}
                </p>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <svg className="sp-steps-rail" width="1200" height="120" viewBox="0 0 1200 120" aria-hidden="true">
                  <path d="M20 60 Q 70 20, 120 60 Q 170 100, 220 60 Q 270 20, 320 60 Q 370 100, 420 60 Q 470 20, 520 60 Q 570 100, 620 60 Q 670 20, 720 60 Q 770 100, 820 60 Q 870 20, 920 60 Q 970 100, 1020 60 Q 1070 20, 1120 60 Q 1150 100, 1180 60" fill="none" stroke="#3A57B8" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
                  <circle cx={v[7][lang]} cy="60" r="22" fill="#155DFC" stroke="#155DFC" strokeWidth="2" />
                  <text x={v[8][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[53]}
                  </text>
                  <circle cx={v[9][lang]} cy="60" r="22" fill="#155DFC" stroke="#155DFC" strokeWidth="2" />
                  <text x={v[10][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[54]}
                  </text>
                  <circle cx={v[11][lang]} cy="60" r="22" fill="#155DFC" stroke="#155DFC" strokeWidth="2" />
                  <text x={v[12][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[55]}
                  </text>
                  <circle cx={v[13][lang]} cy="60" r="22" fill="#155DFC" stroke="#155DFC" strokeWidth="2" />
                  <text x={v[14][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[56]}
                  </text>
                  <circle cx={v[15][lang]} cy="60" r="22" fill="#155DFC" stroke="#155DFC" strokeWidth="2" />
                  <text x={v[16][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[57]}
                  </text>
                  <circle cx={v[17][lang]} cy="60" r="22" fill="#0B1433" stroke="#8DB2FF" strokeWidth="2" />
                  <text x={v[18][lang]} y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="600" fill="#FFFFFF">
                    {t[58]}
                  </text>
                </svg>
                <div className="sp-steps" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r6, repeat(6, minmax(0, 1fr)))", "gap": "0" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[21][lang]}>{t[59]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[60]}
                    </p>
                    <span style={s[22][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[61]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[23][lang]}>{t[62]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[63]}
                    </p>
                    <span style={s[24][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[64]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[25][lang]}>{t[65]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[66]}
                    </p>
                    <span style={s[26][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[67]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[27][lang]}>{t[68]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[69]}
                    </p>
                    <span style={s[28][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[70]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[29][lang]}>{t[71]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[72]}
                    </p>
                    <span style={s[30][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[73]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "0 14px" }}>
                    <h3 style={s[31][lang]}>{t[74]}</h3>
                    <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                      {t[75]}
                    </p>
                    <span style={s[32][lang]}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                        <path d="M10 20a2 2 0 004 0" />
                      </svg>
                      {t[76]}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section id="verite" style={{ "padding": "calc(104px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-500-fr, 500px minmax(0, 1fr))", "gap": "var(--sp-gap-72, 72px)", "alignItems": "start" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "24px" }}>
                <div style={s[33][lang]}>{t[77]}</div>
                <h2 style={s[34][lang]}>{t[78]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17_5, 17.5px)", "lineHeight": "1.65", "color": "#4A5578", "textWrap": "pretty" }}>
                  {t[79]}
                </p>
                <div style={{ "display": "flex", "gap": "18px", "alignItems": "center", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "48px", "height": "48px", "borderRadius": "14px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                    <span style={s[35][lang]}>{t[80]}</span>
                    <span lang="zh-Hans" style={{ "fontFamily": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[81]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "color": "#4A5578" }}>{t[82]}</span>
                  </div>
                </div>
                <img src="/design/picky-verified-badge.svg" alt={t[83]} style={{ "width": "230px", "height": "auto", "maxWidth": "100%" }} />
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <div style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                  <h3 style={s[36][lang]}>{t[84]}</h3>
                  <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "16px" }}>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[85]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[86]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[87]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[88]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[89]}</span>
                    </li>
                  </ul>
                </div>
                <div style={{ "border": "1.5px dashed #C9D3EA", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                  <h3 style={s[37][lang]}>{t[90]}</h3>
                  <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "16px" }}>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                      <span>{t[91]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                      <span>{t[92]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                      <span>{t[93]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                      <span>{t[94]}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
            <section id="app" style={{ "background": "#EAF1FF", "padding": "calc(104px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-640, minmax(0, 1fr) 640px)", "gap": "var(--sp-gap-40, 40px)", "alignItems": "center", "overflow": "hidden" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "26px" }}>
                <div style={s[38][lang]}>{t[95]}</div>
                <h2 style={s[39][lang]}>{t[96]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17_5, 17.5px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "560px" }}>
                  {t[97]}
                </p>
                <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "22px 28px" }}>
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
                        {t[98]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[99]}
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
                        {t[100]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[101]}
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
                        {t[102]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[103]}
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
                        {t[104]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[105]}
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
                        {t[106]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[107]}
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
                        {t[108]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                        {t[109]}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "flexWrap": "wrap" }}>
                  <Link href={`/${lang}/login`} style={s[40][lang]}>
                    <span>{t[110]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={v[19][lang]} />
                        <path d={v[20][lang]} />
                      </svg>
                    </span>
                  </Link>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "padding": "8px 14px", "borderRadius": "999px", "background": "#FFF1CC", "color": "#7A4E00", "fontSize": "14px", "fontWeight": "600" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3.5 2" />
                    </svg>
                    {t[111]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap" }}>
                  <Link href={`/${lang}/application`} data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "0 20px", "borderRadius": "14px", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v12" />
                      <path d="M7 11l5 5 5-5" />
                      <path d="M4 20h16" />
                    </svg>
                    <span style={{ "display": "flex", "flexDirection": "column" }}>
                      <span style={{ "fontSize": "11.5px", "color": "#B8C4E6" }}>
                        {t[112]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }} dir="ltr">
                        {t[113]}
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
                        {t[114]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }} dir="ltr">
                        {t[115]}
                      </span>
                    </span>
                  </Link>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "fontSize": "14px", "color": "#4A5578" }}>
                    <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "5px 10px", "borderRadius": "999px", "background": "#FFF1CC", "color": "#7A4E00", "fontWeight": "600" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                      {t[116]}
                    </span>
                    <span dir="ltr">{t[117]}</span>
                  </span>
                </div>
              </div>
              <div className="sp-phone-stage" style={{ "position": "relative", "height": "700px" }}>
                <div style={s[41][lang]}>
                  <div style={{ "width": "300px", "height": "620px", "boxSizing": "border-box", "padding": "10px", "borderRadius": "46px", "background": "#0E1A3D", "boxShadow": "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763" }}>
                    <div style={{ "width": "100%", "height": "100%", "borderRadius": "37px", "background": "#FFFFFF", "overflow": "hidden", "display": "flex", "flexDirection": "column" }}>
                      <div style={{ "padding": "var(--sp-pad-44-20-0, 44px 20px 0)", "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                        <span aria-label={t[118]} style={{ "display": "inline-flex", "width": "36px", "height": "36px", "borderRadius": "12px", "background": "#F5F7FC", "alignItems": "center", "justifyContent": "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={v[21][lang]} />
                            <path d={v[22][lang]} />
                          </svg>
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "600" }}>
                          {t[119]}
                        </span>
                        <span aria-label={t[120]} style={{ "display": "inline-flex", "width": "36px", "height": "36px", "borderRadius": "12px", "background": "#F5F7FC", "alignItems": "center", "justifyContent": "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                            <path d="M10 20a2 2 0 004 0" />
                          </svg>
                        </span>
                      </div>
                      <div style={{ "padding": "16px 20px 0", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                        <div style={{ "padding": "16px", "borderRadius": "18px", "background": "#162456", "color": "#FFFFFF", "display": "flex", "flexDirection": "column", "gap": "6px" }}>
                          <span style={s[42][lang]}>{t[121]}</span>
                          <span style={s[43][lang]}>{t[122]}</span>
                          <span style={{ "fontSize": "12.5px", "color": "#C3CDEB" }}>
                            {t[123]}
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
                              {t[124]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[125]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[126]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#0E1A3D" }}>
                              {t[127]}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#FFFFFF", "border": "2.5px solid #155DFC", "boxSizing": "border-box", "boxShadow": "0 0 0 4px #EAF1FF" }} />
                            <span style={{ "fontSize": "13.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                              {t[128]}
                            </span>
                            <span style={s[44][lang]}>{t[129]}</span>
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "34px" }}>
                            <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#F5F7FC", "border": "2px solid #DCE3F2", "boxSizing": "border-box" }} />
                            <span style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#6B7596" }}>
                              {t[130]}
                            </span>
                          </div>
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "8px", "minHeight": "46px", "padding": "0 10px", "borderRadius": "14px", "background": "#155DFC", "color": "#FFFFFF", "fontSize": "13.5px", "fontWeight": "600", "textAlign": "center" }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.5" />
                          </svg>
                          {t[131]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={s[45][lang]}>
                  <div style={{ "width": "300px", "height": "620px", "boxSizing": "border-box", "padding": "10px", "borderRadius": "46px", "background": "#0E1A3D", "boxShadow": "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763" }}>
                    <div style={{ "width": "100%", "height": "100%", "borderRadius": "37px", "background": "#FFFFFF", "overflow": "hidden", "display": "flex", "flexDirection": "column" }}>
                      <div style={{ "padding": "var(--sp-pad-44-20-0, 44px 20px 0)", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={s[46][lang]}>{t[132]}</span>
                        <span style={s[47][lang]}>{t[133]}</span>
                      </div>
                      <div style={{ "padding": "14px 20px 0", "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "8px" }}>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/truck-unloading.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[48][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[134]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/carton-inspection.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[49][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[135]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/wooden-crate.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[50][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[136]}
                          </span>
                        </div>
                        <div style={{ "height": "118px", "borderRadius": "14px", "background": "#EEF3FF", "overflow": "hidden", "display": "flex", "alignItems": "center", "justifyContent": "center", "position": "relative" }}>
                          <img src="/design/forklift-loading.svg" alt="" style={{ "width": "132px", "height": "auto", "maxWidth": "100%" }} />
                          <span style={s[51][lang]}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                              <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            {t[137]}
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
                          {t[138]}
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13px", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "20px", "height": "20px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          </span>
                          {t[139]}
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13px", "color": "#0E1A3D" }}>
                          <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "20px", "height": "20px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFF1CC" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A4E00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3.5 2" />
                            </svg>
                          </span>
                          {t[140]}
                        </div>
                      </div>
                      <div style={{ "padding": "16px 20px 0" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px", "borderRadius": "14px", "background": "#F5F7FC" }}>
                          <img src="/design/spot-1.svg" alt="" style={{ "width": "34px", "height": "auto", "flexShrink": "0", "maxWidth": "100%" }} />
                          <span style={{ "fontSize": "12.5px", "lineHeight": "1.4", "color": "#4A5578" }}>
                            {t[141]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <img src="/design/spot-2.svg" alt="" style={{ "position": "absolute", "left": "238px", "top": "548px", "width": "150px", "height": "auto", "maxWidth": "100%" }} />
              </div>
            </section>
            <section id="tarifs" style={{ "padding": "calc(104px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "var(--sp-gap-52, 52px)" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "maxWidth": "820px" }}>
                <div style={s[52][lang]}>{t[142]}</div>
                <h2 style={s[53][lang]}>{t[143]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17_5, 17.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[144]}
                </p>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px" }}>
                <article style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-40, 40px)", "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px" }}>
                    <h3 style={s[54][lang]}>{t[145]}</h3>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 16l2 4h14l2-4z" />
                        <path d="M6 16V9h12v7" />
                        <path d="M10 9V5h4v4" />
                      </svg>
                    </span>
                  </div>
                  <div style={s[55][lang]}>{t[146]}</div>
                  <div style={{ "display": "flex", "flexDirection": "column" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[147]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[148]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[149]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[150]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[151]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[152]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[153]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[154]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[155]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[156]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[157]}
                      </span>
                      <span style={{ "fontSize": "14px", "color": "#4A5578", "textAlign": "end" }}>
                        {t[158]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "paddingTop": "6px" }}>
                    <Link href={`/${lang}/devis`} style={s[56][lang]}>
                      <span>{t[159]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[23][lang]} />
                          <path d={v[24][lang]} />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
                <article style={{ "background": "#162456", "borderRadius": "24px", "padding": "var(--sp-pad-40, 40px)", "display": "flex", "flexDirection": "column", "gap": "22px", "color": "#FFFFFF" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px" }}>
                    <h3 style={s[57][lang]}>{t[160]}</h3>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="M16 16l4 4" />
                      </svg>
                    </span>
                  </div>
                  <div style={s[58][lang]}>{t[161]}</div>
                  <div style={{ "display": "flex", "flexDirection": "column" }}>
                    <div style={{ "display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "color": "#FFFFFF" }}>
                        {t[162]}
                      </span>
                      <span style={s[59][lang]}>{t[163]}</span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "color": "#FFFFFF" }}>
                        {t[164]}
                      </span>
                      <span style={s[60][lang]}>{t[165]}</span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "color": "#FFFFFF" }}>
                        {t[166]}
                      </span>
                      <span style={s[61][lang]}>{t[167]}</span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "color": "#FFFFFF" }}>
                        {t[168]}
                      </span>
                      <span style={s[62][lang]}>{t[169]}</span>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "13.5px", "color": "#B8C4E6" }}>
                    {t[170]}
                  </p>
                  <div>
                    <Link href={`/${lang}/devis`} style={s[63][lang]}>
                      <span>{t[171]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[25][lang]} />
                          <path d={v[26][lang]} />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
              </div>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 22px", "borderRadius": "16px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "fontSize": "15px", "color": "#4A5578" }}>
                <span style={{ "flexShrink": "0", "display": "inline-flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </span>
                <span>{t[172]}</span>
              </div>
            </section>
            <section id="faq" style={{ "padding": "calc(24px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-420-fr, 420px minmax(0, 1fr))", "gap": "var(--sp-gap-80, 80px)", "alignItems": "start" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                <div style={s[64][lang]}>{t[173]}</div>
                <h2 style={s[65][lang]}>{t[174]}</h2>
                <img src="/design/picky-loupe.svg" alt="" style={{ "width": "220px", "height": "auto", "maxWidth": "100%" }} />
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "color": "#4A5578" }}>
                  {t[175]}{" "}
                  <a href="mailto:contact@sourcingpick.com" style={{ "fontWeight": "600" }} dir="ltr">
                    {t[176]}
                  </a>
                </p>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "borderTop": "1px solid #DCE3F2" }}>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[66][lang]} aria-expanded="true">
                    <span>{t[177]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[178]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[67][lang]} aria-expanded="false">
                    <span>{t[179]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[68][lang]} aria-expanded="false">
                    <span>{t[180]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[69][lang]} aria-expanded="false">
                    <span>{t[181]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[70][lang]} aria-expanded="false">
                    <span>{t[182]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-cta-band" style={{ "position": "relative", "overflow": "hidden", "borderRadius": "32px", "background": "#155DFC", "padding": "var(--sp-pad-72, 72px)", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)", "color": "#FFFFFF" }}>
                <div style={{ "position": "absolute", "inset": "0", "backgroundImage": "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", "backgroundSize": "44px 25.4px" }} />
                <div style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "700px" }}>
                  <h2 style={s[71][lang]}>{t[183]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[184]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <Link href={`/${lang}/devis`} style={s[72][lang]}>
                      <span>{t[185]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[27][lang]} />
                          <path d={v[28][lang]} />
                        </svg>
                      </span>
                    </Link>
                    <a href="mailto:contact@sourcingpick.com" style={s[73][lang]}>
                      <span><span dir="ltr">{t[186]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={s[74][lang]}>{t[187]}</div>
                  <img src="/design/picky-arms-up.svg" alt={t[188]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
