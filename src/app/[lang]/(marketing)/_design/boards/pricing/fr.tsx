// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Tarifs.dc.html (and 0 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/pricing.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: fr.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { pricing as content } from "../../content/pricing";
import { Disclosure } from "../../disclosure";

export function PricingBoardFR({ lang }: { lang: Locale }) {
  const t = content.text[lang];

  return (
    <>
            <section className="sp-two-track" style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "760px" }}>
                <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "background": "#FFFFFF", "padding": "6px 12px", "borderRadius": "999px", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
                  {t[0]}
                </div>
                <h1 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-56, 56px)", "lineHeight": "1.06", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[1]}
                </h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "680px", "textWrap": "pretty" }}>
                  {t[2]}
                </p>
              </div>
              <div className="sp-hero-figure" style={{ "flexShrink": "0", "width": "400px", "height": "340px", "borderRadius": "28px", "background": "#EEF3FF", "border": "1px solid #DCE3F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                <img src="/design/container-ship.svg" alt={t[3]} style={{ "width": "360px", "height": "300px", "objectFit": "contain", "maxWidth": "100%" }} />
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(56px * var(--sp-vs, 1))", "display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap" }}>
              <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#4A5578", "marginRight": "6px" }}>
                {t[4]}
              </span>
              <a href="#livraison" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 16l2 4h14l2-4z" />
                  <path d="M6 16V9h12v7" />
                  <path d="M10 9V5h4v4" />
                </svg>
                {t[5]}
              </a>
              <a href="#carte" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4 4" />
                </svg>
                {t[6]}
              </a>
              <a href="#chine" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c2.8 3 2.8 15 0 18" />
                  <path d="M12 3c-2.8 3-2.8 15 0 18" />
                </svg>
                {t[7]}
              </a>
              <a href="#remuneration" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 6.5A7 7 0 007 12a7 7 0 0010 5.5" />
                  <path d="M4 10h9" />
                  <path d="M4 14h9" />
                </svg>
                {t[8]}
              </a>
              <a href="#questions" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 5h16v11H9l-5 4z" />
                </svg>
                {t[9]}
              </a>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px" }}>
                <article style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-40, 40px)", "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px" }}>
                    <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-22, 22px)", "lineHeight": "1.25", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                      {t[10]}
                    </h3>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 16l2 4h14l2-4z" />
                        <path d="M6 16V9h12v7" />
                        <path d="M10 9V5h4v4" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[11]}
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[12]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[13]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[14]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[15]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[16]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[17]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[18]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[19]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[20]}
                      </span>
                      <span style={{ "fontSize": "15px", "fontWeight": "600", "color": "#155DFC", "whiteSpace": "nowrap" }}>
                        {t[21]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 0", "borderBottom": "1px solid #DCE3F2" }}>
                      <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "color": "#0E1A3D" }}>
                        {t[22]}
                      </span>
                      <span style={{ "fontSize": "14px", "color": "#4A5578", "textAlign": "end" }}>
                        {t[23]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "paddingTop": "6px", "marginTop": "auto" }}>
                    <Link href={`/${lang}/devis`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "14px 22px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-16, 16px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                      <span>{t[24]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
                <article id="livraison" style={{ "background": "#162456", "borderRadius": "24px", "padding": "var(--sp-pad-40, 40px)", "display": "flex", "flexDirection": "column", "gap": "20px", "color": "#FFFFFF" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px" }}>
                    <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-22, 22px)", "lineHeight": "1.25", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                      {t[25]}
                    </h3>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.5 4.5l-.5 6L3 14.5v2l7-2 .5 4-2 1.5V21l3.5-.9 3.5.9v-1.5l-2-1.5.5-4 7 2v-2l-7-4-.5-6a1.5 1.5 0 00-3 0z" />
                      </svg>
                    </span>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#C6D2EE" }}>
                    {t[26]}
                  </p>
                  <div style={{ "display": "flex", "flexDirection": "column" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "13px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10.5 4.5l-.5 6L3 14.5v2l7-2 .5 4-2 1.5V21l3.5-.9 3.5.9v-1.5l-2-1.5.5-4 7 2v-2l-7-4-.5-6a1.5 1.5 0 00-3 0z" />
                        </svg>
                      </span>
                      <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                          <span style={{ "fontSize": "var(--sp-fs-17_5, 17.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                            {t[27]}
                          </span>
                        </div>
                        <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#B8C4E6" }}>
                          {t[28]}
                        </span>
                      </div>
                      <div style={{ "flexShrink": "0", "display": "flex", "flexDirection": "column", "alignItems": "flex-end", "gap": "2px" }}>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-26, 26px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFFFFF", "whiteSpace": "nowrap" }}>
                          {t[29]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "color": "#8FA0CF", "whiteSpace": "nowrap" }}>
                          {t[30]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "13px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h11v10H3z" />
                          <path d="M14 10h4l3 3v3h-7" />
                          <circle cx="7" cy="18" r="2" />
                          <circle cx="17" cy="18" r="2" />
                        </svg>
                      </span>
                      <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                          <span style={{ "fontSize": "var(--sp-fs-17_5, 17.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                            {t[31]}
                          </span>
                          <span style={{ "display": "inline-flex", "alignItems": "center", "padding": "3px 10px", "borderRadius": "999px", "background": "rgba(200,54,79,0.28)", "color": "#FFB8C4", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap" }}>
                            {t[32]}
                          </span>
                        </div>
                        <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#B8C4E6" }}>
                          {t[33]}
                        </span>
                      </div>
                      <div style={{ "flexShrink": "0", "display": "flex", "flexDirection": "column", "alignItems": "flex-end", "gap": "2px" }}>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-26, 26px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFFFFF", "whiteSpace": "nowrap" }}>
                          {t[34]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "color": "#8FA0CF", "whiteSpace": "nowrap" }}>
                          {t[35]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "14px 16px", "background": "rgba(31,143,85,0.16)", "border": "1px solid rgba(155,235,192,0.35)", "borderRadius": "16px", "margin": "4px 0" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(155,235,192,0.18)", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9BEBC0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 16l2 4h14l2-4z" />
                          <path d="M6 16V9h12v7" />
                          <path d="M10 9V5h4v4" />
                        </svg>
                      </span>
                      <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                          <span style={{ "fontSize": "var(--sp-fs-17_5, 17.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                            {t[36]}
                          </span>
                          <span style={{ "display": "inline-flex", "alignItems": "center", "padding": "3px 10px", "borderRadius": "999px", "background": "rgba(31,143,85,0.30)", "color": "#9BEBC0", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap" }}>
                            {t[37]}
                          </span>
                        </div>
                        <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#B8C4E6" }}>
                          {t[38]}
                        </span>
                      </div>
                      <div style={{ "flexShrink": "0", "display": "flex", "flexDirection": "column", "alignItems": "flex-end", "gap": "2px" }}>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-26, 26px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFC247", "whiteSpace": "nowrap" }}>
                          {t[39]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "color": "#8FA0CF", "whiteSpace": "nowrap" }}>
                          {t[40]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "13px 0", "borderBottom": "1px solid rgba(255,255,255,0.14)" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "rgba(141,178,255,0.14)", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8DB2FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="5" y="3" width="14" height="14" rx="3" />
                          <path d="M5 11h14" />
                          <path d="M9 7h6" />
                          <path d="M9 20l-2 2" />
                          <path d="M15 20l2 2" />
                          <path d="M9 14.2h.01" />
                          <path d="M15 14.2h.01" />
                        </svg>
                      </span>
                      <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                          <span style={{ "fontSize": "var(--sp-fs-17_5, 17.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                            {t[41]}
                          </span>
                          <span style={{ "display": "inline-flex", "alignItems": "center", "padding": "3px 10px", "borderRadius": "999px", "background": "rgba(200,54,79,0.28)", "color": "#FFB8C4", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap" }}>
                            {t[42]}
                          </span>
                        </div>
                        <span style={{ "fontSize": "14px", "lineHeight": "1.45", "color": "#B8C4E6" }}>
                          {t[43]}
                        </span>
                      </div>
                      <div style={{ "flexShrink": "0", "display": "flex", "flexDirection": "column", "alignItems": "flex-end", "gap": "2px" }}>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-26, 26px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFFFFF", "whiteSpace": "nowrap" }}>
                          {t[44]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "color": "#8FA0CF", "whiteSpace": "nowrap" }}>
                          {t[45]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "13.5px", "lineHeight": "1.55", "color": "#B8C4E6" }}>
                    {t[46]}
                  </p>
                </article>
              </div>
            </section>
            <style>{t[47]}</style>
            <section id="carte" style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "36px" }}>
              <div className="sp-two-track" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "maxWidth": "860px" }}>
                  <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
                    {t[48]}
                  </div>
                  <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-44, 44px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[49]}
                  </h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[50]}
                  </p>
                </div>
                <div style={{ "flexShrink": "0", "width": "380px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 300" width="380" height="219" style={{ "display": "block", "maxWidth": "100%", "height": "auto" }} aria-hidden="true">
                    <circle cx="260.0" cy="162.0" r="132.0" fill="#155DFC" fillOpacity="0.14" />
                    <circle cx="260.0" cy="162.0" r="93.0" fill="#8DB2FF" fillOpacity="0.2" />
                    <g className="cw-sway2">
                      <g transform="translate(29.6 87.6) scale(0.62)">
                        <ellipse cx="120" cy="206" rx="80" ry="6" fill="#162456" fillOpacity="0.1" />
                        <rect x="40" y="42" width="160" height="158" rx="14" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M40 56 A14 14 0 0 1 54 42 L186 42 A14 14 0 0 1 200 56 L200 78 L40 78Z" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="79" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="151" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="52" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="73.5" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="95" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="116.5" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="138" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="159.5" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="181" y="92" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="52" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="73.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="95" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="116.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="138" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="159.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="181" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="52" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="73.5" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="95" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="116.5" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="138" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="159.5" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="181" y="134" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="52" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="73.5" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="95" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="116.5" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="138" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="159.5" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="181" y="155" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="52" y="176" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="73.5" y="176" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                        <rect x="95" y="176" width="17" height="17" rx="3.4" fill="#E3EBFB" />
                      </g>
                    </g>
                    <g className="cw-sway">
                      <g transform="translate(341.6 93.6) scale(0.62)">
                        <ellipse cx="116" cy="204" rx="92" ry="7" fill="#162456" fillOpacity="0.1" />
                        <polygon points="54,122 40,84 104,78 120,122" fill="#C99443" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <polygon points="186,122 200,84 136,78 120,122" fill="#D4A14F" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="84" y="92" width="72" height="46" rx="7" fill="#FFFFFF" stroke="#162456" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="90" y="98" width="60" height="28" rx="4" fill="#CFE0FF" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M98 108 L132 108" stroke="#155DFC" strokeWidth="3.2" strokeLinecap="round" opacity="1.0" />
                        <path d="M98 117 L118 117" stroke="#155DFC" strokeWidth="3.2" strokeLinecap="round" opacity="1.0" />
                        <circle cx="140" cy="112" r="5" fill="#FFC247" stroke="#162456" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="54" y="122" width="132" height="78" rx="3" fill="#E3B66C" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="108" y="122" width="24" height="30" fill="#C99443" />
                        <path d="M54 122 L186 122" stroke="#162456" strokeWidth="3.4" strokeLinecap="round" opacity="1.0" />
                        <circle cx="120" cy="166" r="21" fill="#1F8F55" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M109 166 L117 175 L133 156" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                        <g transform="translate(176 66)">
                          <circle cx="0" cy="0" r="25" fill="#FFFFFF" fillOpacity="0.55" stroke="#162456" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M-12 -10 Q-6 -18 4 -17" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                          <path d="M18 19 L36 38" stroke="#162456" strokeWidth="9" strokeLinecap="round" />
                          <path d="M18 19 L36 38" stroke="#FFC247" strokeWidth="3.4" strokeLinecap="round" />
                        </g>
                      </g>
                    </g>
                    <g transform="translate(149.6 45.6) scale(0.92)">
                      <ellipse cx="120" cy="200" rx="96" ry="7" fill="#162456" fillOpacity="0.1" />
                      <g className="cw-puff" style={{ "animationDelay": "0s", "transformOrigin": "170px 70px" }}>
                        <circle cx="170" cy="70" r="7" fill="#FFFFFF" stroke="#162456" strokeWidth="3" />
                      </g>
                      <g className="cw-puff2" style={{ "animationDelay": "1.2s", "transformOrigin": "170px 70px" }}>
                        <circle cx="170" cy="70" r="6" fill="#FFFFFF" stroke="#162456" strokeWidth="3" />
                      </g>
                      <rect x="158" y="66" width="22" height="108" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="158" y="66" width="22" height="10" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M36 192 L36 108 L36 86 L74 108 L74 86 L112 108 L112 86 L150 108 L150 86 L168 98 L168 192Z" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="46" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="78" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="110" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="124" y="150" width="30" height="42" rx="3" fill="#1F4FD8" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M139 150 L139 192" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      <rect x="150" y="164" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="164.76" y="164" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M153 188.8 L183 188.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <rect x="188" y="164" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="202.76" y="164" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M191 188.8 L221 188.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <rect x="168" y="136" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="182.76" y="136" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M171 160.8 L201 160.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <g transform="translate(62 62)">
                        <path d="M0 34 C-18 14 -22 4 -22 -6 A22 22 0 1 1 22 -6 C22 4 18 14 0 34Z" fill="#C8364F" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <circle cx="0" cy="-6" r="8" fill="#FFFFFF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      </g>
                    </g>
                  </svg>
                </div>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", "gap": "24px" }}>
                <article style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "padding": "var(--sp-pad-28, 28px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                  <div style={{ "position": "relative", "height": "150px", "borderRadius": "16px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="144" height="144" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                      <defs>
                        <clipPath id="cp-cp2">
                          <rect width="240" height="240" rx="48" />
                        </clipPath>
                      </defs>
                      <rect width="240" height="240" rx="48" fill="transparent" />
                      <ellipse cx="120" cy="200" rx="96" ry="7" fill="#162456" fillOpacity="0.1" />
                      <g className="cw-puff" style={{ "animationDelay": "0s", "transformOrigin": "170px 70px" }}>
                        <circle cx="170" cy="70" r="7" fill="#FFFFFF" stroke="#162456" strokeWidth="3" />
                      </g>
                      <g className="cw-puff2" style={{ "animationDelay": "1.2s", "transformOrigin": "170px 70px" }}>
                        <circle cx="170" cy="70" r="6" fill="#FFFFFF" stroke="#162456" strokeWidth="3" />
                      </g>
                      <rect x="158" y="66" width="22" height="108" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="158" y="66" width="22" height="10" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M36 192 L36 108 L36 86 L74 108 L74 86 L112 108 L112 86 L150 108 L150 86 L168 98 L168 192Z" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="46" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="78" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="110" y="122" width="20" height="22" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="124" y="150" width="30" height="42" rx="3" fill="#1F4FD8" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M139 150 L139 192" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      <rect x="150" y="164" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="164.76" y="164" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M153 188.8 L183 188.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <rect x="188" y="164" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="202.76" y="164" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M191 188.8 L221 188.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <rect x="168" y="136" width="36" height="28" rx="2.5" fill="#E3B66C" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="182.76" y="136" width="6.48" height="11.76" fill="#C99443" stroke="none" />
                      <path d="M171 160.8 L201 160.8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
                      <g transform="translate(62 62)">
                        <path d="M0 34 C-18 14 -22 4 -22 -6 A22 22 0 1 1 22 -6 C22 4 18 14 0 34Z" fill="#C8364F" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <circle cx="0" cy="-6" r="8" fill="#FFFFFF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      </g>
                    </svg>
                    <span style={{ "position": "absolute", "top": "12px", "left": "12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "5px 11px", "borderRadius": "999px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "#155DFC" }}>
                      {t[51]}
                    </span>
                  </div>
                  <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-24, 24px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[52]}
                  </h3>
                  <div style={{ "display": "flex", "alignItems": "baseline", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-44, 44px)", "fontWeight": "700", "letterSpacing": "-0.03em", "lineHeight": "1", "color": "#0E1A3D" }}>
                      {t[53]}
                    </span>
                    <span style={{ "fontSize": "14px", "color": "#4A5578" }}>{t[54]}</span>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[55]}
                  </p>
                  <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[56]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[57]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[58]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[59]}</span>
                    </li>
                  </ul>
                  <div style={{ "marginTop": "auto", "paddingTop": "6px" }}>
                    <Link href={`/${lang}/contact`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "width": "100%", "justifyContent": "center", "boxSizing": "border-box", "minHeight": "44px", "padding": "14px 22px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-16, 16px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                      <span>{t[60]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
                <article style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "padding": "var(--sp-pad-28, 28px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                  <div style={{ "position": "relative", "height": "150px", "borderRadius": "16px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="144" height="144" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                      <defs>
                        <clipPath id="cp-cp3">
                          <rect width="240" height="240" rx="48" />
                        </clipPath>
                      </defs>
                      <rect width="240" height="240" rx="48" fill="transparent" />
                      <ellipse cx="120" cy="196" rx="98" ry="6" fill="#162456" fillOpacity="0.08" />
                      <rect x="48.08" y="60.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M20 92.6 L20 74.24 L29 67.51 L29 74.24 L38 67.51 L38 74.24 L47 67.51 L47 74.24 L56 74.24 L56 92.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="33.68" y="80.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="89.08" y="60.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M61 92.6 L61 74.24 L70 67.51 L70 74.24 L79 67.51 L79 74.24 L88 67.51 L88 74.24 L97 74.24 L97 92.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="74.68" y="80.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="130.08" y="60.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M102 92.6 L102 74.24 L111 67.51 L111 74.24 L120 67.51 L120 74.24 L129 67.51 L129 74.24 L138 74.24 L138 92.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="115.68" y="80.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="171.08" y="60.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M143 92.6 L143 74.24 L152 67.51 L152 74.24 L161 67.51 L161 74.24 L170 67.51 L170 74.24 L179 74.24 L179 92.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="156.68" y="80.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="212.08" y="60.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M184 92.6 L184 74.24 L193 67.51 L193 74.24 L202 67.51 L202 74.24 L211 67.51 L211 74.24 L220 74.24 L220 92.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="197.68" y="80.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="48.08" y="128.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M20 160.6 L20 142.24 L29 135.51 L29 142.24 L38 135.51 L38 142.24 L47 135.51 L47 142.24 L56 142.24 L56 160.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="33.68" y="148.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="89.08" y="128.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M61 160.6 L61 142.24 L70 135.51 L70 142.24 L79 135.51 L79 142.24 L88 135.51 L88 142.24 L97 142.24 L97 160.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="74.68" y="148.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="130.08" y="128.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M102 160.6 L102 142.24 L111 135.51 L111 142.24 L120 135.51 L120 142.24 L129 135.51 L129 142.24 L138 142.24 L138 160.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="115.68" y="148.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="171.08" y="128.47" width="5.04" height="13.77" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M143 160.6 L143 142.24 L152 135.51 L152 142.24 L161 135.51 L161 142.24 L170 135.51 L170 142.24 L179 142.24 L179 160.6Z" fill="#FFFFFF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="156.68" y="148.97" width="8.64" height="11.63" rx="1.2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="212.08" y="128.47" width="5.04" height="13.77" rx="1.2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M184 160.6 L184 142.24 L193 135.51 L193 142.24 L202 135.51 L202 142.24 L211 135.51 L211 142.24 L220 142.24 L220 160.6Z" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="197.68" y="148.97" width="8.64" height="11.63" rx="1.2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                      <g transform="translate(120 20)">
                        <rect x="-30" y="-14" width="60" height="28" rx="14" fill="#162456" />
                        <text x="0" y="8" textAnchor="middle" fontFamily="Unbounded, Onest, sans-serif" fontSize="19" fontWeight="700" fill="#FFC247">
                          {t[61]}
                        </text>
                      </g>
                    </svg>
                    <span style={{ "position": "absolute", "top": "12px", "left": "12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "5px 11px", "borderRadius": "999px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "#155DFC" }}>
                      {t[62]}
                    </span>
                  </div>
                  <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-24, 24px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[63]}
                  </h3>
                  <div style={{ "display": "flex", "alignItems": "baseline", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-44, 44px)", "fontWeight": "700", "letterSpacing": "-0.03em", "lineHeight": "1", "color": "#0E1A3D" }}>
                      {t[64]}
                    </span>
                    <span style={{ "fontSize": "14px", "color": "#4A5578" }}>{t[65]}</span>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[66]}
                  </p>
                  <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[67]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[68]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[69]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[70]}</span>
                    </li>
                  </ul>
                  <p style={{ "margin": "0", "fontSize": "14px", "fontWeight": "600", "color": "#155DFC" }}>
                    {t[71]}
                  </p>
                  <div style={{ "marginTop": "auto", "paddingTop": "6px" }}>
                    <Link href={`/${lang}/contact`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "width": "100%", "justifyContent": "center", "boxSizing": "border-box", "minHeight": "44px", "padding": "14px 22px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-16, 16px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                      <span>{t[72]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
                <article style={{ "display": "flex", "flexDirection": "column", "gap": "20px", "padding": "var(--sp-pad-28, 28px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                  <div style={{ "position": "relative", "height": "150px", "borderRadius": "16px", "background": "#EEF3FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="144" height="144" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                      <defs>
                        <clipPath id="cp-cp4">
                          <rect width="240" height="240" rx="48" />
                        </clipPath>
                      </defs>
                      <rect width="240" height="240" rx="48" fill="transparent" />
                      <ellipse cx="116" cy="204" rx="92" ry="7" fill="#162456" fillOpacity="0.1" />
                      <polygon points="54,122 40,84 104,78 120,122" fill="#C99443" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <polygon points="186,122 200,84 136,78 120,122" fill="#D4A14F" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="84" y="92" width="72" height="46" rx="7" fill="#FFFFFF" stroke="#162456" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="90" y="98" width="60" height="28" rx="4" fill="#CFE0FF" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M98 108 L132 108" stroke="#155DFC" strokeWidth="3.2" strokeLinecap="round" opacity="1.0" />
                      <path d="M98 117 L118 117" stroke="#155DFC" strokeWidth="3.2" strokeLinecap="round" opacity="1.0" />
                      <circle cx="140" cy="112" r="5" fill="#FFC247" stroke="#162456" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="54" y="122" width="132" height="78" rx="3" fill="#E3B66C" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="108" y="122" width="24" height="30" fill="#C99443" />
                      <path d="M54 122 L186 122" stroke="#162456" strokeWidth="3.4" strokeLinecap="round" opacity="1.0" />
                      <circle cx="120" cy="166" r="21" fill="#1F8F55" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M109 166 L117 175 L133 156" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                      <g transform="translate(176 66)">
                        <circle cx="0" cy="0" r="25" fill="#FFFFFF" fillOpacity="0.55" stroke="#162456" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-12 -10 Q-6 -18 4 -17" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                        <path d="M18 19 L36 38" stroke="#162456" strokeWidth="9" strokeLinecap="round" />
                        <path d="M18 19 L36 38" stroke="#FFC247" strokeWidth="3.4" strokeLinecap="round" />
                      </g>
                    </svg>
                    <span style={{ "position": "absolute", "top": "12px", "left": "12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "5px 11px", "borderRadius": "999px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "#155DFC" }}>
                      {t[73]}
                    </span>
                  </div>
                  <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-24, 24px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[74]}
                  </h3>
                  <div style={{ "display": "flex", "alignItems": "baseline", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-34, 34px)", "fontWeight": "700", "letterSpacing": "-0.03em", "lineHeight": "1", "color": "#0E1A3D" }}>
                      {t[75]}
                    </span>
                    <span style={{ "fontSize": "14px", "color": "#4A5578" }}>{t[76]}</span>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[77]}
                  </p>
                  <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[78]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[79]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[80]}</span>
                    </li>
                    <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span>{t[81]}</span>
                    </li>
                  </ul>
                  <div style={{ "marginTop": "auto", "paddingTop": "6px" }}>
                    <Link href={`/${lang}/devis`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "width": "100%", "justifyContent": "center", "boxSizing": "border-box", "minHeight": "44px", "padding": "14px 22px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-16, 16px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                      <span>{t[82]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </article>
              </div>
            </section>
            <section id="chine" style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
              <div style={{ "padding": "var(--sp-pad-56, 56px)", "borderRadius": "32px", "background": "#EAF1FF", "border": "1px solid #DCE3F2", "display": "flex", "flexDirection": "column", "gap": "36px" }}>
                <div className="sp-two-track" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "maxWidth": "800px" }}>
                    <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
                      {t[83]}
                    </div>
                    <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-44, 44px)", "lineHeight": "1.1", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                      {t[84]}
                    </h2>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                      {t[85]}
                    </p>
                  </div>
                  <img src="/design/spot-2.svg" alt="" style={{ "flexShrink": "0", "width": "220px", "height": "auto", "maxWidth": "100%" }} />
                </div>
                <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px" }}>
                  <article style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "padding": "var(--sp-pad-36, 36px)", "borderRadius": "28px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "color": "#0E1A3D" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px" }}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "14px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="68" height="68" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                          <defs>
                            <clipPath id="cp-cp5">
                              <rect width="240" height="240" rx="48" />
                            </clipPath>
                          </defs>
                          <rect width="240" height="240" rx="48" fill="transparent" />
                          <ellipse cx="120" cy="206" rx="80" ry="6" fill="#162456" fillOpacity="0.1" />
                          <rect x="40" y="42" width="160" height="158" rx="14" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M40 56 A14 14 0 0 1 54 42 L186 42 A14 14 0 0 1 200 56 L200 78 L40 78Z" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="79" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="151" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="52" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="73.5" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="95" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="116.5" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="138" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="159.5" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="181" y="92" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="52" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="73.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="95" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="116.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="138" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="159.5" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="181" y="113" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="52" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="73.5" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="95" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="116.5" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="138" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="159.5" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="181" y="134" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="52" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="73.5" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="95" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="116.5" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="138" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="159.5" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="181" y="155" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="52" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="73.5" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="95" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="116.5" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="138" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="159.5" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                          <rect x="181" y="176" width="17" height="17" rx="3.4" fill="#F1F5FC" />
                        </svg>
                        <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-28, 28px)", "lineHeight": "1.15", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                          {t[86]}
                        </h3>
                      </div>
                      <span style={{ "display": "inline-flex", "padding": "5px 12px", "borderRadius": "999px", "background": "#EAF1FF", "color": "#0F47C9", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600" }}>
                        {t[87]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "calc(var(--sp-fs-62, 62px) * 0.9677)", "fontWeight": "700", "letterSpacing": "-0.035em", "lineHeight": "1", "color": "#0E1A3D" }}>
                        {t[88]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "color": "#4A5578" }}>
                        {t[89]}
                      </span>
                    </div>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                      {t[90]}
                    </p>
                    <ul style={{ "margin": "0", "padding": "18px 0 0", "borderTop": "1px solid #DCE3F2", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "13px" }}>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[91]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[92]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[93]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[94]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[95]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[96]}</span>
                      </li>
                    </ul>
                  </article>
                  <article style={{ "display": "flex", "flexDirection": "column", "gap": "18px", "padding": "var(--sp-pad-36, 36px)", "borderRadius": "28px", "background": "#162456", "color": "#FFFFFF" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px" }}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "14px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="68" height="68" style={{ "display": "block", "flexShrink": "0" }} aria-hidden="true">
                          <defs>
                            <clipPath id="cp-cp6">
                              <rect width="240" height="240" rx="48" />
                            </clipPath>
                          </defs>
                          <rect width="240" height="240" rx="48" fill="transparent" />
                          <ellipse cx="120" cy="206" rx="80" ry="6" fill="#162456" fillOpacity="0.1" />
                          <rect x="40" y="42" width="160" height="158" rx="14" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <path d="M40 56 A14 14 0 0 1 54 42 L186 42 A14 14 0 0 1 200 56 L200 78 L40 78Z" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="79" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="151" y="30" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="52" y="92" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          <rect x="73.5" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="95" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="116.5" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="138" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="159.5" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="181" y="92" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="52" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="73.5" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="95" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="116.5" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="138" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="159.5" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="181" y="113" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="52" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="73.5" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="95" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="116.5" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="138" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="159.5" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="181" y="134" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="52" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="73.5" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="95" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="116.5" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="138" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="159.5" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="181" y="155" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="52" y="176" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="73.5" y="176" width="17" height="17" rx="3.4" fill="#FFE7A6" />
                          <rect x="95" y="176" width="17" height="17" rx="3.4" fill="#FFC247" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                        <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-28, 28px)", "lineHeight": "1.15", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                          {t[97]}
                        </h3>
                      </div>
                      <span style={{ "display": "inline-flex", "padding": "5px 12px", "borderRadius": "999px", "background": "rgba(255,194,71,0.18)", "color": "#FFC247", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600" }}>
                        {t[98]}
                      </span>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "calc(var(--sp-fs-62, 62px) * 0.9677)", "fontWeight": "700", "letterSpacing": "-0.035em", "lineHeight": "1", "color": "#FFC247" }}>
                        {t[99]}
                      </span>
                      <span style={{ "fontSize": "14.5px", "color": "#C6D2EE" }}>
                        {t[100]}
                      </span>
                    </div>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.6", "color": "#C6D2EE" }}>
                      {t[101]}
                    </p>
                    <ul style={{ "margin": "0", "padding": "18px 0 0", "borderTop": "1px solid rgba(255,255,255,0.16)", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "13px" }}>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[102]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[103]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[104]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[105]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[106]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "rgba(255,255,255,0.12)", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span>{t[107]}</span>
                      </li>
                    </ul>
                  </article>
                </div>
                <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px", "alignItems": "start" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "padding": "var(--sp-pad-32, 32px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                    <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-22, 22px)", "lineHeight": "1.25", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                      {t[108]}
                    </h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                      {t[109]}
                    </p>
                    <div style={{ "display": "flex", "flexDirection": "column" }}>
                      <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-1_5fr-fr-fr, minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr))", "gap": "12px", "paddingBottom": "8px" }}>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#4A5578", "textAlign": "start" }}>
                          {t[110]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#4A5578", "textAlign": "end" }}>
                          {t[111]}
                        </span>
                        <span style={{ "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "11.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#4A5578", "textAlign": "end" }}>
                          {t[112]}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-1_5fr-fr-fr, minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr))", "gap": "12px", "alignItems": "center", "padding": "13px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[113]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "700", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[114]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "700", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[115]}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-1_5fr-fr-fr, minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr))", "gap": "12px", "alignItems": "center", "padding": "13px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[116]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[117]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[118]}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-1_5fr-fr-fr, minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr))", "gap": "12px", "alignItems": "center", "padding": "13px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[119]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[120]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#0E1A3D", "textAlign": "end" }}>
                          {t[121]}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-1_5fr-fr-fr, minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr))", "gap": "12px", "alignItems": "center", "padding": "13px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[122]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#4A5578", "textAlign": "end" }}>
                          {t[123]}
                        </span>
                        <span style={{ "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-0.02em", "color": "#4A5578", "textAlign": "end" }}>
                          {t[124]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="sp-placeholder" style={{ "display": "inline-flex", "alignItems": "center", "padding": "1px 8px", "borderRadius": "6px", "background": "#FFF1CC", "border": "1px dashed #D99A00", "color": "#7A4E00", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "0.82em", "fontWeight": "600", "whiteSpace": "nowrap" }}>
                        {t[125]}
                      </span>
                    </div>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "padding": "var(--sp-pad-32, 32px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                    <h3 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-22, 22px)", "lineHeight": "1.25", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                      {t[126]}
                    </h3>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#4A5578" }}>
                      {t[127]}
                    </p>
                    <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[128]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[129]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[130]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[131]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[132]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[133]}</span>
                      </li>
                      <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "15px", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FBE7EB", "marginTop": "1px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8364F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                          </svg>
                        </span>
                        <span>{t[134]}</span>
                      </li>
                    </ul>
                    <p style={{ "margin": "0", "paddingTop": "4px", "fontSize": "14px", "lineHeight": "1.5", "color": "#4A5578" }}>
                      {t[135]}
                    </p>
                  </div>
                </div>
                <div>
                  <Link href={`/${lang}/contact`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                    <span>{t[136]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </section>
            <section id="remuneration" style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
              <div style={{ "padding": "var(--sp-pad-52, 52px)", "borderRadius": "28px", "background": "#0E1A3D", "color": "#FFFFFF", "display": "flex", "flexDirection": "column", "gap": "28px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "maxWidth": "820px" }}>
                  <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#8DB2FF" }}>
                    {t[137]}
                  </div>
                  <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-40, 40px)", "lineHeight": "1.12", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                    {t[138]}
                  </h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#C6D2EE" }}>
                    {t[139]}
                  </p>
                </div>
                <div style={{ "display": "flex", "gap": "18px", "alignItems": "stretch" }}>
                  <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "8px", "padding": "var(--sp-pad-26-26, 26px 26px)", "borderRadius": "20px", "background": "#162456", "border": "1px solid rgba(255,255,255,0.14)", "boxSizing": "content-box" }}>
                    <span style={{ "display": "flex", "alignItems": "center", "minHeight": "48px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-40, 40px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFC247" }}>
                      {t[140]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                      {t[141]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                      {t[142]}
                    </span>
                  </div>
                  <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "8px", "padding": "var(--sp-pad-26-26, 26px 26px)", "borderRadius": "20px", "background": "#162456", "border": "1px solid rgba(255,255,255,0.14)", "boxSizing": "content-box" }}>
                    <span style={{ "display": "flex", "alignItems": "center", "minHeight": "48px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-40, 40px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFC247" }}>
                      {t[143]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                      {t[144]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                      {t[145]}
                    </span>
                  </div>
                  <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "8px", "padding": "var(--sp-pad-26-26, 26px 26px)", "borderRadius": "20px", "background": "#162456", "border": "1px solid rgba(255,255,255,0.14)", "boxSizing": "content-box" }}>
                    <span style={{ "display": "flex", "alignItems": "center", "minHeight": "48px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "calc(var(--sp-fs-28, 28px) * 0.9643)", "fontWeight": "600", "lineHeight": "1.1", "color": "#FFC247" }}>
                      {t[146]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                      {t[147]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                      {t[148]}
                    </span>
                  </div>
                  <div style={{ "flex": "1", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "8px", "padding": "var(--sp-pad-26-26, 26px 26px)", "borderRadius": "20px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.14)", "boxSizing": "content-box" }}>
                    <span style={{ "display": "flex", "alignItems": "center", "minHeight": "48px", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "var(--sp-fs-40, 40px)", "fontWeight": "600", "lineHeight": "1.1", "color": "#8DB2FF" }}>
                      {t[149]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                      {t[150]}
                    </span>
                    <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                      {t[151]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#B8C4E6" }}>
                    {t[152]}
                  </p>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#E3EBFF", "fontWeight": "500" }}>
                    {t[153]}
                  </p>
                </div>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "24px" }}>
              <div style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-26, 26px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[154]}
                </h2>
                <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[155]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[156]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[157]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[158]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[159]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-36-40, 36px 40px)", "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-26, 26px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                  {t[160]}
                </h2>
                <ul style={{ "margin": "0", "padding": "0", "listStyle": "none", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[161]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[162]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[163]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[164]}</span>
                  </li>
                  <li style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "24px", "height": "24px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#E3F6EC", "marginTop": "1px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{t[165]}</span>
                  </li>
                </ul>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
              <div style={{ "display": "flex", "gap": "24px", "alignItems": "center", "padding": "var(--sp-pad-32-36, 32px 36px)", "borderRadius": "24px", "background": "#EAF1FF" }}>
                <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "56px", "height": "56px", "borderRadius": "16px", "background": "#FFFFFF", "alignItems": "center", "justifyContent": "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </span>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px" }}>
                  <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-24, 24px)", "lineHeight": "1.2", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                    {t[166]}
                  </h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.55", "color": "#0E1A3D" }}>
                    {t[167]}
                  </p>
                  <p style={{ "margin": "0", "fontSize": "15px", "color": "#4A5578" }}>
                    {t[168]}
                  </p>
                </div>
              </div>
            </section>
            <section id="questions" style={{ "padding": "0 var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-380-fr, 380px minmax(0, 1fr))", "gap": "var(--sp-gap-64, 64px)" }}>
              <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-36, 36px)", "lineHeight": "1.15", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
                {t[169]}
              </h2>
              <div style={{ "display": "flex", "flexDirection": "column", "borderTop": "1px solid #DCE3F2" }}>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[170]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[171]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[172]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[173]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[174]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[175]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[176]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[177]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[178]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[179]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[180]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[181]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[182]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[183]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[184]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[185]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[186]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[187]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "20px", "width": "100%", "minHeight": "44px", "padding": "0", "border": "0", "background": "transparent", "cursor": "pointer", "textAlign": "start", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D", "boxSizing": "content-box" }} aria-expanded="true">
                    <span>{t[188]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[189]}
                  </p>
                </Disclosure>
              </div>
            </section>
            <section style={{ "padding": "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-cta-band" style={{ "position": "relative", "overflow": "hidden", "borderRadius": "32px", "background": "#155DFC", "padding": "var(--sp-pad-72, 72px)", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-40, 40px)", "color": "#FFFFFF" }}>
                <div style={{ "position": "absolute", "inset": "0", "backgroundImage": "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", "backgroundSize": "44px 25.4px" }} />
                <div style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "700px" }}>
                  <h2 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-48, 48px)", "lineHeight": "1.08", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#FFFFFF", "textWrap": "balance" }}>
                    {t[190]}
                  </h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[191]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <Link href={`/${lang}/devis`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1.5px solid #FFFFFF", "textAlign": "center" }}>
                      <span>{t[192]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                    <a href="mailto:contact@sourcingpick.com" style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "transparent", "color": "#FFFFFF", "border": "1.5px solid rgba(255,255,255,0.28)", "textAlign": "center" }}>
                      <span><span dir="ltr">{t[193]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={{ "position": "absolute", "left": "-60px", "top": "6px", "maxWidth": "220px", "padding": "12px 16px", "borderRadius": "18px 18px 4px 18px", "background": "#FFFFFF", "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "600", "boxShadow": "0 16px 32px -16px rgba(14,26,61,0.5)", "boxSizing": "content-box" }}>
                    {t[194]}
                  </div>
                  <img src="/design/picky-arms-up.svg" alt={t[195]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
