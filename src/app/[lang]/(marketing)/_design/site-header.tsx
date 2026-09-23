// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: Main.dc.html — header; identical on every artboard
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../content/chrome.ts as four arrays zipped by
 * position, which is sound because the four artboards were checked to have
 * identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { chrome as content } from "./content/chrome";
import { LocaleSwitch } from "./locale-switch";

export function SiteHeader({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.styles;
  const v = content.values;

  return (
    <>
            <div style={{ "minHeight": "44px", "padding": "10px 24px", "boxSizing": "border-box", "background": "#0E1A3D", "color": "#C9D3F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "14px", "fontSize": "14px", "textAlign": "center" }}>
              <span style={{ "flexShrink": "0", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "#FFC247" }} />
              <span>{t[0]}</span>
              <Link href={`/${lang}#verite`} style={{ "flexShrink": "0", "color": "#FFFFFF", "fontWeight": "600", "display": "inline-flex", "alignItems": "center", "gap": "6px" }}>
                {t[1]}{" "}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={v[0][lang]} />
                  <path d={v[1][lang]} />
                </svg>
              </Link>
            </div>
            <header style={{ "height": "84px", "padding": "0 96px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "24px", "borderBottom": "1px solid #DCE3F2", "background": "rgba(245,247,252,0.92)" }}>
              <Link href={`/${lang}`} style={{ "display": "flex", "alignItems": "center", "flexShrink": "0" }} aria-label={t[2]}>
                <img src="/design/logo.svg" alt={t[3]} style={{ "height": "34px", "width": "auto" }} />
              </Link>
              <nav style={{ "display": "flex", "alignItems": "center", "gap": "32px" }} aria-label={t[4]}>
                <Link href={`/${lang}/services`} style={{ "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "500", "whiteSpace": "nowrap" }}>
                  {t[5]}
                </Link>
                <Link href={`/${lang}/comment-ca-marche`} style={{ "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "500", "whiteSpace": "nowrap" }}>
                  {t[6]}
                </Link>
                <Link href={`/${lang}/entrepot`} style={{ "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "500", "whiteSpace": "nowrap" }}>
                  {t[7]}
                </Link>
                <Link href={`/${lang}/pricing`} style={{ "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "500", "whiteSpace": "nowrap" }}>
                  {t[8]}
                </Link>
                <Link href={`/${lang}/faq`} style={{ "color": "#0E1A3D", "fontSize": "15px", "fontWeight": "500", "whiteSpace": "nowrap" }}>
                  {t[9]}
                </Link>
              </nav>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "flexShrink": "0" }}>
                <LocaleSwitch lang={lang} />
                <Link href={`/${lang}/login`} style={s[0][lang]}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1A3D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                  </svg>
                  <span>{t[12]}</span>
                </Link>
                <Link href={`/${lang}/devis`} style={{ "display": "inline-flex", "alignItems": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "10px 16px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "14px", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
                  <span>{t[13]}</span>
                  <span style={{ "display": "inline-flex", "flexShrink": "0" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </div>
            </header>
    </>
  );
}
