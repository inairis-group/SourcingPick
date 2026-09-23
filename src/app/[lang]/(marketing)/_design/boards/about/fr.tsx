// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-A-propos.dc.html (and 10 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/about.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: fr, en, zh, es, de, it, pt, nl, ar, ru, pl.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { about as content } from "../../content/about";

export function AboutBoardFR({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
      <section
        className="sp-two-track"
        style={{
          padding:
            "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--sp-gap-64, 64px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "760px" }}>
          <div style={s[0][lang]}>{t[0]}</div>
          <h1 style={s[1][lang]}>{t[1]}</h1>
          <p
            style={{
              margin: "0",
              fontSize: "var(--sp-fs-19, 19px)",
              lineHeight: "1.6",
              color: "#4A5578",
              maxWidth: "680px",
              textWrap: "pretty",
            }}
          >
            {t[2]}
          </p>
        </div>
        <div
          className="sp-hero-figure"
          style={{
            flexShrink: "0",
            width: "380px",
            height: "380px",
            borderRadius: "28px",
            background: "#EEF3FF",
            border: "1px solid #DCE3F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src="/design/spot-2.svg"
            alt=""
            style={{ width: "340px", height: "auto", objectFit: "contain", maxWidth: "100%" }}
          />
        </div>
      </section>
      <section
        style={{
          padding:
            "calc(16px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))",
          display: "grid",
          gridTemplateColumns: "var(--sp-grid-fr-560, minmax(0, 1fr) 560px)",
          gap: "var(--sp-gap-64, 64px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={s[2][lang]}>{t[3]}</h2>
          <p
            style={{
              margin: "0",
              fontSize: "var(--sp-fs-18, 18px)",
              lineHeight: "1.65",
              color: "#0E1A3D",
            }}
          >
            {t[4]}
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "var(--sp-fs-18, 18px)",
              lineHeight: "1.65",
              color: "#4A5578",
            }}
          >
            {t[5]}
          </p>
        </div>
        <div dir="ltr" style={{ width: "560px", height: "auto", maxWidth: "100%" }}>
          <img
            src="/design/hero-warehouse-quay-ship.svg"
            alt={t[6]}
            style={{ width: "560px", height: "auto", maxWidth: "100%" }}
          />
        </div>
      </section>
      <section
        style={{
          background: "#0B1433",
          padding:
            "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(88px * var(--sp-vs, 1))",
          display: "grid",
          gridTemplateColumns: "var(--sp-grid-260-fr, 260px minmax(0, 1fr))",
          gap: "var(--sp-gap-56, 56px)",
          alignItems: "center",
        }}
      >
        <img
          src="/design/picky-verified-badge.svg"
          alt=""
          style={{ width: "240px", height: "auto", maxWidth: "100%" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={s[3][lang]}>{t[7]}</h2>
          <p
            style={{
              margin: "0",
              fontSize: "var(--sp-fs-19, 19px)",
              lineHeight: "1.65",
              color: "#C3CDEB",
              maxWidth: "820px",
            }}
          >
            {t[8]}
          </p>
        </div>
      </section>
      <section
        style={{
          padding:
            "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <h2 style={s[4][lang]}>{t[9]}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "var(--sp-pad-30, 30px)",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "24px",
            }}
          >
            <span style={s[5][lang]}>{t[10]}</span>
            <span style={s[6][lang]}>{t[11]}</span>
            <span
              style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", lineHeight: "1.5", color: "#4A5578" }}
            >
              {t[12]}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "var(--sp-pad-30, 30px)",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "24px",
            }}
          >
            <span style={s[7][lang]}>{t[13]}</span>
            <span style={s[8][lang]}>{t[14]}</span>
            <span
              style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", lineHeight: "1.5", color: "#4A5578" }}
            >
              {t[15]}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "var(--sp-pad-30, 30px)",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "24px",
            }}
          >
            <img
              src="/design/spot-5.svg"
              alt=""
              style={{ width: "72px", height: "auto", maxWidth: "100%" }}
            />
            <span style={s[9][lang]}>{t[16]}</span>
            <span
              style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", lineHeight: "1.5", color: "#4A5578" }}
            >
              {t[17]}
            </span>
          </div>
        </div>
      </section>
      <section
        style={{
          padding:
            "calc(48px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <h2 style={s[10][lang]}>{t[18]}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "var(--sp-pad-30, 30px)",
              borderRadius: "24px",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#EAF1FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-4.5" />
              </svg>
            </span>
            <h3 style={s[11][lang]}>{t[19]}</h3>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-15_5, 15.5px)",
                lineHeight: "1.55",
                color: "#4A5578",
              }}
            >
              {t[20]}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "var(--sp-pad-30, 30px)",
              borderRadius: "24px",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#EAF1FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h8l4 4v14H6z" />
                <path d="M14 3v4h4" />
                <path d="M9 13h6" />
                <path d="M9 17h6" />
              </svg>
            </span>
            <h3 style={s[12][lang]}>{t[21]}</h3>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-15_5, 15.5px)",
                lineHeight: "1.55",
                color: "#4A5578",
              }}
            >
              {t[22]}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "var(--sp-pad-30, 30px)",
              borderRadius: "24px",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#EAF1FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </span>
            <h3 style={s[13][lang]}>{t[23]}</h3>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-15_5, 15.5px)",
                lineHeight: "1.55",
                color: "#4A5578",
              }}
            >
              {t[24]}
            </p>
          </div>
        </div>
      </section>
      <section
        style={{
          padding:
            "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))",
        }}
      >
        <div
          className="sp-cta-band"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "32px",
            background: "#155DFC",
            padding: "var(--sp-pad-72, 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--sp-gap-40, 40px)",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              backgroundImage:
                "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "44px 25.4px",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: "700px",
            }}
          >
            <h2 style={s[14][lang]}>{t[25]}</h2>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-18, 18px)",
                lineHeight: "1.6",
                color: "#E3EBFF",
              }}
            >
              {t[26]}{" "}
              <span className="sp-placeholder" style={s[15][lang]}>
                {t[27]}
              </span>
              {t[28]}
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href={`/${lang}/devis`} style={s[16][lang]}>
                <span>{t[29]}</span>
                <span style={{ display: "inline-flex", flexShrink: "0" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={v[0][lang]} />
                    <path d={v[1][lang]} />
                  </svg>
                </span>
              </Link>
              <a href="mailto:contact@sourcingpick.com" style={s[17][lang]}>
                <span>
                  <span dir="ltr">{t[30]}</span>
                </span>
              </a>
            </div>
          </div>
          <div
            className="sp-cta-mascot"
            style={{ position: "relative", width: "300px", height: "300px", flexShrink: "0" }}
          >
            <div style={s[18][lang]}>{t[31]}</div>
            <img
              src="/design/picky-arms-up.svg"
              alt={t[32]}
              style={{ width: "300px", height: "auto", maxWidth: "100%" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
