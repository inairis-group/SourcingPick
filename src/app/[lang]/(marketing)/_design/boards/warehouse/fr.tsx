// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Entrepot.dc.html (and 0 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/warehouse.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: fr.
 */

import type { Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { warehouse as content } from "../../content/warehouse";
import { AddressGate } from "../../address-gate";

export function WarehouseBoardFR({ lang }: { lang: Locale }) {
  const t = content.text[lang];

  return (
    <>
            <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(64px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-640, minmax(0, 1fr) 640px)", "gap": "var(--sp-gap-48, 48px)", "alignItems": "center" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "background": "#FFFFFF", "padding": "6px 12px", "borderRadius": "999px", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
                  {t[0]}
                </div>
                <h1 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-54, 54px)", "lineHeight": "1.06", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[1]}
                </h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[2]}
                </p>
              </div>
              <div dir="ltr" style={{ "width": "640px", "height": "auto", "maxWidth": "100%" }}>
                <img src="/design/hero-warehouse-quay-ship.svg" alt={t[3]} style={{ "width": "640px", "height": "auto", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) 0", "display": "grid", "gridTemplateColumns": "var(--sp-grid-r4, repeat(4, minmax(0, 1fr)))", "gap": "18px" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#155DFC", "textWrap": "balance" }} dir="ltr">
                  {t[4]}
                </span>
                <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.5", "color": "#4A5578" }}>
                  {t[5]}
                </span>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#155DFC", "textWrap": "balance" }} dir="ltr">
                  {t[6]}
                </span>
                <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.5", "color": "#4A5578" }}>
                  {t[7]}
                </span>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#155DFC", "textWrap": "balance" }} dir="ltr">
                  {t[8]}
                </span>
                <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.5", "color": "#4A5578" }}>
                  {t[9]}
                </span>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                <span style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#155DFC", "textWrap": "balance" }} dir="ltr">
                  {t[10]}
                </span>
                <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.5", "color": "#4A5578" }}>
                  {t[11]}
                </span>
              </div>
            </section>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-fr, minmax(0, 1fr) minmax(0, 1fr))", "gap": "24px" }}>
              <AddressGate style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "10px" }} lang={lang}>
                <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-28, 28px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[12]}
                </h2>
                <span lang="zh-Hans" style={{ "fontFamily": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", "fontSize": "var(--sp-fs-20, 20px)", "fontWeight": "600", "paddingTop": "8px" }}>
                  {t[13]}
                </span>
                <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "color": "#4A5578" }}>
                  {t[14]}
                </span>
                <div style={{ "display": "flex", "flexDirection": "column", "paddingTop": "8px" }}>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "padding": "16px 0", "borderBottom": "1px solid #DCE3F2" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                      <span style={{ "fontSize": "13px", "color": "#4A5578" }}>
                        {t[15]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }}>
                        {t[16]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "padding": "16px 0", "borderBottom": "1px solid #DCE3F2" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 5h16v11H9l-5 4z" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                      <span style={{ "fontSize": "13px", "color": "#4A5578" }}>
                        {t[17]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }}>
                        <span dir="ltr">{t[18]}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "padding": "16px 0", "borderBottom": "1px solid #DCE3F2" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                      <span style={{ "fontSize": "13px", "color": "#4A5578" }}>
                        {t[19]}
                      </span>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600" }}>
                        <span dir="ltr">{t[20]}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </AddressGate>
              <div style={{ "position": "relative", "borderRadius": "24px", "overflow": "hidden", "background": "#E6ECF8", "border": "1px solid #DCE3F2", "minHeight": "420px", "backgroundImage": "linear-gradient(0deg, rgba(21,93,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(21,93,252,0.06) 1px, transparent 1px)", "backgroundSize": "36px 36px", "display": "flex", "alignItems": "center", "justifyContent": "center" }} role="img" aria-label={t[21]}>
                <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "12px", "padding": "0 40px", "textAlign": "center" }}>
                  <span style={{ "display": "inline-flex", "width": "64px", "height": "64px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 0 0 12px rgba(21,93,252,0.15)" }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                    {t[22]}
                  </span>
                </div>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "36px" }}>
              <style>{t[23]}</style>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "maxWidth": "980px" }}>
                <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
                  {t[24]}
                </div>
                <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.12", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[25]}
                </h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "760px" }}>
                  {t[26]}
                </p>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-600, minmax(0, 1fr) 600px)", "gap": "24px", "alignItems": "start" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-28-30, 28px 30px)", "borderRadius": "24px", "background": "#162456", "color": "#FFFFFF" }}>
                    <span style={{ "display": "inline-flex", "alignSelf": "flex-start", "padding": "4px 11px", "borderRadius": "999px", "background": "#FFC247", "color": "#7A4E00", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12px", "fontWeight": "600" }}>
                      {t[27]}
                    </span>
                    <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-32, 32px)", "fontWeight": "600", "letterSpacing": "-0.03em", "lineHeight": "1.1" }}>
                      {t[28]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.5", "color": "#C6D2EE" }}>
                      {t[29]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28-30, 28px 30px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                    <span style={{ "display": "inline-flex", "alignSelf": "flex-start", "padding": "4px 11px", "borderRadius": "999px", "background": "#EAF1FF", "color": "#155DFC", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12px", "fontWeight": "600", "marginBottom": "4px" }}>
                      {t[30]}
                    </span>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[31]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[32]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[33]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[34]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[35]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[36]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sp-scheme" role="img" aria-label={t[37]} style={{ "position": "relative", "width": "600px", "height": "548px", "borderRadius": "26px", "overflow": "hidden", "border": "1px solid #DCE3F2", "backgroundColor": "#E9F0FF", "backgroundImage": "linear-gradient(0deg, rgba(21,93,252,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,93,252,0.07) 1px, transparent 1px)", "backgroundSize": "36px 36px" }}>
                    <svg width="600" height="548" viewBox="0 0 600 548" style={{ "position": "absolute", "inset": "0" }} aria-hidden="true">
                      <path d="M0 510 C 120 471, 204 548, 312 510 S 504 471, 600 515 L 600 548 L 0 548 Z" fill="#D6F3FA" />
                      <line x1="300" y1="93" x2="300" y2="411" stroke="#8DB2FF" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
                      <line x1="102" y1="252" x2="300" y2="411" stroke="#8DB2FF" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
                      <line x1="498" y1="274" x2="300" y2="411" stroke="#8DB2FF" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
                    </svg>
                    <div style={{ "position": "absolute", "left": "300px", "top": "93px", "transform": "translate(-50%, -50%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px" }}>
                      <span style={{ "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 0 0 8px rgba(21,93,252,0.15)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <span style={{ "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "padding": "6px 12px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 10px 24px -14px rgba(14,26,61,0.4)", "whiteSpace": "nowrap" }}>
                        <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[38]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[39]}
                        </span>
                      </span>
                    </div>
                    <div style={{ "position": "absolute", "left": "102px", "top": "252px", "transform": "translate(-50%, -50%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px" }}>
                      <span style={{ "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 0 0 8px rgba(21,93,252,0.15)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <span style={{ "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "padding": "6px 12px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 10px 24px -14px rgba(14,26,61,0.4)", "whiteSpace": "nowrap" }}>
                        <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[40]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[41]}
                        </span>
                      </span>
                    </div>
                    <div style={{ "position": "absolute", "left": "498px", "top": "274px", "transform": "translate(-50%, -50%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px" }}>
                      <span style={{ "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "50%", "background": "#155DFC", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 0 0 8px rgba(21,93,252,0.15)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <span style={{ "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "padding": "6px 12px", "borderRadius": "12px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 10px 24px -14px rgba(14,26,61,0.4)", "whiteSpace": "nowrap" }}>
                        <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[42]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[43]}
                        </span>
                      </span>
                    </div>
                    <div style={{ "position": "absolute", "left": "300px", "top": "411px", "transform": "translate(-50%, -54%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "6px" }}>
                      <span style={{ "display": "inline-flex", "borderRadius": "50%", "boxShadow": "0 0 0 10px rgba(255,194,71,0.35)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="96" height="96" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                          <defs>
                            <clipPath id="cp-cp1">
                              <rect width="240" height="240" rx="48" />
                            </clipPath>
                          </defs>
                          <rect width="240" height="240" rx="48" fill="#EAF1FF" />
                          <ellipse cx="120" cy="204" rx="104" ry="7" fill="#162456" fillOpacity="0.1" />
                          <polygon points="22,102 120,58 218,102" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="30" y="100" width="180" height="100" rx="3" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="42" y="122" width="40" height="78" rx="2" fill="#B8C4E6" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M45 132 L79 132" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 142 L79 142" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 152 L79 152" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 162 L79 162" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 172 L79 172" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 182 L79 182" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M45 192 L79 192" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <rect x="100" y="122" width="40" height="78" rx="2" fill="#B8C4E6" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M103 132 L137 132" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 142 L137 142" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 152 L137 152" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 162 L137 162" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 172 L137 172" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 182 L137 182" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <path d="M103 192 L137 192" stroke="#162456" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
                          <rect x="158" y="128" width="34" height="72" rx="3" fill="#CFE0FF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M175 128 L175 200" stroke="#162456" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                          <rect x="150" y="172" width="28" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="161.48" y="172" width="5.04" height="11.76" fill="#C99443" stroke="none" />
                          <path d="M153 196.8 L175 196.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                          <rect x="180" y="172" width="28" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="191.48" y="172" width="5.04" height="11.76" fill="#C99443" stroke="none" />
                          <path d="M183 196.8 L205 196.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                          <rect x="165" y="146" width="28" height="26" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="176.48" y="146" width="5.04" height="10.92" fill="#C99443" stroke="none" />
                          <path d="M168 168.8 L190 168.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                        </svg>
                      </span>
                      <span style={{ "display": "inline-flex", "flexDirection": "column", "alignItems": "center", "padding": "6px 14px", "borderRadius": "12px", "background": "#FFC247", "color": "#7A4E00", "whiteSpace": "nowrap" }}>
                        <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "700" }}>
                          {t[44]}
                        </span>
                        <span style={{ "fontSize": "12px", "fontWeight": "600" }}>
                          {t[45]}
                        </span>
                      </span>
                    </div>
                    <span style={{ "position": "absolute", "insetInlineEnd": "14px", "top": "12px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "color": "#4A5578" }}>
                      {t[46]}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section style={{ "padding": "calc(24px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "28px" }}>
              <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                {t[47]}
              </h2>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", "gap": "18px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                  <span style={{ "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600" }}>
                    {t[48]}
                  </span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    {t[49]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                  <span style={{ "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600" }}>
                    {t[50]}
                  </span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    {t[51]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "padding": "var(--sp-pad-28, 28px)", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "22px" }}>
                  <span style={{ "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "15px", "fontWeight": "600" }}>
                    {t[52]}
                  </span>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    {t[53]}
                  </p>
                </div>
              </div>
            </section>
            <section style={{ "background": "#0B1433", "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-420-fr, 420px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "alignItems": "center" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                  {t[54]}
                </h2>
                <img src="/design/picky-loupe.svg" alt="" style={{ "width": "220px", "height": "auto", "maxWidth": "100%" }} />
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "14px" }}>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h11v10H3z" />
                      <path d="M14 10h4l3 3v3h-7" />
                      <circle cx="7" cy="18" r="2" />
                      <circle cx="17" cy="18" r="2" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[55]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
                      <path d="M4 7.5l8 4.5 8-4.5" />
                      <path d="M12 12v9" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[56]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 8V4h4" />
                      <path d="M16 4h4v4" />
                      <path d="M20 16v4h-4" />
                      <path d="M8 20H4v-4" />
                      <path d="M4 12h16" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[57]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="4" width="7" height="7" rx="1" />
                      <rect x="13" y="4" width="7" height="7" rx="1" />
                      <rect x="4" y="13" width="7" height="7" rx="1" />
                      <rect x="13" y="13" width="7" height="7" rx="1" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[58]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[59]}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "40px", "height": "40px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" />
                    </svg>
                  </span>
                  <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#FFFFFF" }}>
                    {t[60]}
                  </span>
                </div>
              </div>
            </section>
            <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-cta-band" style={{ "position": "relative", "overflow": "hidden", "borderRadius": "32px", "background": "#155DFC", "padding": "var(--sp-pad-72, 72px)", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)", "color": "#FFFFFF" }}>
                <div style={{ "position": "absolute", "inset": "0", "backgroundImage": "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", "backgroundSize": "44px 25.4px" }} />
                <div style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "700px" }}>
                  <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-48, 48px)", "lineHeight": "1.08", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                    {t[61]}
                  </h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[62]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <a href={sitePath(lang, "/devis")} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1.5px solid #FFFFFF", "textAlign": "center" }}>
                      <span>{t[63]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </a>
                    <a href="mailto:contact@sourcingpick.com" style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "transparent", "color": "#FFFFFF", "border": "1.5px solid rgba(255,255,255,0.28)", "textAlign": "center" }}>
                      <span><span dir="ltr">{t[64]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={{ "position": "absolute", "left": "-60px", "top": "6px", "maxWidth": "220px", "padding": "12px 16px", "borderRadius": "18px 18px 4px 18px", "background": "#FFFFFF", "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "600", "boxShadow": "0 16px 32px -16px rgba(14,26,61,0.5)", "boxSizing": "content-box" }}>
                    {t[65]}
                  </div>
                  <img src="/design/picky-arms-up.svg" alt={t[66]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
