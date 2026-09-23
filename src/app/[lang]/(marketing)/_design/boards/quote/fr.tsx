// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Devis.dc.html (and 10 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/quote.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: fr, en, zh, es, de, it, pt, nl, ar, ru, pl.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { quote as content } from "../../content/quote";
import { CountrySelect } from "../../form-controls";
import { FileDrop } from "../../file-drop";
import { QuoteForm } from "../../quote-form";
import { SubmitButton } from "../../form-controls";

export function QuoteBoardFR({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;

  return (
    <>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))", "display": "flex", "flexDirection": "column", "gap": "18px", "maxWidth": "900px", "boxSizing": "content-box" }}>
              <div style={s[0][lang]}>{t[0]}</div>
              <h1 style={s[1][lang]}>{t[1]}</h1>
              <p style={{ "margin": "0", "fontSize": "var(--sp-fs-18, 18px)", "lineHeight": "1.6", "color": "#4A5578" }}>
                {t[2]}
              </p>
            </section>
            <section style={{ "padding": "0 var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-380, minmax(0, 1fr) 380px)", "gap": "var(--sp-gap-40, 40px)", "alignItems": "start" }}>
              <QuoteForm style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }} lang={lang}>
                <fieldset style={{ "margin": "0", "padding": "var(--sp-pad-32, 32px)", "border": "1px solid #DCE3F2", "borderRadius": "24px", "background": "#F5F7FC", "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <legend style={s[2][lang]}>{t[3]}</legend>
                  <div role="radiogroup" style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "14px" }}>
                    <label className="sp-choice" style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "18px", "borderRadius": "18px", "background": "#FFFFFF", "border": "1.5px solid #155DFC", "boxShadow": "0 0 0 3px #EAF1FF" }}>
                      <input type="radio" name="service" defaultChecked style={{ "margin": "3px 0 0", "width": "20px", "height": "20px", "accentColor": "#155DFC" }} value="0" />
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "display": "flex", "alignItems": "center", "gap": "8px", "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 16l2 4h14l2-4z" />
                            <path d="M6 16V9h12v7" />
                            <path d="M10 9V5h4v4" />
                          </svg>
                          {t[4]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "color": "#4A5578" }}>
                          {t[5]}
                        </span>
                      </div>
                    </label>
                    <label className="sp-choice" style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start", "padding": "18px", "borderRadius": "18px", "background": "#FFFFFF", "border": "1.5px solid #DCE3F2" }}>
                      <input type="radio" name="service" style={{ "margin": "3px 0 0", "width": "20px", "height": "20px", "accentColor": "#155DFC" }} value="1" />
                      <div style={{ "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                        <span style={{ "display": "flex", "alignItems": "center", "gap": "8px", "fontSize": "var(--sp-fs-16_5, 16.5px)", "fontWeight": "600" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="6.5" />
                            <path d="M16 16l4 4" />
                          </svg>
                          {t[6]}
                        </span>
                        <span style={{ "fontSize": "14.5px", "color": "#4A5578" }}>
                          {t[7]}
                        </span>
                      </div>
                    </label>
                  </div>
                </fieldset>
                <fieldset style={{ "margin": "0", "padding": "var(--sp-pad-32, 32px)", "border": "1px solid #DCE3F2", "borderRadius": "24px", "background": "#F5F7FC", "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <legend style={s[3][lang]}>{t[8]}</legend>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="q-products" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[9]}
                    </label>
                    <input id="q-products" placeholder={t[10]} defaultValue="" style={s[4][lang]} name="q-products" />
                  </div>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-qty" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[11]}
                      </label>
                      <input id="q-qty" placeholder={t[12]} defaultValue="" style={s[5][lang]} name="q-qty" />
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-vol" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[13]}
                      </label>
                      <input id="q-vol" placeholder={t[14]} defaultValue="" style={s[6][lang]} name="q-vol" />
                    </div>
                  </div>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-val" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[15]}
                      </label>
                      <input id="q-val" placeholder={t[16]} defaultValue="" style={s[7][lang]} name="q-val" />
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-sup" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[17]}
                      </label>
                      <input id="q-sup" placeholder={t[18]} defaultValue="" style={s[8][lang]} name="q-sup" />
                    </div>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="q-cities" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[19]}
                    </label>
                    <input id="q-cities" placeholder={t[20]} defaultValue="" style={s[9][lang]} name="q-cities" />
                  </div>
                </fieldset>
                <fieldset style={{ "margin": "0", "padding": "var(--sp-pad-32, 32px)", "border": "1px solid #DCE3F2", "borderRadius": "24px", "background": "#F5F7FC", "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <legend style={s[10][lang]}>{t[21]}</legend>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-country" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[22]}
                      </label>
                      <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "52px", "padding": "0 16px", "borderRadius": "14px", "border": "1.5px solid #DCE3F2", "background": "#FFFFFF" }}>
                        <CountrySelect id="q-country" style={s[11][lang]} name="q-country" lang={lang}>
                          <option>{t[23]}</option>
                        </CountrySelect>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-city" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[24]}
                      </label>
                      <input id="q-city" placeholder={t[25]} defaultValue="" style={s[12][lang]} name="q-city" />
                    </div>
                  </div>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="q-date" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[26]}
                    </label>
                    <input id="q-date" placeholder={t[27]} defaultValue="" style={s[13][lang]} name="q-date" />
                  </div>
                </fieldset>
                <fieldset style={{ "margin": "0", "padding": "var(--sp-pad-32, 32px)", "border": "1px solid #DCE3F2", "borderRadius": "24px", "background": "#F5F7FC", "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                  <legend style={s[14][lang]}>{t[28]}</legend>
                  <div role="radiogroup" aria-label={t[29]} style={{ "display": "flex", "alignItems": "center", "gap": "14px" }}>
                    <span style={{ "fontSize": "14px", "fontWeight": "600" }}>{t[30]}</span>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #155DFC", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="type" defaultChecked style={{ "accentColor": "#155DFC" }} value="0" />
                      {t[31]}
                    </label>
                    <label className="sp-choice" style={{ "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "padding": "0 16px", "borderRadius": "12px", "border": "1.5px solid #DCE3F2", "background": "#FFFFFF", "fontSize": "15px", "fontWeight": "600" }}>
                      <input type="radio" name="type" style={{ "accentColor": "#155DFC" }} value="1" />
                      {t[32]}
                    </label>
                  </div>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-name" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[33]}
                      </label>
                      <input id="q-name" placeholder="" defaultValue="" style={s[15][lang]} name="q-name" />
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-company" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[34]}
                      </label>
                      <input id="q-company" placeholder="" defaultValue="" style={s[16][lang]} name="q-company" />
                    </div>
                  </div>
                  <div style={{ "display": "grid", "gridTemplateColumns": "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", "gap": "16px" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-email" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[35]}
                      </label>
                      <input id="q-email" placeholder="" defaultValue="" style={s[17][lang]} name="q-email" />
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                      <label htmlFor="q-phone" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                        {t[36]}
                      </label>
                      <input id="q-phone" placeholder="" defaultValue="" style={s[18][lang]} name="q-phone" />
                    </div>
                  </div>
                  <FileDrop style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "18px", "borderRadius": "16px", "border": "1.5px dashed #B7C5E6", "background": "#FFFFFF" }} lang={lang}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "44px", "height": "44px", "borderRadius": "12px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 16V4" />
                        <path d="M7 9l5-5 5 5" />
                        <path d="M4 20h16" />
                      </svg>
                    </span>
                    <div style={{ "display": "flex", "flexDirection": "column", "gap": "2px" }}>
                      <span style={{ "fontSize": "15px", "fontWeight": "600" }}>
                        {t[37]}
                      </span>
                      <span style={{ "fontSize": "13.5px", "color": "#4A5578" }}>
                        {t[38]}
                      </span>
                    </div>
                  </FileDrop>
                  <div style={{ "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <label htmlFor="q-msg" style={{ "fontSize": "14px", "fontWeight": "600", "color": "#0E1A3D" }}>
                      {t[39]}
                    </label>
                    <textarea id="q-msg" placeholder={t[40]} style={s[19][lang]} name="q-msg" />
                  </div>
                </fieldset>
                <label style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "fontSize": "14.5px", "lineHeight": "1.55", "color": "#4A5578" }}>
                  <input type="checkbox" style={{ "margin": "3px 0 0", "width": "18px", "height": "18px", "accentColor": "#155DFC", "flexShrink": "0" }} name="consent" />
                  <span>
                    {t[41]}{" "}
                    <Link href={`/${lang}/legal/privacy`} style={{ "fontWeight": "600" }}>
                      {t[42]}
                    </Link>
                  </span>
                </label>
                <div>
                  <SubmitButton style={s[20][lang]}>
                    <span>{t[43]}</span>
                    <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 12l16-8-6 16-2.5-6.5z" />
                      </svg>
                    </span>
                  </SubmitButton>
                </div>
              </QuoteForm>
              <aside style={{ "display": "flex", "flexDirection": "column", "gap": "18px" }}>
                <div style={{ "background": "#162456", "borderRadius": "24px", "padding": "var(--sp-pad-32, 32px)", "display": "flex", "flexDirection": "column", "gap": "20px" }}>
                  <h2 style={s[21][lang]}>{t[44]}</h2>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "30px", "height": "30px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "13px", "fontWeight": "600" }}>
                      {t[45]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                      {t[46]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "30px", "height": "30px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "13px", "fontWeight": "600" }}>
                      {t[47]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                      {t[48]}{" "}
                      <span className="sp-placeholder" style={s[22][lang]}>{t[49]}</span>
                      {t[50]}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "gap": "14px", "alignItems": "flex-start" }}>
                    <span style={{ "flexShrink": "0", "display": "inline-flex", "width": "30px", "height": "30px", "borderRadius": "50%", "background": "#155DFC", "color": "#FFFFFF", "alignItems": "center", "justifyContent": "center", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "13px", "fontWeight": "600" }}>
                      {t[51]}
                    </span>
                    <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "lineHeight": "1.55", "color": "#FFFFFF" }}>
                      {t[52]}
                    </span>
                  </div>
                </div>
                <div style={{ "background": "#FFFFFF", "border": "1px solid #DCE3F2", "borderRadius": "24px", "padding": "var(--sp-pad-26, 26px)", "display": "flex", "flexDirection": "column", "gap": "10px" }}>
                  <span style={{ "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600" }}>
                    {t[53]}
                  </span>
                  <a href="mailto:contact@sourcingpick.com" style={{ "fontWeight": "600" }} dir="ltr">
                    {t[54]}
                  </a>
                </div>
                <div style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "18px", "borderRadius": "18px", "background": "#E3F6EC", "fontSize": "14px", "lineHeight": "1.5", "color": "#145C38" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
                    <path d="M8.5 12l2.5 2.5 4.5-4.5" />
                  </svg>
                  <span>{t[55]}</span>
                </div>
                <img src="/design/spot-5.svg" alt="" style={{ "width": "200px", "height": "auto", "alignSelf": "center", "maxWidth": "100%" }} />
              </aside>
            </section>
    </>
  );
}
