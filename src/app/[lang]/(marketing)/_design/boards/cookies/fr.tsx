// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: fr-Cookies.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/cookies.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { cookies as content } from "../../content/cookies";
import { SubmitButton } from "../../form-controls";

export function CookiesBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
            <section style={{ "padding": "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-300-fr, 300px minmax(0, 1fr))", "gap": "var(--sp-gap-64, 64px)", "alignItems": "start" }}>
              <nav aria-label={t[0]} style={{ "display": "flex", "flexDirection": "column", "gap": "4px", "padding": "10px", "borderRadius": "20px", "background": "#FFFFFF", "border": "1px solid #DCE3F2" }}>
                <Link href={sitePath(lang, "/legal/mentions-legales")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[1]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[0][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/privacy")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[2]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[1][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/cookies")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "#0E1A3D", "color": "#FFFFFF" }}>
                  {t[3]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[2][lang]} />
                  </svg>
                </Link>
                <Link href={sitePath(lang, "/legal/terms")} style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "minHeight": "48px", "padding": "0 16px", "borderRadius": "12px", "fontSize": "var(--sp-fs-15_5, 15.5px)", "fontWeight": "600", "background": "transparent", "color": "#0E1A3D" }}>
                  {t[4]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={v[3][lang]} />
                  </svg>
                </Link>
              </nav>
              <article style={{ "display": "flex", "flexDirection": "column", "gap": "30px", "maxWidth": "820px" }}>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                  <h1 style={s[0][lang]}>{t[5]}</h1>
                  <p style={{ "margin": "0", "fontSize": "15px", "color": "#4A5578" }}>
                    {t[6]}
                  </p>
                  <p style={{ "margin": "0", "fontSize": "var(--sp-fs-17, 17px)", "lineHeight": "1.65", "color": "#0E1A3D" }}>
                    {t[7]}
                  </p>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[1][lang]}>{t[8]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[9]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[10]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[11]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "14px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[2][lang]}>{t[12]}</h2>
                  <div style={{ "border": "1px solid #DCE3F2", "borderRadius": "18px", "overflow": "hidden", "background": "#FFFFFF" }}>
                    <table style={{ "width": "100%", "borderCollapse": "collapse" }}>
                      <thead>
                        <tr>
                          <th style={s[3][lang]}>{t[13]}</th>
                          <th style={s[4][lang]}>{t[14]}</th>
                          <th style={s[5][lang]}>{t[15]}</th>
                          <th style={s[6][lang]}>{t[16]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={s[7][lang]}>{t[17]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[18]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[19]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2", "fontWeight": "600" }}>
                            {t[20]}
                          </td>
                        </tr>
                        <tr>
                          <td style={s[8][lang]}>{t[21]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[22]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[23]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2", "fontWeight": "600" }}>
                            {t[24]}
                          </td>
                        </tr>
                        <tr>
                          <td style={s[9][lang]}>{t[25]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[26]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[27]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2", "fontWeight": "600" }}>
                            {t[28]}
                          </td>
                        </tr>
                        <tr>
                          <td style={s[10][lang]}>{t[29]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[30]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[31]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2", "fontWeight": "600" }}>
                            {t[32]}
                          </td>
                        </tr>
                        <tr>
                          <td style={s[11][lang]}>{t[33]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[34]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578", "borderBottom": "1px solid #DCE3F2" }}>
                            {t[35]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "borderBottom": "1px solid #DCE3F2", "fontWeight": "600" }}>
                            {t[36]}
                          </td>
                        </tr>
                        <tr>
                          <td style={s[12][lang]}>{t[37]}</td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D" }}>
                            {t[38]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#4A5578" }}>
                            {t[39]}
                          </td>
                          <td style={{ "padding": "13px 16px", "fontSize": "14.5px", "lineHeight": "1.5", "verticalAlign": "top", "color": "#0E1A3D", "fontWeight": "600" }}>
                            {t[40]}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[13][lang]}>{t[41]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[42]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[43]}
                    </li>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[44]}
                    </li>
                  </ul>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "16px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[14][lang]}>{t[45]}</h2>
                  <p style={{ "margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#4A5578" }}>
                    {t[46]}
                  </p>
                  <div style={{ "display": "flex", "gap": "20px", "alignItems": "flex-start", "flexWrap": "wrap", "padding": "var(--sp-pad-26, 26px)", "borderRadius": "22px", "background": "#EAF1FF" }}>
                    <div style={{ "width": "420px", "boxSizing": "border-box", "padding": "22px", "borderRadius": "20px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 24px 48px -28px rgba(14,26,61,0.45)", "display": "flex", "flexDirection": "column", "gap": "14px" }}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                        <span style={{ "display": "inline-flex", "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#EAF1FF", "alignItems": "center", "justifyContent": "center" }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
                            <path d="M8.5 12l2.5 2.5 4.5-4.5" />
                          </svg>
                        </span>
                        <h3 style={s[15][lang]}>{t[47]}</h3>
                      </div>
                      <p style={{ "margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#4A5578" }}>
                        {t[48]}
                      </p>
                      <div style={{ "display": "flex", "gap": "10px", "flexWrap": "wrap" }}>
                        <span style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "minHeight": "44px", "padding": "0 20px", "borderRadius": "12px", "fontSize": "14.5px", "fontWeight": "600", "background": "#155DFC", "color": "#FFFFFF" }}>
                          {t[49]}
                        </span>
                        <span style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "minHeight": "44px", "padding": "0 20px", "borderRadius": "12px", "fontSize": "14.5px", "fontWeight": "600", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1.5px solid #DCE3F2" }}>
                          {t[50]}
                        </span>
                        <span style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "minHeight": "44px", "padding": "0 20px", "borderRadius": "12px", "fontSize": "14.5px", "fontWeight": "600", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1.5px solid #DCE3F2" }}>
                          {t[51]}
                        </span>
                      </div>
                    </div>
                    <div style={{ "width": "340px", "boxSizing": "border-box", "padding": "20px", "borderRadius": "20px", "background": "#FFFFFF", "border": "1px solid #DCE3F2", "boxShadow": "0 24px 48px -28px rgba(14,26,61,0.45)", "display": "flex", "flexDirection": "column", "gap": "4px" }}>
                      <h3 style={s[16][lang]}>{t[52]}</h3>
                      <div style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px", "flex": "1" }}>
                          <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                            {t[53]}
                          </span>
                          <span style={{ "fontSize": "12.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                            {t[54]}
                          </span>
                        </div>
                        <span style={s[17][lang]}>{t[55]}</span>
                      </div>
                      <div style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px", "flex": "1" }}>
                          <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                            {t[56]}
                          </span>
                          <span style={{ "fontSize": "12.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                            {t[57]}
                          </span>
                        </div>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "alignItems": "center", "width": "44px", "height": "26px", "padding": "3px", "boxSizing": "border-box", "borderRadius": "999px", "background": "#C9D2E8", "justifyContent": "flex-start" }}>
                          <span style={{ "width": "20px", "height": "20px", "borderRadius": "50%", "background": "#FFFFFF" }} />
                        </span>
                      </div>
                      <div style={{ "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 0", "borderTop": "1px solid #DCE3F2" }}>
                        <div style={{ "display": "flex", "flexDirection": "column", "gap": "3px", "flex": "1" }}>
                          <span style={{ "fontSize": "14.5px", "fontWeight": "600", "color": "#0E1A3D" }}>
                            {t[58]}
                          </span>
                          <span style={{ "fontSize": "12.5px", "lineHeight": "1.5", "color": "#4A5578" }}>
                            {t[59]}
                          </span>
                        </div>
                        <span style={{ "flexShrink": "0", "display": "inline-flex", "alignItems": "center", "width": "44px", "height": "26px", "padding": "3px", "boxSizing": "border-box", "borderRadius": "999px", "background": "#155DFC", "justifyContent": "flex-end" }}>
                          <span style={{ "width": "20px", "height": "20px", "borderRadius": "50%", "background": "#FFFFFF" }} />
                        </span>
                      </div>
                      <div style={{ "paddingTop": "14px", "borderTop": "1px solid #DCE3F2" }}>
                        <SubmitButton data-pk="inert" style={s[18][lang]}>
                          <span>{t[60]}</span>
                        </SubmitButton>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "paddingTop": "26px", "borderTop": "1px solid #DCE3F2" }}>
                  <h2 style={s[19][lang]}>{t[61]}</h2>
                  <ul style={{ "margin": "0", "paddingInlineStart": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                    <li style={{ "fontSize": "var(--sp-fs-16_5, 16.5px)", "lineHeight": "1.7", "color": "#0E1A3D" }}>
                      {t[62]}{" "}
                      <Link href={sitePath(lang, "/legal/privacy")} style={{ "fontWeight": "600" }}>
                        {t[63]}
                      </Link>
                      {t[64]}
                    </li>
                  </ul>
                </div>
              </article>
            </section>
    </>
  );
}
