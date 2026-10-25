// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Contact.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/contact.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import type { Locale } from "@/lib/i18n/config";
import { contact as content } from "../../content/contact";
import { AddressGate } from "../../address-gate";
import { SubmitButton } from "../../form-controls";

export function ContactBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;

  return (
    <>
            <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "var(--sp-gap-64, 64px)" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px", "maxWidth": "760px" }}>
                <div style={s[0][lang]}>{t[0]}</div>
                <h1 style={s[1][lang]}>{t[1]}</h1>
                <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578", "maxWidth": "680px", "textWrap": "pretty" }}>
                  {t[2]}
                </p>
              </div>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-440-fr, 440px minmax(0, 1fr))", "gap": "var(--sp-gap-40, 40px)", "alignItems": "start" }}>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                    <span style={s[2][lang]}>{t[3]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "lineHeight": "1.5" }}>
                      <a href="mailto:contact@sourcingpick.com" dir="ltr">{t[4]}</a>
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  </span>
                  <AddressGate style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }} lang={lang}>
                    <span style={s[3][lang]}>{t[5]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "lineHeight": "1.5" }}>
                      <span lang="zh-Hans" style={{ "fontFamily": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
                        {t[6]}
                      </span>
                      <br />
                      <span style={{ "fontWeight": "400", "color": "#4A5578", "fontSize": "14.5px" }}>
                        {t[7]}
                      </span>
                    </span>
                  </AddressGate>
                </div>
                <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3.5 2" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                    <span style={s[4][lang]}>{t[8]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "lineHeight": "1.5" }}>
                      {t[9]}
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 5h16v11H9l-5 4z" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                    <span style={s[5][lang]}>{t[10]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "lineHeight": "1.5" }}>
                      <span dir="ltr">{t[11]}</span>
                    </span>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "16px", "alignItems": "flex-start", "padding": "22px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "20px" }}>
                  <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3c2.8 3 2.8 15 0 18" />
                      <path d="M12 3c-2.8 3-2.8 15 0 18" />
                    </svg>
                  </span>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                    <span style={s[6][lang]}>{t[12]}</span>
                    <span style={{ "fontSize": "var(--sp-fs-16, 16px)", "fontWeight": "600", "lineHeight": "1.5" }}>
                      {t[13]}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ "position": "relative", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "26px", "padding": "var(--sp-pad-40, 40px)", "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                <h2 style={s[7][lang]}>{t[14]}</h2>
                <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="c-name" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[15]}
                    </label>
                    <input id="c-name" placeholder="" defaultValue="" style={s[8][lang]} name="c-name" />
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="c-email" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[16]}
                    </label>
                    <input id="c-email" placeholder="" defaultValue="" style={s[9][lang]} name="c-email" />
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <span style={{ "fontSize": "14px", "fontWeight": "600" }}>{t[17]}</span>
                  <div style={{ "display": "flex", "flexWrap": "wrap", "gap": "10px" }}>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #155DFC", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="subject" defaultChecked style={{ "accentColor": "#155DFC" }} value="0" />
                      {t[18]}
                    </label>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #DCE3F2", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="subject" style={{ "accentColor": "#155DFC" }} value="1" />
                      {t[19]}
                    </label>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #DCE3F2", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="subject" style={{ "accentColor": "#155DFC" }} value="2" />
                      {t[20]}
                    </label>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #DCE3F2", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="subject" style={{ "accentColor": "#155DFC" }} value="3" />
                      {t[21]}
                    </label>
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                  <label htmlFor="c-msg" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                    {t[22]}
                  </label>
                  <textarea id="c-msg" placeholder={t[23]} style={s[10][lang]} name="c-msg" />
                </div>
                <div>
                  <SubmitButton data-pk="inert" style={s[11][lang]}>
                    <span>{t[24]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 12l16-8-6 16-2.5-6.5z" />
                      </svg>
                    </span>
                  </SubmitButton>
                </div>
                <img className="sp-contact-art" src="/design/spot-2.svg" alt="" style={s[12][lang]} />
                <div className="sp-contact-art" style={s[13][lang]}>{t[25]}</div>
              </div>
            </section>
    </>
  );
}
