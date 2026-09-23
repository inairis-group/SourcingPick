// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: Main.dc.html — footer; identical on every artboard
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ./content/chromeFooter.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { chromeFooter as content } from "./content/chromeFooter";
import { LocaleRow } from "./locale-switch";

export function SiteFooter({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.styles;

  return (
    <>
      <footer
        style={{
          background: "#0B1433",
          color: "#FFFFFF",
          padding:
            "calc(80px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-gap-56, 56px)",
        }}
      >
        <div
          className="sp-footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "var(--sp-grid-340-r4, 340px repeat(4, minmax(0, 1fr)))",
            gap: "var(--sp-gap-40, 40px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <img
              src="/design/logo-white.svg"
              alt={t[0]}
              style={{ height: "var(--sp-logo-h, 34px)", width: "auto", alignSelf: "flex-start" }}
            />
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.6", color: "#B8C4E6" }}>
              {t[1]}
            </p>
            <a
              href="mailto:contact@sourcingpick.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "15px",
              }}
              dir="ltr"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8DB2FF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
              </svg>
              {t[2]}
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={s[0][lang]}>{t[3]}</span>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[4]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[5]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[6]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[7]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[8]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[9]}
            </Link>
            <Link href={`/${lang}/services`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[10]}
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={s[1][lang]}>{t[11]}</span>
            <Link href={`/${lang}/about`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[12]}
            </Link>
            <Link href={`/${lang}/entrepot`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[13]}
            </Link>
            <Link href={`/${lang}#verite`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[14]}
            </Link>
            <Link href={`/${lang}/contact`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[15]}
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={s[2][lang]}>{t[16]}</span>
            <Link href={`/${lang}/faq`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[17]}
            </Link>
            <Link href={`/${lang}/application`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[18]}
            </Link>
            <Link href={`/${lang}/login`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[19]}
            </Link>
            <Link href={`/${lang}/devis`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[20]}
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={s[3][lang]}>{t[21]}</span>
            <Link
              href={`/${lang}/legal/mentions-legales`}
              style={{ color: "#C3CDEB", fontSize: "15px" }}
            >
              {t[22]}
            </Link>
            <Link href={`/${lang}/legal/privacy`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[23]}
            </Link>
            <Link href={`/${lang}/legal/cookies`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[24]}
            </Link>
            <Link href={`/${lang}/legal/terms`} style={{ color: "#C3CDEB", fontSize: "15px" }}>
              {t[25]}
            </Link>
          </div>
        </div>
        <LocaleRow lang={lang} label={t[26]} />
        <div
          className="sp-footer-meta"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "24px",
            fontSize: "13.5px",
            color: "#8E9BC4",
          }}
        >
          <span>
            {t[39]}{" "}
            <span className="sp-placeholder" style={s[4][lang]}>
              {t[40]}
            </span>
          </span>
          <span>{t[41]}</span>
        </div>
      </footer>
    </>
  );
}
