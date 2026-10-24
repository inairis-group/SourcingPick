// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Livraisons.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/deliveries.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import type { Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { deliveries as content } from "../../content/deliveries";
import { Disclosure } from "../../disclosure";
import { SeaSimulator } from "../../sea-simulator";

export function DeliveriesBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
              <style>{t[0]}</style>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "640px" }}>
                <div style={s[0][lang]}>{t[1]}</div>
                <h1 style={s[1][lang]}>{t[2]}</h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "600px", "textWrap": "pretty" }}>
                  {t[3]}
                </p>
                <div style={{ "display": "flex", "gap": "14px", "flexWrap": "wrap", "paddingTop": "6px" }}>
                  <a href={sitePath(lang, "/devis")} style={s[2][lang]}>
                    <span>{t[4]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={v[0][lang]} />
                        <path d={v[1][lang]} />
                      </svg>
                    </span>
                  </a>
                  <a href="#simulateur" style={s[3][lang]}><span>{t[5]}</span></a>
                </div>
              </div>
              <div className="sp-hero-illustration" style={{ "flexShrink": "0", "width": "560px", "borderRadius": "28px", "overflow": "hidden", "border": "1px solid #DCE3F2", "boxShadow": "0 30px 60px -44px rgba(14,26,61,0.55)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 300" width="560" height="323" style={s[4][lang]} aria-hidden="true">
                  <defs>
                    <clipPath id="clip14"><rect width="520" height="300" rx="26" /></clipPath>
                  </defs>
                  <g clipPath="url(#clip14)">
                    <defs>
                      <linearGradient id="sky13" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#CFE0FF" />
                        <stop offset="1" stopColor="#F3F8FF" />
                      </linearGradient>
                    </defs>
                    <rect width="520" height="300" rx="26" fill="url(#sky13)" />
                    <circle cx="450" cy="74" r="32" fill="#FFC247" />
                    <circle className="cw-ring" cx="450" cy="74" r="32" fill="none" stroke="#FFC247" strokeWidth="3" />
                    <g className="cw-scroll-slow" style={{ "animationDuration": "22s" }}>
                      <g transform="translate(30 44) scale(1.0)" opacity="0.95">
                        <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                        <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                        <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                      </g>
                      <g transform="translate(260 32) scale(0.8)" opacity="0.95">
                        <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                        <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                        <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                      </g>
                      <g transform="translate(420 84) scale(0.9)" opacity="0.95">
                        <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                        <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                        <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                      </g>
                      <g transform="translate(550 48) scale(1.0)" opacity="0.95">
                        <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                        <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                        <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                      </g>
                      <g transform="translate(760 36) scale(0.8)" opacity="0.95">
                        <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                        <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                        <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                        <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                      </g>
                    </g>
                    <g className="cw-wavex" style={{ "animationDelay": "-0.6s" }}>
                      <path d="M-120 192.0 Q-90 183 -60 192.0 Q-30 201 0 192.0 Q30 183 60 192.0 Q90 201 120 192.0 Q150 183 180 192.0 Q210 201 240 192.0 Q270 183 300 192.0 Q330 201 360 192.0 Q390 183 420 192.0 Q450 201 480 192.0 Q510 183 540 192.0 Q570 201 600 192.0 Q630 183 660 192.0 L660 492.0 L-120 492.0Z" fill="#9DBFFF" opacity="1.0" />
                    </g>
                    <g transform="translate(239.2 177.4) scale(0.9)">
                      <g className="cw-rock" style={{ "transformOrigin": "0px 30px" }}>
                        <path d="M-176 -2 L172 -2 Q180 20 152 52 L-150 52 Q-170 30 -176 -2Z" fill="#162456" stroke="#162456" strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-168 30 L158 30 L152 42 L-160 42Z" fill="#C8364F" opacity="0.95" />
                        <path d="M-176 -2 L172 -2" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="3" />
                        <circle cx="-120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="-90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="-60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="-30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="0" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <circle cx="120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                        <rect x="-102" y="-23" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-93.38 -19.5 L-93.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-84.75 -19.5 L-84.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-76.12 -19.5 L-76.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-99 -19.8 L-70.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-66" y="-23" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-57.38 -19.5 L-57.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-48.75 -19.5 L-48.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-40.12 -19.5 L-40.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-63 -19.8 L-34.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-30" y="-23" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-21.38 -19.5 L-21.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-12.75 -19.5 L-12.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-4.12 -19.5 L-4.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-27 -19.8 L1.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="6" y="-23" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M14.62 -19.5 L14.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M23.25 -19.5 L23.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M31.88 -19.5 L31.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M9 -19.8 L37.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="42" y="-23" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M50.62 -19.5 L50.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M59.25 -19.5 L59.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M67.88 -19.5 L67.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M45 -19.8 L73.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="78" y="-23" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M86.62 -19.5 L86.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M95.25 -19.5 L95.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M103.88 -19.5 L103.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M81 -19.8 L109.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="114" y="-23" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M122.62 -19.5 L122.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M131.25 -19.5 L131.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M139.88 -19.5 L139.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M117 -19.8 L145.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-102" y="-44" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-93.38 -40.5 L-93.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-84.75 -40.5 L-84.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-76.12 -40.5 L-76.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-99 -40.8 L-70.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-66" y="-44" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-57.38 -40.5 L-57.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-48.75 -40.5 L-48.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-40.12 -40.5 L-40.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-63 -40.8 L-34.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-30" y="-44" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-21.38 -40.5 L-21.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-12.75 -40.5 L-12.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-4.12 -40.5 L-4.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-27 -40.8 L1.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="6" y="-44" width="34.5" height="19.5" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M14.62 -40.5 L14.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M23.25 -40.5 L23.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M31.88 -40.5 L31.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M9 -40.8 L37.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="42" y="-44" width="34.5" height="19.5" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M50.62 -40.5 L50.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M59.25 -40.5 L59.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M67.88 -40.5 L67.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M45 -40.8 L73.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="78" y="-44" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M86.62 -40.5 L86.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M95.25 -40.5 L95.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M103.88 -40.5 L103.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M81 -40.8 L109.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="114" y="-44" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M122.62 -40.5 L122.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M131.25 -40.5 L131.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M139.88 -40.5 L139.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M117 -40.8 L145.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-102" y="-65" width="34.5" height="19.5" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-93.38 -61.5 L-93.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-84.75 -61.5 L-84.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-76.12 -61.5 L-76.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-99 -61.8 L-70.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-66" y="-65" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-57.38 -61.5 L-57.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-48.75 -61.5 L-48.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-40.12 -61.5 L-40.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-63 -61.8 L-34.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-30" y="-65" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-21.38 -61.5 L-21.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-12.75 -61.5 L-12.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-4.12 -61.5 L-4.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-27 -61.8 L1.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="6" y="-65" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M14.62 -61.5 L14.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M23.25 -61.5 L23.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M31.88 -61.5 L31.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M9 -61.8 L37.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="42" y="-65" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M50.62 -61.5 L50.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M59.25 -61.5 L59.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M67.88 -61.5 L67.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M45 -61.8 L73.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="78" y="-65" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M86.62 -61.5 L86.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M95.25 -61.5 L95.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M103.88 -61.5 L103.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M81 -61.8 L109.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-102" y="-86" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-93.38 -82.5 L-93.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-84.75 -82.5 L-84.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-76.12 -82.5 L-76.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-99 -82.8 L-70.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-66" y="-86" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-57.38 -82.5 L-57.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-48.75 -82.5 L-48.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-40.12 -82.5 L-40.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-63 -82.8 L-34.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-30" y="-86" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M-21.38 -82.5 L-21.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-12.75 -82.5 L-12.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-4.12 -82.5 L-4.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M-27 -82.8 L1.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="6" y="-86" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M14.62 -82.5 L14.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M23.25 -82.5 L23.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M31.88 -82.5 L31.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M9 -82.8 L37.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="42" y="-86" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M50.62 -82.5 L50.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M59.25 -82.5 L59.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M67.88 -82.5 L67.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M45 -82.8 L73.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="78" y="-86" width="34.5" height="19.5" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                        <path d="M86.62 -82.5 L86.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M95.25 -82.5 L95.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M103.88 -82.5 L103.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                        <path d="M81 -82.8 L109.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                        <rect x="-170" y="-44" width="60" height="42" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-164" y="-66" width="48" height="24" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-172" y="-72" width="64" height="9" rx="3" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-158" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-142" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-126" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-160" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-144" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-128" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-150" y="-100" width="20" height="28" rx="3" fill="#FFC247" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                        <rect x="-150" y="-100" width="20" height="8" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                      </g>
                    </g>
                    <g className="cw-wavex" style={{ "animationDelay": "-1.7s" }}>
                      <path d="M-120 208.0 Q-90 197 -60 208.0 Q-30 219 0 208.0 Q30 197 60 208.0 Q90 219 120 208.0 Q150 197 180 208.0 Q210 219 240 208.0 Q270 197 300 208.0 Q330 219 360 208.0 Q390 197 420 208.0 Q450 219 480 208.0 Q510 197 540 208.0 Q570 219 600 208.0 Q630 197 660 208.0 L660 508.0 L-120 508.0Z" fill="#5B8DEF" opacity="1.0" />
                    </g>
                    <g className="cw-wavex" style={{ "animationDelay": "-0.2s" }}>
                      <path d="M-120 232.0 Q-90 219 -60 232.0 Q-30 245 0 232.0 Q30 219 60 232.0 Q90 245 120 232.0 Q150 219 180 232.0 Q210 245 240 232.0 Q270 219 300 232.0 Q330 245 360 232.0 Q390 219 420 232.0 Q450 245 480 232.0 Q510 219 540 232.0 Q570 245 600 232.0 Q630 219 660 232.0 L660 532.0 L-120 532.0Z" fill="#155DFC" opacity="1.0" />
                    </g>
                  </g>
                </svg>
              </div>
            </section>
            <section id="modes" style={{ "padding": "0 var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "var(--sp-gap-40, 40px)" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "16px", "maxWidth": "780px" }}>
                <div style={s[5][lang]}>{t[6]}</div>
                <h2 style={s[6][lang]}>{t[7]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                  {t[8]}
                </p>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r4, repeat(4, minmax(0, 1fr)))", "gap": "24px", "alignItems": "stretch" }}>
                <article style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "16px", "padding": "20px", "borderRadius": "24px", "background": "#F4FBF7", "border": "2px solid #1F8F55", "boxShadow": "0 24px 50px -40px rgba(14,26,61,0.5)" }}>
                  <div style={{ "borderRadius": "18px", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" width="242" height="144" style={s[7][lang]} aria-hidden="true">
                      <defs>
                        <clipPath id="clip16">
                          <rect width="320" height="190" rx="18" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#clip16)">
                        <defs>
                          <linearGradient id="sky15" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#CFE0FF" />
                            <stop offset="1" stopColor="#F3F8FF" />
                          </linearGradient>
                        </defs>
                        <rect width="320" height="190" rx="0" fill="url(#sky15)" />
                        <circle cx="258" cy="38.0" r="25" fill="#FFC247" />
                        <circle className="cw-ring" cx="258" cy="38.0" r="25" fill="none" stroke="#FFC247" strokeWidth="3" />
                        <g className="cw-scroll-slow" style={{ "animationDuration": "18s" }}>
                          <g transform="translate(40 38) scale(0.9)" opacity="0.95">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(210 22.8) scale(0.7)" opacity="0.95">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(400 49.4) scale(0.8)" opacity="0.95">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(560 26.6) scale(0.9)" opacity="0.95">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                        </g>
                        <g className="cw-wavex" style={{ "animationDelay": "-0.6s" }}>
                          <path d="M-120 117.8 Q-90 109.8 -60 117.8 Q-30 125.8 0 117.8 Q30 109.8 60 117.8 Q90 125.8 120 117.8 Q150 109.8 180 117.8 Q210 125.8 240 117.8 Q270 109.8 300 117.8 Q330 125.8 360 117.8 Q390 109.8 420 117.8 Q450 125.8 480 117.8 L480 307.8 L-120 307.8Z" fill="#9DBFFF" opacity="1.0" />
                        </g>
                        <g transform="translate(147.2 106) scale(0.7)">
                          <g className="cw-rock" style={{ "transformOrigin": "0px 30px" }}>
                            <path d="M-176 -2 L172 -2 Q180 20 152 52 L-150 52 Q-170 30 -176 -2Z" fill="#162456" stroke="#162456" strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-168 30 L158 30 L152 42 L-160 42Z" fill="#C8364F" opacity="0.95" />
                            <path d="M-176 -2 L172 -2" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="3" />
                            <circle cx="-120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="0" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <rect x="-102" y="-23" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -19.5 L-93.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -19.5 L-84.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -19.5 L-76.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -19.8 L-70.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-23" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -19.5 L-57.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -19.5 L-48.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -19.5 L-40.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -19.8 L-34.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-23" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -19.5 L-21.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -19.5 L-12.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -19.5 L-4.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -19.8 L1.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-23" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -19.5 L14.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -19.5 L23.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -19.5 L31.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -19.8 L37.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="42" y="-23" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M50.62 -19.5 L50.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M59.25 -19.5 L59.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M67.88 -19.5 L67.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M45 -19.8 L73.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="78" y="-23" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M86.62 -19.5 L86.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M95.25 -19.5 L95.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M103.88 -19.5 L103.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M81 -19.8 L109.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="114" y="-23" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M122.62 -19.5 L122.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M131.25 -19.5 L131.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M139.88 -19.5 L139.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M117 -19.8 L145.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-102" y="-44" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -40.5 L-93.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -40.5 L-84.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -40.5 L-76.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -40.8 L-70.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-44" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -40.5 L-57.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -40.5 L-48.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -40.5 L-40.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -40.8 L-34.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-44" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -40.5 L-21.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -40.5 L-12.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -40.5 L-4.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -40.8 L1.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-44" width="34.5" height="19.5" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -40.5 L14.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -40.5 L23.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -40.5 L31.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -40.8 L37.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="42" y="-44" width="34.5" height="19.5" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M50.62 -40.5 L50.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M59.25 -40.5 L59.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M67.88 -40.5 L67.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M45 -40.8 L73.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="78" y="-44" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M86.62 -40.5 L86.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M95.25 -40.5 L95.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M103.88 -40.5 L103.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M81 -40.8 L109.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="114" y="-44" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M122.62 -40.5 L122.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M131.25 -40.5 L131.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M139.88 -40.5 L139.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M117 -40.8 L145.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-102" y="-65" width="34.5" height="19.5" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -61.5 L-93.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -61.5 L-84.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -61.5 L-76.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -61.8 L-70.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-65" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -61.5 L-57.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -61.5 L-48.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -61.5 L-40.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -61.8 L-34.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-65" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -61.5 L-21.38 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -61.5 L-12.75 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -61.5 L-4.12 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -61.8 L1.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-65" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -61.5 L14.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -61.5 L23.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -61.5 L31.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -61.8 L37.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="42" y="-65" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M50.62 -61.5 L50.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M59.25 -61.5 L59.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M67.88 -61.5 L67.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M45 -61.8 L73.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="78" y="-65" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M86.62 -61.5 L86.62 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M95.25 -61.5 L95.25 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M103.88 -61.5 L103.88 -49" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M81 -61.8 L109.5 -61.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-102" y="-86" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -82.5 L-93.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -82.5 L-84.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -82.5 L-76.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -82.8 L-70.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-86" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -82.5 L-57.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -82.5 L-48.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -82.5 L-40.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -82.8 L-34.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-86" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -82.5 L-21.38 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -82.5 L-12.75 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -82.5 L-4.12 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -82.8 L1.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-86" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -82.5 L14.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -82.5 L23.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -82.5 L31.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -82.8 L37.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="42" y="-86" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M50.62 -82.5 L50.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M59.25 -82.5 L59.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M67.88 -82.5 L67.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M45 -82.8 L73.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="78" y="-86" width="34.5" height="19.5" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M86.62 -82.5 L86.62 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M95.25 -82.5 L95.25 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M103.88 -82.5 L103.88 -70" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M81 -82.8 L109.5 -82.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-170" y="-44" width="60" height="42" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-164" y="-66" width="48" height="24" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-172" y="-72" width="64" height="9" rx="3" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-158" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-142" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-126" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-160" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-144" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-128" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-150" y="-100" width="20" height="28" rx="3" fill="#FFC247" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-150" y="-100" width="20" height="8" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                          </g>
                        </g>
                        <g className="cw-wavex" style={{ "animationDelay": "-1.7s" }}>
                          <path d="M-120 129.8 Q-90 119.8 -60 129.8 Q-30 139.8 0 129.8 Q30 119.8 60 129.8 Q90 139.8 120 129.8 Q150 119.8 180 129.8 Q210 139.8 240 129.8 Q270 119.8 300 129.8 Q330 139.8 360 129.8 Q390 119.8 420 129.8 Q450 139.8 480 129.8 L480 319.8 L-120 319.8Z" fill="#5B8DEF" opacity="1.0" />
                        </g>
                        <g className="cw-wavex" style={{ "animationDelay": "-0.2s" }}>
                          <path d="M-120 147.8 Q-90 135.8 -60 147.8 Q-30 159.8 0 147.8 Q30 135.8 60 147.8 Q90 159.8 120 147.8 Q150 135.8 180 147.8 Q210 159.8 240 147.8 Q270 135.8 300 147.8 Q330 159.8 360 147.8 Q390 135.8 420 147.8 Q450 159.8 480 147.8 L480 337.8 L-120 337.8Z" fill="#155DFC" opacity="1.0" />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#D6F3FA", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 16l2 4h14l2-4z" />
                        <path d="M6 16V9h12v7" />
                        <path d="M10 9V5h4v4" />
                      </svg>
                    </span>
                    <h3 style={s[8][lang]}>{t[9]}</h3>
                  </div>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "alignSelf": "flex-start", "padding": "3px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#E3F6EC", "color": "#1F8F55" }}>
                    {t[10]}
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                    <span style={{ "fontSize": "12.5px", "color": "#4A5578" }}>{t[11]}</span>
                    <div style={{ "display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap" }}>
                      <span style={s[9][lang]}>{t[12]}</span>
                      <span style={s[10][lang]}>{t[13]}</span>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[14]}
                  </p>
                </article>
                <article style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "16px", "padding": "20px", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 24px 50px -40px rgba(14,26,61,0.5)" }}>
                  <div style={{ "borderRadius": "18px", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" width="242" height="144" style={s[11][lang]} aria-hidden="true">
                      <defs>
                        <clipPath id="clip18">
                          <rect width="320" height="190" rx="18" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#clip18)">
                        <defs>
                          <linearGradient id="sky17" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#9DBFFF" />
                            <stop offset="1" stopColor="#EAF1FF" />
                          </linearGradient>
                        </defs>
                        <rect width="320" height="190" rx="0" fill="url(#sky17)" />
                        <g className="cw-scroll" style={{ "animationDuration": "10s" }}>
                          <g transform="translate(100 87.4) scale(0.55)" opacity="0.8">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#E3EDFF" />
                            <circle cx="21" cy="-8" r="19" fill="#E3EDFF" />
                            <circle cx="45" cy="0" r="14" fill="#E3EDFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#E3EDFF" />
                          </g>
                          <g transform="translate(330 68.4) scale(0.5)" opacity="0.8">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#E3EDFF" />
                            <circle cx="21" cy="-8" r="19" fill="#E3EDFF" />
                            <circle cx="45" cy="0" r="14" fill="#E3EDFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#E3EDFF" />
                          </g>
                          <g transform="translate(560 95) scale(0.6)" opacity="0.8">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#E3EDFF" />
                            <circle cx="21" cy="-8" r="19" fill="#E3EDFF" />
                            <circle cx="45" cy="0" r="14" fill="#E3EDFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#E3EDFF" />
                          </g>
                        </g>
                        <path d="M22 79.8 L68 79.8" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="46 40" className="cw-dash" style={{ "animationDuration": "0.6s" }} />
                        <path d="M46 110.19999999999999 L92 110.19999999999999" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="46 40" className="cw-dash" style={{ "animationDuration": "0.75s" }} />
                        <path d="M14 133.0 L60 133.0" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="46 40" className="cw-dash" style={{ "animationDuration": "0.8999999999999999s" }} />
                        <g className="cw-scroll" style={{ "animationDuration": "6s" }}>
                          <g transform="translate(20 148.2) scale(0.8)" opacity="0.9">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(190 38) scale(0.6)" opacity="0.9">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(330 133) scale(0.9)" opacity="0.9">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(500 30.4) scale(0.7)" opacity="0.9">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                          <g transform="translate(700 155.8) scale(0.8)" opacity="0.9">
                            <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                            <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                            <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                            <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                          </g>
                        </g>
                        <g transform="translate(176 95) scale(0.64) rotate(-6)">
                          <g className="cw-sway">
                            <polygon points="-122,-4 -168,4 -156,12 -100,4" fill="#B8C4E6" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <polygon points="-40,14 -98,66 -60,66 46,14" fill="#C9D6F2" stroke="#162456" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
                            <ellipse cx="-34" cy="42" rx="22" ry="10" fill="#FFFFFF" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <ellipse cx="-14" cy="42" rx="5" ry="8.5" fill="#162456" />
                            <path d="M-158 -18 L-120 -24 L96 -24 Q158 -22 168 2 Q156 24 98 24 L-112 24 Q-144 16 -158 -18Z" fill="#FFFFFF" stroke="#162456" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-116 12 L100 12 L100 18 L-112 18Z" fill="#155DFC" opacity="0.95" />
                            <path d="M-142 -14 Q-150 8 -118 22" fill="none" stroke="#162456" strokeWidth="0" />
                            <polygon points="-148,-16 -170,-76 -142,-76 -100,-24" fill="#155DFC" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <polygon points="-166,-64 -150,-64 -146,-76 -170,-76" fill="#FFC247" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M132 -17 Q150 -14 156 -2 L128 -2 Q122 -10 132 -17Z" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="96" cy="-9" r="2.8" fill="#8DB2FF" stroke="#162456" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="82" cy="-9" r="2.8" fill="#8DB2FF" stroke="#162456" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="68" cy="-9" r="2.8" fill="#8DB2FF" stroke="#162456" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-62" y="-17" width="60" height="28" rx="2" fill="none" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" strokeOpacity="0.45" />
                            <path d="M-32 -17 L-32 11" stroke="#162456" strokeWidth="2.2" strokeLinecap="round" opacity="0.45" />
                            <polygon points="-6,18 -70,72 -30,72 70,18" fill="#DCE5F8" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <ellipse cx="-6" cy="48" rx="24" ry="11" fill="#FFFFFF" stroke="#162456" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
                            <ellipse cx="14" cy="48" rx="5.5" ry="9" fill="#162456" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#E4EDFF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.5 4.5l-.5 6L3 14.5v2l7-2 .5 4-2 1.5V21l3.5-.9 3.5.9v-1.5l-2-1.5.5-4 7 2v-2l-7-4-.5-6a1.5 1.5 0 00-3 0z" />
                      </svg>
                    </span>
                    <h3 style={s[12][lang]}>{t[15]}</h3>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                    <span style={{ "fontSize": "12.5px", "color": "#4A5578" }}>{t[16]}</span>
                    <div style={{ "display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap" }}>
                      <span style={s[13][lang]}>{t[17]}</span>
                      <span style={s[14][lang]}>{t[18]}</span>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[19]}
                  </p>
                </article>
                <article style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "16px", "padding": "20px", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 24px 50px -40px rgba(14,26,61,0.5)" }}>
                  <div style={{ "borderRadius": "18px", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" width="242" height="144" style={s[15][lang]} aria-hidden="true">
                      <defs>
                        <clipPath id="clip20">
                          <rect width="320" height="190" rx="18" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#clip20)">
                        <defs>
                          <linearGradient id="sky19" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#CFE0FF" />
                            <stop offset="1" stopColor="#F3F8FF" />
                          </linearGradient>
                        </defs>
                        <rect width="320" height="190" rx="0" fill="url(#sky19)" />
                        <g className="cw-scroll-slow">
                          <path d="M0 114.6 Q60 62.599999999999994 120 114.6 Q180 44.599999999999994 240 114.6 Q300 62.599999999999994 360 114.6 Q420 44.599999999999994 480 114.6 Q540 62.599999999999994 600 114.6 Q660 44.599999999999994 720 114.6 Q780 62.599999999999994 840 114.6 L800 234.6 L0 234.6Z" fill="#CFE0FF" />
                        </g>
                        <g transform="translate(60 41.8) scale(0.8)" opacity="1.0">
                          <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                          <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                          <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                        </g>
                        <g transform="translate(230 26.6) scale(0.6)" opacity="1.0">
                          <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                          <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                          <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                        </g>
                        <g className="cw-scroll" style={{ "animationDuration": "6.5s" }}>
                          <g transform="translate(30 112.6) scale(0.9)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(150 112.6) scale(0.7)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(270 112.6) scale(1.0)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(390 112.6) scale(0.8)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(510 112.6) scale(0.9)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(210 112.6) scale(1.0)">
                            <path d="M-9 0 L0 -62 L9 0 M-6 -20 L6 -20 M-4 -40 L4 -40 M-16 -52 L16 -52" fill="none" stroke="#162456" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                          </g>
                          <g transform="translate(450 112.6) scale(0.9)">
                            <path d="M-9 0 L0 -62 L9 0 M-6 -20 L6 -20 M-4 -40 L4 -40 M-16 -52 L16 -52" fill="none" stroke="#162456" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                          </g>
                        </g>
                        <rect x="0" y="110.6" width="320" height="30" fill="#8BC98A" />
                        <rect x="0" y="140.6" width="320" height="49.400000000000006" fill="#3A4A7A" />
                        <path d="M0 140.6 L320 140.6" stroke="#162456" strokeWidth="4" />
                        <path d="M0 165.3 L320 165.3" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeDasharray="26 22" className="cw-dash" style={{ "animationDuration": "0.55s" }} />
                        <g transform="translate(176 182.1) scale(0.6)">
                          <g className="cw-jolt">
                            <rect x="-176" y="-17" width="224" height="11" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-176" y="-104" width="212" height="86" rx="2" fill="#1F4FD8" stroke="#162456" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-168.93 -100.5 L-168.93 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-161.87 -100.5 L-161.87 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-154.8 -100.5 L-154.8 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-147.73 -100.5 L-147.73 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-140.67 -100.5 L-140.67 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-133.6 -100.5 L-133.6 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-126.53 -100.5 L-126.53 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-119.47 -100.5 L-119.47 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-112.4 -100.5 L-112.4 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-105.33 -100.5 L-105.33 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-98.27 -100.5 L-98.27 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-91.2 -100.5 L-91.2 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.13 -100.5 L-84.13 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-77.07 -100.5 L-77.07 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-70 -100.5 L-70 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-62.93 -100.5 L-62.93 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-55.87 -100.5 L-55.87 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.8 -100.5 L-48.8 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-41.73 -100.5 L-41.73 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-34.67 -100.5 L-34.67 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27.6 -100.5 L-27.6 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-20.53 -100.5 L-20.53 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-13.47 -100.5 L-13.47 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-6.4 -100.5 L-6.4 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M0.67 -100.5 L0.67 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M7.73 -100.5 L7.73 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M14.8 -100.5 L14.8 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M21.87 -100.5 L21.87 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M28.93 -100.5 L28.93 -21.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-173 -100.8 L33 -100.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <path d="M-170 -62 L30 -62" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
                            <polygon points="48,-6 48,-88 96,-88 120,-54 126,-54 126,-6" fill="#FFC247" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                            <polygon points="56,-80 92,-80 110,-56 56,-56" fill="#8DB2FF" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="112" y="-50" width="14" height="12" rx="2" fill="#DCE5F8" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="121" cy="-26" r="4" fill="#FFF4C2" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="44" y="-118" width="7" height="32" rx="1.5" fill="#B8C4E6" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="126" y="-12" width="8" height="8" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-134" cy="-14" r="15" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-134" cy="-14" r="6.75" fill="#B8C4E6" />
                            <circle cx="-98" cy="-14" r="15" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-98" cy="-14" r="6.75" fill="#B8C4E6" />
                            <circle cx="-62" cy="-14" r="15" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-62" cy="-14" r="6.75" fill="#B8C4E6" />
                            <circle cx="72" cy="-14" r="15" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="72" cy="-14" r="6.75" fill="#B8C4E6" />
                            <circle cx="106" cy="-14" r="15" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="106" cy="-14" r="6.75" fill="#B8C4E6" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#FFEBC2", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h11v10H3z" />
                        <path d="M14 10h4l3 3v3h-7" />
                        <circle cx="7" cy="18" r="2" />
                        <circle cx="17" cy="18" r="2" />
                      </svg>
                    </span>
                    <h3 style={s[16][lang]}>{t[20]}</h3>
                  </div>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "alignSelf": "flex-start", "padding": "3px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FBE7EB", "color": "#C8364F" }}>
                    {t[21]}
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                    <span style={{ "fontSize": "12.5px", "color": "#4A5578" }}>{t[22]}</span>
                    <div style={{ "display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap" }}>
                      <span style={s[17][lang]}>{t[23]}</span>
                      <span style={s[18][lang]}>{t[24]}</span>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[25]}
                  </p>
                </article>
                <article style={{ "position": "relative", "display": "flex", "flexDirection": "column", "gap": "16px", "padding": "20px", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 24px 50px -40px rgba(14,26,61,0.5)" }}>
                  <div style={{ "borderRadius": "18px", "overflow": "hidden" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" width="242" height="144" style={s[19][lang]} aria-hidden="true">
                      <defs>
                        <clipPath id="clip22">
                          <rect width="320" height="190" rx="18" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#clip22)">
                        <defs>
                          <linearGradient id="sky21" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#CFE0FF" />
                            <stop offset="1" stopColor="#F3F8FF" />
                          </linearGradient>
                        </defs>
                        <rect width="320" height="190" rx="0" fill="url(#sky21)" />
                        <g className="cw-scroll-slow">
                          <path d="M0 126.20000000000002 Q60 74.20000000000002 120 126.20000000000002 Q180 56.20000000000002 240 126.20000000000002 Q300 74.20000000000002 360 126.20000000000002 Q420 56.20000000000002 480 126.20000000000002 Q540 74.20000000000002 600 126.20000000000002 Q660 56.20000000000002 720 126.20000000000002 Q780 74.20000000000002 840 126.20000000000002 L800 246.20000000000002 L0 246.20000000000002Z" fill="#D7E4FF" />
                        </g>
                        <g transform="translate(70 38) scale(0.8)" opacity="1.0">
                          <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                          <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                          <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                        </g>
                        <g transform="translate(250 22.8) scale(0.6)" opacity="1.0">
                          <circle cx="0" cy="0" r="15" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="21" cy="-8" r="19" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="45" cy="0" r="14" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#162456" stroke="#162456" strokeWidth="6.4" strokeLinejoin="round" />
                          <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
                          <circle cx="21" cy="-8" r="19" fill="#FFFFFF" />
                          <circle cx="45" cy="0" r="14" fill="#FFFFFF" />
                          <rect x="-8" y="-2" width="62" height="17" rx="8.5" fill="#FFFFFF" />
                        </g>
                        <g className="cw-scroll" style={{ "animationDuration": "7s" }}>
                          <g transform="translate(40 128.2) scale(0.8)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(190 128.2) scale(1.0)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#14A05A" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(330 128.2) scale(0.7)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#2FCB73" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                          <g transform="translate(500 128.2) scale(0.9)">
                            <path d="M0 0 L0 -26" stroke="#162456" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="0" cy="-36" r="15" fill="#14A05A" stroke="#162456" strokeWidth="4" />
                            <circle cx="-5" cy="-41" r="4.5" fill="#FFFFFF" fillOpacity="0.35" />
                          </g>
                        </g>
                        <rect x="0" y="128.20000000000002" width="320" height="61.79999999999998" fill="#8BC98A" />
                        <g className="cw-ties">
                          <rect x="-28" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="0" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="28" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="56" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="84" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="112" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="140" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="168" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="196" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="224" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="252" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="280" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="308" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="336" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                          <rect x="364" y="144.20000000000002" width="12" height="28" rx="2" fill="#7A5A3E" stroke="#162456" strokeWidth="2.6" />
                        </g>
                        <rect x="0" y="142.20000000000002" width="380" height="8" fill="#B8C4E6" stroke="#162456" strokeWidth="3" />
                        <rect x="0" y="162.20000000000002" width="380" height="7" fill="#B8C4E6" stroke="#162456" strokeWidth="3" />
                        <g transform="translate(180.4 154.2) scale(0.55)">
                          <g className="cw-jolt">
                            <polygon points="44,-12 44,-72 142,-72 174,-44 174,-12" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="50" y="-66" width="44" height="26" rx="3" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <polygon points="100,-66 136,-66 150,-46 100,-46" fill="#8DB2FF" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="40" y="-78" width="106" height="8" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M44 -28 L174 -28" stroke="#FFC247" strokeWidth="5" strokeLinecap="round" opacity="1.0" />
                            <rect x="150" y="-86" width="12" height="14" rx="1.5" fill="#B8C4E6" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="44" y="-12" width="130" height="11" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="62" cy="-6" r="10" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="62" cy="-6" r="4.5" fill="#B8C4E6" />
                            <circle cx="92" cy="-6" r="10" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="92" cy="-6" r="4.5" fill="#B8C4E6" />
                            <circle cx="122" cy="-6" r="10" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="122" cy="-6" r="4.5" fill="#B8C4E6" />
                            <circle cx="152" cy="-6" r="10" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="152" cy="-6" r="4.5" fill="#B8C4E6" />
                            <rect x="-94" y="-22" width="118" height="9" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-90" y="-55" width="54" height="33" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-82.29 -51.5 L-82.29 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-74.57 -51.5 L-74.57 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-66.86 -51.5 L-66.86 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-59.14 -51.5 L-59.14 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-51.43 -51.5 L-51.43 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-43.71 -51.5 L-43.71 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-87 -51.8 L-39 -51.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-34" y="-55" width="54" height="33" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-26.29 -51.5 L-26.29 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-18.57 -51.5 L-18.57 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-10.86 -51.5 L-10.86 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-3.14 -51.5 L-3.14 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M4.57 -51.5 L4.57 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M12.29 -51.5 L12.29 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-31 -51.8 L17 -51.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <circle cx="-76" cy="-6" r="9" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-76" cy="-6" r="4.05" fill="#B8C4E6" />
                            <circle cx="6" cy="-6" r="9" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="6" cy="-6" r="4.05" fill="#B8C4E6" />
                            <path d="M24 -17 L36 -17" stroke="#162456" strokeWidth="3" strokeLinecap="round" opacity="1.0" />
                            <rect x="-224" y="-22" width="118" height="9" rx="2" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-220" y="-55" width="54" height="33" rx="2" fill="#C8364F" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-212.29 -51.5 L-212.29 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-204.57 -51.5 L-204.57 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-196.86 -51.5 L-196.86 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-189.14 -51.5 L-189.14 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-181.43 -51.5 L-181.43 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-173.71 -51.5 L-173.71 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-217 -51.8 L-169 -51.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-164" y="-55" width="54" height="33" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-156.29 -51.5 L-156.29 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-148.57 -51.5 L-148.57 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-140.86 -51.5 L-140.86 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-133.14 -51.5 L-133.14 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-125.43 -51.5 L-125.43 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-117.71 -51.5 L-117.71 -25.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-161 -51.8 L-113 -51.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <circle cx="-206" cy="-6" r="9" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-206" cy="-6" r="4.05" fill="#B8C4E6" />
                            <circle cx="-124" cy="-6" r="9" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="-124" cy="-6" r="4.05" fill="#B8C4E6" />
                            <path d="M-106 -17 L-94 -17" stroke="#162456" strokeWidth="3" strokeLinecap="round" opacity="1.0" />
                            <path d="M44 -17 L36 -17" stroke="#162456" strokeWidth="3" strokeLinecap="round" opacity="1.0" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                    <span style={{ "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#E6DEFF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="5" y="3" width="14" height="14" rx="3" />
                        <path d="M5 11h14" />
                        <path d="M9 7h6" />
                        <path d="M9 20l-2 2" />
                        <path d="M15 20l2 2" />
                        <path d="M9 14.2h.01" />
                        <path d="M15 14.2h.01" />
                      </svg>
                    </span>
                    <h3 style={s[20][lang]}>{t[26]}</h3>
                  </div>
                  <span style={{ "display": "inline-flex", "alignItems": "center", "alignSelf": "flex-start", "padding": "3px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FBE7EB", "color": "#C8364F" }}>
                    {t[27]}
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                    <span style={{ "fontSize": "12.5px", "color": "#4A5578" }}>{t[28]}</span>
                    <div style={{ "display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap" }}>
                      <span style={s[21][lang]}>{t[29]}</span>
                      <span style={s[22][lang]}>{t[30]}</span>
                    </div>
                  </div>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.55", "color": "#4A5578" }}>
                    {t[31]}
                  </p>
                </article>
              </div>
              <p style={{ "margin": "0", "maxWidth": "900px", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#4A5578" }}>
                {t[32]}
              </p>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "36px" }}>
              <style>{t[33]}</style>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "maxWidth": "980px" }}>
                <div style={s[23][lang]}>{t[34]}</div>
                <h2 style={s[24][lang]}>{t[35]}</h2>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "760px" }}>
                  {t[36]}
                </p>
              </div>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-600, minmax(0, 1fr) 600px)", "gap": "24px", "alignItems": "start" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "padding": "var(--sp-pad-28-30, 28px 30px)", "borderRadius": "24px", "background": "#162456", "color": "#FFFFFF" }}>
                    <span style={s[25][lang]}>{t[37]}</span>
                    <span style={s[26][lang]}>{t[38]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.5", "color": "#C6D2EE" }}>
                      {t[39]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px", "padding": "var(--sp-pad-28-30, 28px 30px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                    <span style={s[27][lang]}>{t[40]}</span>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "38px", "height": "38px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#0E1A3D" }}>
                          {t[41]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[42]}
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
                          {t[43]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[44]}
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
                          {t[45]}
                        </span>
                        <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                          {t[46]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sp-scheme" role="img" aria-label={t[47]} style={{ "position": "relative", "width": "600px", "height": "548px", "borderRadius": "26px", "overflow": "hidden", "border": "1px solid #DCE3F2", "backgroundColor": "#E9F0FF", "backgroundImage": "linear-gradient(0deg, rgba(21,93,252,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,93,252,0.07) 1px, transparent 1px)", "backgroundSize": "36px 36px" }}>
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
                          {t[48]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[49]}
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
                          {t[50]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[51]}
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
                          {t[52]}
                        </span>
                        <span style={{ "fontSize": "12px", "color": "#4A5578" }}>
                          {t[53]}
                        </span>
                      </span>
                    </div>
                    <div style={{ "position": "absolute", "left": "300px", "top": "411px", "transform": "translate(-50%, -54%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "6px" }}>
                      <span style={{ "display": "inline-flex", "borderRadius": "50%", "boxShadow": "0 0 0 10px rgba(255,194,71,0.35)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="96" height="96" style={s[28][lang]} aria-hidden="true">
                          <defs>
                            <clipPath id="cp-cp23">
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
                          {t[54]}
                        </span>
                        <span style={{ "fontSize": "12px", "fontWeight": "600" }}>
                          {t[55]}
                        </span>
                      </span>
                    </div>
                    <span style={s[29][lang]}>{t[56]}</span>
                  </div>
                </div>
              </div>
            </section>
            <SeaSimulator id="simulateur" style={{ "padding": "0 var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))" }} lang={lang} />
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))" }}>
              <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-560, minmax(0, 1fr) 560px)", "gap": "var(--sp-gap-56, 56px)", "alignItems": "center", "padding": "var(--sp-pad-56, 56px)", "borderRadius": "32px", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                    <div style={s[52][lang]}>{t[111]}</div>
                    <h2 style={s[53][lang]}>{t[112]}</h2>
                    <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.6", "color": "#C6D2EE" }}>
                      {t[113]}
                    </p>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                    <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                      <span style={s[54][lang]}>{t[114]}</span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                          {t[115]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                          {t[116]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                      <span style={s[55][lang]}>{t[117]}</span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                          {t[118]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                          {t[119]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.14)", "border": "1px solid rgba(255,255,255,0.34)" }}>
                      <span style={s[56][lang]}>{t[120]}</span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                          {t[121]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                          {t[122]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "18px 20px", "borderRadius": "18px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)" }}>
                      <span style={s[57][lang]}>{t[123]}</span>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "fontSize": "var(--sp-fs-17, 17px)", "fontWeight": "600", "color": "#FFFFFF" }}>
                          {t[124]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "lineHeight": "1.5", "color": "#B8C4E6" }}>
                          {t[125]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a href="/connexion" style={s[58][lang]}>
                      <span>{t[126]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[8][lang]} />
                          <path d={v[9][lang]} />
                        </svg>
                      </span>
                    </a>
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "padding": "var(--sp-pad-26, 26px)", "borderRadius": "24px", "background": "#FFFFFF", "color": "#0E1A3D", "boxShadow": "0 30px 60px -40px rgba(0,0,0,0.6)" }}>
                    <div style={{ "display": "flex", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px" }}>
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={s[59][lang]}>{t[127]}</span>
                        <span style={s[60][lang]}>{t[128]}</span>
                      </div>
                      <span className="sp-placeholder" style={s[61][lang]}>{t[129]}</span>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                      <span style={{ "display": "inline-flex", "alignItems": "center", "gap": "7px", "padding": "5px 12px", "borderRadius": "999px", "background": "#0B7FA814", "color": "#0B7FA8", "fontSize": "13px", "fontWeight": "600" }}>
                        <span style={{ "width": "7px", "height": "7px", "borderRadius": "50%", "background": "#0B7FA8" }} />
                        {t[130]}
                      </span>
                      <span style={{ "fontSize": "14px", "color": "#4A5578" }}>
                        {t[131]}
                      </span>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508 92" width="508" height="92" style={s[62][lang]} aria-hidden="true">
                        <path d="M28 64.39999999999999 L480 64.39999999999999" stroke="#CBD5E8" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 12" className="cw-dash" />
                        <path d="M28 64.39999999999999 L263.04 64.39999999999999" stroke="#155DFC" strokeWidth="5.5" strokeLinecap="round" />
                        <circle cx="28" cy="64.39999999999999" r="11" fill="#FFFFFF" stroke="#162456" strokeWidth="4" />
                        <circle cx="28" cy="64.39999999999999" r="4.6" fill="#155DFC" />
                        <circle cx="480" cy="64.39999999999999" r="11" fill="#FFFFFF" stroke="#162456" strokeWidth="4" />
                        <circle cx="480" cy="64.39999999999999" r="4.6" fill="#1F8F55" />
                        <g transform="translate(263.04 60.4) scale(0.3)">
                          <g className="cw-rock" style={{ "transformOrigin": "0px 30px" }}>
                            <path d="M-176 -2 L172 -2 Q180 20 152 52 L-150 52 Q-170 30 -176 -2Z" fill="#162456" stroke="#162456" strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-168 30 L158 30 L152 42 L-160 42Z" fill="#C8364F" opacity="0.95" />
                            <path d="M-176 -2 L172 -2" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="3" />
                            <circle cx="-120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="-30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="0" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="30" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="60" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="90" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <circle cx="120" cy="12" r="3.6" fill="#8DB2FF" stroke="#162456" strokeWidth="2" />
                            <rect x="-102" y="-23" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -19.5 L-93.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -19.5 L-84.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -19.5 L-76.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -19.8 L-70.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-23" width="34.5" height="19.5" rx="2" fill="#EAF1FF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -19.5 L-57.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -19.5 L-48.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -19.5 L-40.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -19.8 L-34.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-23" width="34.5" height="19.5" rx="2" fill="#1F8F55" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -19.5 L-21.38 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -19.5 L-12.75 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -19.5 L-4.12 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -19.8 L1.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-23" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -19.5 L14.62 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -19.5 L23.25 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -19.5 L31.88 -7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -19.8 L37.5 -19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-102" y="-44" width="34.5" height="19.5" rx="2" fill="#FFC247" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-93.38 -40.5 L-93.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-84.75 -40.5 L-84.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-76.12 -40.5 L-76.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-99 -40.8 L-70.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-66" y="-44" width="34.5" height="19.5" rx="2" fill="#5B8DEF" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-57.38 -40.5 L-57.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-48.75 -40.5 L-48.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-40.12 -40.5 L-40.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-63 -40.8 L-34.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-30" y="-44" width="34.5" height="19.5" rx="2" fill="#155DFC" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M-21.38 -40.5 L-21.38 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-12.75 -40.5 L-12.75 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-4.12 -40.5 L-4.12 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M-27 -40.8 L1.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="6" y="-44" width="34.5" height="19.5" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
                            <path d="M14.62 -40.5 L14.62 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M23.25 -40.5 L23.25 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M31.88 -40.5 L31.88 -28" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
                            <path d="M9 -40.8 L37.5 -40.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                            <rect x="-170" y="-44" width="60" height="42" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-164" y="-66" width="48" height="24" rx="4" fill="#FFFFFF" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-172" y="-72" width="64" height="9" rx="3" fill="#162456" stroke="#162456" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-158" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-142" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-126" y="-58" width="10" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-160" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-144" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-128" y="-35" width="9" height="9" rx="2" fill="#8DB2FF" stroke="#162456" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-150" y="-100" width="20" height="28" rx="3" fill="#FFC247" stroke="#162456" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
                            <rect x="-150" y="-100" width="20" height="8" rx="2" fill="#162456" stroke="#162456" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
                          </g>
                        </g>
                      </svg>
                      <div style={s[63][lang]}>
                        <span>{t[132]}</span>
                        <span>{t[133]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-420-fr, 420px minmax(0, 1fr))", "gap": "var(--sp-gap-80, 80px)", "alignItems": "start" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
                <h2 style={s[64][lang]}>{t[134]}</h2>
                <div style={{ "width": "220px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="220" height="220" style={s[65][lang]} aria-hidden="true">
                    <defs>
                      <clipPath id="cp-cp32">
                        <rect width="240" height="240" rx="48" />
                      </clipPath>
                    </defs>
                    <rect width="240" height="240" rx="48" fill="#EAF1FF" />
                    <ellipse cx="120" cy="208" rx="84" ry="6" fill="#162456" fillOpacity="0.08" />
                    <path d="M40 62 Q40 46 56 46 L150 46 Q166 46 166 62 L166 112 Q166 128 150 128 L84 128 L58 152 L60 128 L56 128 Q40 128 40 112Z" fill="#155DFC" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                    <circle cx="78" cy="87" r="7" fill="#FFFFFF" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                    <circle cx="103" cy="87" r="7" fill="#FFFFFF" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                    <circle cx="128" cy="87" r="7" fill="#FFFFFF" stroke="#162456" strokeWidth="0" strokeLinejoin="round" strokeLinecap="round" />
                    <path d="M92 116 Q92 100 108 100 L188 100 Q204 100 204 116 L204 164 Q204 180 188 180 L182 180 L184 202 L160 180 L108 180 Q92 180 92 164Z" fill="#FFFFFF" stroke="#162456" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
                    <path d="M110 130 L184 130" stroke="#162456" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
                    <path d="M110 148 L168 148" stroke="#162456" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
                    <path d="M110 164 L150 164" stroke="#162456" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </div>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "borderTop": "1px solid #DCE3F2" }}>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[66][lang]} aria-expanded="true">
                    <span>{t[135]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </span>
                  </button>
                  <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                    {t[136]}
                  </p>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[67][lang]} aria-expanded="false">
                    <span>{t[137]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d={v[10][lang]} />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[68][lang]} aria-expanded="false">
                    <span>{t[138]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d={v[11][lang]} />
                      </svg>
                    </span>
                  </button>
                </Disclosure>
                <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "22px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                  <button type="button" style={s[69][lang]} aria-expanded="false">
                    <span>{t[139]}</span>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d={v[12][lang]} />
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
                  <h2 style={s[70][lang]}>{t[140]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#E3EBFF" }}>
                    {t[141]}
                  </p>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "center", "flexWrap": "wrap" }}>
                    <a href={sitePath(lang, "/devis")} style={s[71][lang]}>
                      <span>{t[142]}</span>
                      <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={v[13][lang]} />
                          <path d={v[14][lang]} />
                        </svg>
                      </span>
                    </a>
                    <a href="mailto:contact@sourcingpick.com" style={s[72][lang]}>
                      <span><span dir="ltr">{t[143]}</span></span>
                    </a>
                  </div>
                </div>
                <div className="sp-cta-mascot" style={{ "position": "relative", "width": "300px", "height": "300px", "flexShrink": "0" }}>
                  <div style={s[73][lang]}>{t[144]}</div>
                  <img src="/design/picky-arms-up.svg" alt={t[145]} style={{ "width": "300px", "height": "auto", "maxWidth": "100%" }} />
                </div>
              </div>
            </section>
    </>
  );
}
