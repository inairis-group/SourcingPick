// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: tr-Tarifs.dc.html (and 0 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/pricing.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: tr.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { pricing as content } from "../../content/pricing";
import { Disclosure } from "../../disclosure";

export function PricingBoardTR({ lang }: { lang: Locale }) {
  const t = content.text[lang];

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
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #DCE3F2",
              fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
              fontSize: "12.5px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#155DFC",
            }}
          >
            {t[0]}
          </div>
          <h1
            style={{
              margin: "0",
              fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
              fontSize: "calc(var(--sp-fs-54, 54px) * 0.9796)",
              lineHeight: "1.06",
              fontWeight: "600",
              letterSpacing: "-0.03em",
              color: "#0E1A3D",
              textWrap: "balance",
            }}
          >
            {t[1]}
          </h1>
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
            width: "400px",
            height: "340px",
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
            src="/design/container-ship.svg"
            alt={t[3]}
            style={{ width: "360px", height: "300px", objectFit: "contain", maxWidth: "100%" }}
          />
        </div>
      </section>
      <section style={{ padding: "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))",
            gap: "24px",
          }}
        >
          <article
            style={{
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "24px",
              padding: "var(--sp-pad-40, 40px)",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                  fontSize: "var(--sp-fs-22, 22px)",
                  lineHeight: "1.25",
                  fontWeight: "600",
                  letterSpacing: "-0.03em",
                  color: "#0E1A3D",
                  textWrap: "balance",
                }}
              >
                {t[4]}
              </h3>
              <span
                style={{
                  flexShrink: "0",
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
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#155DFC"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 16l2 4h14l2-4z" />
                  <path d="M6 16V9h12v7" />
                  <path d="M10 9V5h4v4" />
                </svg>
              </span>
            </div>
            <div
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "calc(var(--sp-fs-34, 34px) * 1.0176)",
                lineHeight: "1.1",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[5]}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[6]}</span>
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[7]}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[8]}</span>
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[9]}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[10]}</span>
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[11]}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[12]}</span>
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[13]}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[14]}</span>
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[15]}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom: "1px solid #DCE3F2",
                }}
              >
                <span style={{ fontSize: "var(--sp-fs-16, 16px)", color: "#0E1A3D" }}>{t[16]}</span>
                <span style={{ fontSize: "14px", color: "#4A5578", textAlign: "end" }}>
                  {t[17]}
                </span>
              </div>
            </div>
            <div style={{ paddingTop: "6px" }}>
              <Link
                href={`/${lang}/devis`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxSizing: "border-box",
                  minHeight: "44px",
                  padding: "14px 22px",
                  borderRadius: "12px",
                  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                  fontWeight: "600",
                  fontSize: "var(--sp-fs-16, 16px)",
                  background: "#155DFC",
                  color: "#FFFFFF",
                  border: "1.5px solid #155DFC",
                  textAlign: "center",
                }}
              >
                <span>{t[18]}</span>
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
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </article>
          <article
            style={{
              background: "#162456",
              borderRadius: "24px",
              padding: "var(--sp-pad-40, 40px)",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                  fontSize: "var(--sp-fs-22, 22px)",
                  lineHeight: "1.25",
                  fontWeight: "600",
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  textWrap: "balance",
                }}
              >
                {t[19]}
              </h3>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(141,178,255,0.14)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8DB2FF"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4 4" />
                </svg>
              </span>
            </div>
            <div
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "var(--sp-fs-34, 34px)",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[20]}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8DB2FF",
                  }}
                >
                  {t[21]}
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", color: "#FFFFFF" }}>
                    {t[22]}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--sp-fs-15_5, 15.5px)",
                      fontWeight: "600",
                      color: "#FFFFFF",
                      textAlign: "end",
                    }}
                  >
                    {t[23]}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8DB2FF",
                  }}
                >
                  {t[24]}
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", color: "#FFFFFF" }}>
                    {t[25]}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--sp-fs-15_5, 15.5px)",
                      fontWeight: "600",
                      color: "#FFFFFF",
                      textAlign: "end",
                    }}
                  >
                    {t[26]}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#8DB2FF",
                  }}
                >
                  {t[27]}
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ fontSize: "var(--sp-fs-15_5, 15.5px)", color: "#FFFFFF" }}>
                    {t[28]}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--sp-fs-15_5, 15.5px)",
                      fontWeight: "600",
                      color: "#FFFFFF",
                      textAlign: "end",
                    }}
                  >
                    {t[29]}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ margin: "0", fontSize: "13.5px", color: "#B8C4E6" }}>
              {t[30]}{" "}
              <span
                className="sp-placeholder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  background: "#FFF1CC",
                  border: "1px dashed #D99A00",
                  color: "#7A4E00",
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "0.82em",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {t[31]}
              </span>
            </p>
            <div>
              <Link
                href={`/${lang}/devis`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxSizing: "border-box",
                  minHeight: "44px",
                  padding: "14px 22px",
                  borderRadius: "12px",
                  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                  fontWeight: "600",
                  fontSize: "var(--sp-fs-16, 16px)",
                  background: "#FFFFFF",
                  color: "#0E1A3D",
                  border: "1.5px solid #FFFFFF",
                  textAlign: "center",
                }}
              >
                <span>{t[32]}</span>
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
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section
        style={{
          padding: "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))",
          display: "grid",
          gridTemplateColumns: "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))",
          gap: "24px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "24px",
            padding: "var(--sp-pad-36-40, 36px 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h2
            style={{
              margin: "0",
              fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
              fontSize: "calc(var(--sp-fs-24, 24px) * 0.9667)",
              lineHeight: "1.2",
              fontWeight: "600",
              letterSpacing: "-0.03em",
              color: "#0E1A3D",
              textWrap: "balance",
            }}
          >
            {t[33]}
          </h2>
          <ul
            style={{
              margin: "0",
              padding: "0",
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[34]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[35]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[36]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[37]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[38]}</span>
            </li>
          </ul>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "24px",
            padding: "var(--sp-pad-36-40, 36px 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h2
            style={{
              margin: "0",
              fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
              fontSize: "var(--sp-fs-26, 26px)",
              lineHeight: "1.2",
              fontWeight: "600",
              letterSpacing: "-0.03em",
              color: "#0E1A3D",
              textWrap: "balance",
            }}
          >
            {t[39]}
          </h2>
          <ul
            style={{
              margin: "0",
              padding: "0",
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[40]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[41]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{t[42]}</span>
            </li>
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E3F6EC",
                  marginTop: "1px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F8F55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>
                {t[43]}{" "}
                <span
                  className="sp-placeholder"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 8px",
                    borderRadius: "6px",
                    background: "#FFF1CC",
                    border: "1px dashed #D99A00",
                    color: "#7A4E00",
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "0.82em",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t[44]}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </section>
      <section style={{ padding: "0 var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))" }}>
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            padding: "var(--sp-pad-32-36, 32px 36px)",
            borderRadius: "24px",
            background: "#EAF1FF",
          }}
        >
          <span
            style={{
              flexShrink: "0",
              display: "inline-flex",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#155DFC"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "var(--sp-fs-24, 24px)",
                lineHeight: "1.2",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[45]}
            </h2>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-16_5, 16.5px)",
                lineHeight: "1.55",
                color: "#0E1A3D",
              }}
            >
              {t[46]}{" "}
              <span
                className="sp-placeholder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  background: "#FFF1CC",
                  border: "1px dashed #D99A00",
                  color: "#7A4E00",
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "0.82em",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {t[47]}
              </span>
              {t[48]}
            </p>
            <p style={{ margin: "0", fontSize: "15px", color: "#4A5578" }}>{t[49]}</p>
          </div>
        </div>
      </section>
      <section
        style={{
          padding: "0 var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))",
          display: "grid",
          gridTemplateColumns: "var(--sp-grid-380-fr, 380px minmax(0, 1fr))",
          gap: "var(--sp-gap-64, 64px)",
        }}
      >
        <h2
          style={{
            margin: "0",
            fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
            fontSize: "calc(var(--sp-fs-34, 34px) * 0.9941)",
            lineHeight: "1.15",
            fontWeight: "600",
            letterSpacing: "-0.03em",
            color: "#0E1A3D",
            textWrap: "balance",
          }}
        >
          {t[50]}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #DCE3F2" }}>
          <Disclosure
            style={{
              borderBottom: "1px solid #DCE3F2",
              padding: "22px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                width: "100%",
                minHeight: "44px",
                padding: "0",
                border: "0",
                background: "transparent",
                cursor: "pointer",
                textAlign: "start",
                fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                fontSize: "var(--sp-fs-17, 17px)",
                fontWeight: "600",
                color: "#0E1A3D",
                boxSizing: "content-box",
              }}
              aria-expanded="true"
            >
              <span>{t[51]}</span>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#155DFC",
                  border: "1px solid #155DFC",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </span>
            </button>
            <p
              style={{
                margin: "0",
                maxWidth: "680px",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.65",
                color: "#4A5578",
              }}
            >
              {t[52]}
            </p>
          </Disclosure>
          <Disclosure
            style={{
              borderBottom: "1px solid #DCE3F2",
              padding: "22px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                width: "100%",
                minHeight: "44px",
                padding: "0",
                border: "0",
                background: "transparent",
                cursor: "pointer",
                textAlign: "start",
                fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                fontSize: "var(--sp-fs-17, 17px)",
                fontWeight: "600",
                color: "#0E1A3D",
                boxSizing: "content-box",
              }}
              aria-expanded="true"
            >
              <span>{t[53]}</span>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#155DFC",
                  border: "1px solid #155DFC",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </span>
            </button>
            <p
              style={{
                margin: "0",
                maxWidth: "680px",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.65",
                color: "#4A5578",
              }}
            >
              <span
                className="sp-placeholder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  background: "#FFF1CC",
                  border: "1px dashed #D99A00",
                  color: "#7A4E00",
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "0.82em",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {t[54]}
              </span>
            </p>
          </Disclosure>
          <Disclosure
            style={{
              borderBottom: "1px solid #DCE3F2",
              padding: "22px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                width: "100%",
                minHeight: "44px",
                padding: "0",
                border: "0",
                background: "transparent",
                cursor: "pointer",
                textAlign: "start",
                fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                fontSize: "var(--sp-fs-17, 17px)",
                fontWeight: "600",
                color: "#0E1A3D",
                boxSizing: "content-box",
              }}
              aria-expanded="true"
            >
              <span>{t[55]}</span>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#155DFC",
                  border: "1px solid #155DFC",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </span>
            </button>
            <p
              style={{
                margin: "0",
                maxWidth: "680px",
                fontSize: "var(--sp-fs-16, 16px)",
                lineHeight: "1.65",
                color: "#4A5578",
              }}
            >
              {t[56]}{" "}
              <span
                className="sp-placeholder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  background: "#FFF1CC",
                  border: "1px dashed #D99A00",
                  color: "#7A4E00",
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "0.82em",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {t[57]}
              </span>
              {t[58]}
            </p>
          </Disclosure>
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
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "var(--sp-fs-48, 48px)",
                lineHeight: "1.08",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[59]}
            </h2>
            <p
              style={{
                margin: "0",
                fontSize: "var(--sp-fs-18, 18px)",
                lineHeight: "1.6",
                color: "#E3EBFF",
              }}
            >
              <span
                className="sp-placeholder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  background: "#FFF1CC",
                  border: "1px dashed #D99A00",
                  color: "#7A4E00",
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "0.82em",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {t[60]}
              </span>{" "}
              {t[61]}
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <Link
                href={`/${lang}/devis`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxSizing: "border-box",
                  minHeight: "44px",
                  padding: "18px 28px",
                  borderRadius: "12px",
                  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                  fontWeight: "600",
                  fontSize: "var(--sp-fs-17, 17px)",
                  background: "#FFFFFF",
                  color: "#0E1A3D",
                  border: "1.5px solid #FFFFFF",
                  textAlign: "center",
                }}
              >
                <span>{t[62]}</span>
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
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
              <a
                href="mailto:contact@sourcingpick.com"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxSizing: "border-box",
                  minHeight: "44px",
                  padding: "18px 28px",
                  borderRadius: "12px",
                  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                  fontWeight: "600",
                  fontSize: "var(--sp-fs-17, 17px)",
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  textAlign: "center",
                }}
              >
                <span>
                  <span dir="ltr">{t[63]}</span>
                </span>
              </a>
            </div>
          </div>
          <div
            className="sp-cta-mascot"
            style={{ position: "relative", width: "300px", height: "300px", flexShrink: "0" }}
          >
            <div
              style={{
                position: "absolute",
                left: "-60px",
                top: "6px",
                maxWidth: "220px",
                padding: "12px 16px",
                borderRadius: "18px 18px 4px 18px",
                background: "#FFFFFF",
                color: "#0E1A3D",
                fontSize: "15px",
                fontWeight: "600",
                boxShadow: "0 16px 32px -16px rgba(14,26,61,0.5)",
                boxSizing: "content-box",
              }}
            >
              {t[64]}
            </div>
            <img
              src="/design/picky-arms-up.svg"
              alt={t[65]}
              style={{ width: "300px", height: "auto", maxWidth: "100%" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
