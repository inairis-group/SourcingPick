// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-FAQ.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/faq.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import type { Locale } from "@/lib/i18n/config";
import { faq as content } from "../../content/faq";
import { Disclosure } from "../../disclosure";
import { FaqCategories } from "../../faq-categories";

export function FaqBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;

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
              <div className="sp-hero-figure" style={{ "flexShrink": "0", "width": "300px", "height": "300px", "borderRadius": "28px", "background": "#EEF3FF", "border": "1px solid #DCE3F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden" }}>
                <img src="/design/picky-loupe.svg" alt="" style={{ "width": "260px", "height": "auto", "objectFit": "contain", "maxWidth": "100%" }} />
              </div>
            </section>
            <FaqCategories style={{ "padding": "0 var(--sp-gutter, 120px) calc(24px * var(--sp-vs, 1))", "display": "flex", "gap": "10px", "flexWrap": "wrap" }}>
              <a href="#faq-group-1" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#0E1A3D", "color": "#FFFFFF", "border": "1px solid #0E1A3D" }}>
                {t[3]}
              </a>
              <a href="#faq-group-2" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                {t[4]}
              </a>
              <a href="#faq-group-3" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                {t[5]}
              </a>
              <a href="#faq-group-4" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                {t[6]}
              </a>
              <a href="#faq-group-5" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                {t[7]}
              </a>
              <a href="#faq-group-6" data-pk="inert" style={{ "display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "999px", "fontSize": "15px", "fontWeight": "600", "whiteSpace": "nowrap", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1px solid #DCE3F2" }}>
                {t[8]}
              </a>
            </FaqCategories>
            <section style={{ "padding": "calc(16px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))" }}>
              <div className="sp-faq-group" id="faq-group-1" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[2][lang]}>{t[9]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[3][lang]} aria-expanded="true">
                      <span>{t[10]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[11]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[4][lang]} aria-expanded="true">
                      <span>{t[12]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[13]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[5][lang]} aria-expanded="true">
                      <span>{t[14]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[15]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[6][lang]} aria-expanded="true">
                      <span>{t[16]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[17]}
                    </p>
                  </Disclosure>
                </div>
              </div>
              <div className="sp-faq-group" id="faq-group-2" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[7][lang]}>{t[18]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[8][lang]} aria-expanded="true">
                      <span>{t[19]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[20]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[9][lang]} aria-expanded="true">
                      <span>{t[21]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[22]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[10][lang]} aria-expanded="true">
                      <span>{t[23]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[24]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[11][lang]} aria-expanded="true">
                      <span>{t[25]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[26]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[12][lang]} aria-expanded="true">
                      <span>{t[27]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[28]}
                    </p>
                  </Disclosure>
                </div>
              </div>
              <div className="sp-faq-group" id="faq-group-3" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[13][lang]}>{t[29]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[14][lang]} aria-expanded="true">
                      <span>{t[30]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[31]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[15][lang]} aria-expanded="true">
                      <span>{t[32]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[33]}
                    </p>
                  </Disclosure>
                </div>
              </div>
              <div className="sp-faq-group" id="faq-group-4" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[16][lang]}>{t[34]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[17][lang]} aria-expanded="true">
                      <span>{t[35]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[36]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[18][lang]} aria-expanded="true">
                      <span>{t[37]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[38]}
                    </p>
                  </Disclosure>
                </div>
              </div>
              <div className="sp-faq-group" id="faq-group-5" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[19][lang]}>{t[39]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[20][lang]} aria-expanded="true">
                      <span>{t[40]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[41]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[21][lang]} aria-expanded="true">
                      <span>{t[42]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[43]}
                    </p>
                  </Disclosure>
                </div>
              </div>
              <div className="sp-faq-group" id="faq-group-6" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-56, 56px)", "padding": "var(--sp-pad-40-0, 40px 0)", "borderTop": "1px solid #DCE3F2" }}>
                <h2 style={s[22][lang]}>{t[44]}</h2>
                <div style={{ "display": "flex", "flexDirection": "column" }}>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[23][lang]} aria-expanded="true">
                      <span>{t[45]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[46]}
                    </p>
                  </Disclosure>
                  <Disclosure style={{ "borderBottom": "1px solid #DCE3F2", "padding": "18px 0", "display": "flex", "flexDirection": "column", "gap": "12px" }}>
                    <button type="button" style={s[24][lang]} aria-expanded="true">
                      <span>{t[47]}</span>
                      <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "50%", "alignItems": "center", "justifyContent": "center", "background": "#155DFC", "border": "1px solid #155DFC" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12" />
                          <path d="M18 6L6 18" />
                        </svg>
                      </span>
                    </button>
                    <p style={{ "margin": "0", "maxWidth": "680px", "fontSize": "var(--sp-fs-16, 16px)", "lineHeight": "1.65", "color": "#4A5578" }}>
                      {t[48]}
                    </p>
                  </Disclosure>
                </div>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
              <div className="sp-two-track" style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "24px", "padding": "var(--sp-pad-32-36, 32px 36px)", "borderRadius": "24px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "6px" }}>
                  <h2 style={s[25][lang]}>{t[49]}</h2>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-16, 16px)", "color": "#4A5578" }}>
                    {t[50]}
                  </p>
                </div>
                <a href="mailto:contact@sourcingpick.com" style={s[26][lang]}>
                  <span><span dir="ltr">{t[51]}</span></span>
                  <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                    </svg>
                  </span>
                </a>
              </div>
            </section>
    </>
  );
}
