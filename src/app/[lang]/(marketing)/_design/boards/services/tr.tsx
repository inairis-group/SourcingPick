// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: tr-Services.dc.html (and 0 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/services.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 *
 * Locales using this shape: tr.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { services as content } from "../../content/services";

export function ServicesBoardTR({ lang }: { lang: Locale }) {
  const t = content.text[lang];

  return (
    <>
      <section
        style={{
          padding: "88px 120px 72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "64px",
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
              fontSize: "56px",
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
              fontSize: "19px",
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
          style={{
            flexShrink: "0",
            width: "440px",
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
            src="/design/consolidated-pallet.svg"
            alt={t[3]}
            style={{ width: "400px", height: "340px", objectFit: "contain" }}
          />
        </div>
      </section>
      <section
        style={{ padding: "8px 120px 96px", display: "flex", flexDirection: "column", gap: "28px" }}
      >
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/truck-unloading.svg"
              alt={t[4]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[5]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[6]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[7]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[8]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[9]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[10]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[11]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[12]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[13]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[14]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>
                      {t[15]}{" "}
                      <span
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
                        {t[16]}
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/carton-inspection.svg"
              alt={t[17]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[18]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[19]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[20]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[21]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[22]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[23]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[24]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[25]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[26]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[27]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[28]}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/consolidated-pallet.svg"
              alt={t[29]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[30]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[31]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[32]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[33]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[34]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                      fontSize: "15.5px",
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
                      fontSize: "15.5px",
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
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[38]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[39]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>
                      {t[40]}{" "}
                      <span
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
                        {t[41]}
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/wooden-crate.svg"
              alt={t[42]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[43]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[44]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[45]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[46]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[47]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[48]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[49]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                      {t[50]}{" "}
                      <span
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
                        {t[51]}
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[52]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[53]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[54]}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/forklift-loading.svg"
              alt={t[55]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[56]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[57]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[58]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[59]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[60]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[61]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[62]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[63]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[64]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[65]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[66]}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article
          className="sp-step-card"
          style={{
            display: "grid",
            gridTemplateColumns: "400px minmax(0, 1fr)",
            gap: "48px",
            alignItems: "stretch",
            padding: "32px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            borderRadius: "26px",
          }}
        >
          <div
            style={{
              borderRadius: "20px",
              background: "#EEF3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <img
              src="/design/container-ship.svg"
              alt={t[67]}
              style={{ width: "300px", height: "285px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              justifyContent: "center",
              padding: "8px 8px 8px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#155DFC",
                }}
              >
                {t[68]}
              </span>
              <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5578",
                }}
              >
                {t[69]}
              </span>
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "34px",
                lineHeight: "1.15",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[70]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "#4A5578" }}>
              {t[71]}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px",
                paddingTop: "6px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[72]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[73]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                      {t[74]}{" "}
                      <span
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
                        {t[75]}
                      </span>
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                    <span>{t[76]}</span>
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#155DFC",
                  }}
                >
                  {t[77]}
                </span>
                <ul
                  style={{
                    margin: "0",
                    padding: "0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[78]}</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "15.5px",
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
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#EAF1FF",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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
                    <span>{t[79]}</span>
                  </li>
                </ul>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "15px",
                    color: "#4A5578",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#155DFC"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 21V4" />
                    <path d="M5 4h11l-2 4 2 4H5" />
                  </svg>
                  {t[80]}{" "}
                  <span
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
                    {t[81]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
      <section
        style={{
          background: "#0B1433",
          padding: "96px 120px",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px" }}>
            <div
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                fontSize: "12.5px",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8DB2FF",
              }}
            >
              {t[82]}
            </div>
            <h2
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "44px",
                lineHeight: "1.1",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[83]}
            </h2>
            <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.6", color: "#B8C4E6" }}>
              {t[84]}
            </p>
          </div>
          <img
            src="/design/picky-factory-visit.svg"
            alt=""
            style={{ width: "240px", height: "228px", flexShrink: "0" }}
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "24px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#155DFC",
                color: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {t[85]}
            </span>
            <h3
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "18px",
                lineHeight: "1.25",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[86]}
            </h3>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#C3CDEB" }}>
              {t[87]}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "24px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#155DFC",
                color: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {t[88]}
            </span>
            <h3
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "18px",
                lineHeight: "1.25",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[89]}
            </h3>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#C3CDEB" }}>
              {t[90]}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "24px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#155DFC",
                color: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {t[91]}
            </span>
            <h3
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "18px",
                lineHeight: "1.25",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[92]}
            </h3>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#C3CDEB" }}>
              {t[93]}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "24px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#155DFC",
                color: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {t[94]}
            </span>
            <h3
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "18px",
                lineHeight: "1.25",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[95]}
            </h3>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#C3CDEB" }}>
              {t[96]}
            </p>
          </div>
        </div>
        <div>
          <Link
            href={`/${lang}/pricing`}
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
              fontSize: "16px",
              background: "#FFFFFF",
              color: "#0E1A3D",
              border: "1.5px solid #FFFFFF",
              textAlign: "center",
            }}
          >
            <span>{t[97]}</span>
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
      </section>
      <section style={{ padding: "72px 120px 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            padding: "28px 32px",
            border: "1.5px dashed #B7C5E6",
            borderRadius: "24px",
          }}
        >
          <img
            src="/design/train-plane-sketch.svg"
            alt={t[98]}
            style={{ width: "150px", height: "143px", flexShrink: "0" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3
              style={{
                margin: "0",
                fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
                fontSize: "22px",
                lineHeight: "1.25",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#0E1A3D",
                textWrap: "balance",
              }}
            >
              {t[99]}
            </h3>
            <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#4A5578" }}>
              {t[100]}
            </p>
          </div>
        </div>
      </section>
      <section style={{ padding: "64px 120px 104px" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "32px",
            background: "#155DFC",
            padding: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
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
                fontSize: "48px",
                lineHeight: "1.08",
                fontWeight: "600",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t[101]}
            </h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "#E3EBFF" }}>
              <span
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
                {t[102]}
              </span>{" "}
              {t[103]}
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
                  fontSize: "17px",
                  background: "#FFFFFF",
                  color: "#0E1A3D",
                  border: "1.5px solid #FFFFFF",
                  textAlign: "center",
                }}
              >
                <span>{t[104]}</span>
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
                  fontSize: "17px",
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  textAlign: "center",
                }}
              >
                <span>
                  <span dir="ltr">{t[105]}</span>
                </span>
              </a>
            </div>
          </div>
          <div style={{ position: "relative", width: "300px", height: "300px", flexShrink: "0" }}>
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
              {t[106]}
            </div>
            <img
              src="/design/picky-arms-up.svg"
              alt={t[107]}
              style={{ width: "300px", height: "300px" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
