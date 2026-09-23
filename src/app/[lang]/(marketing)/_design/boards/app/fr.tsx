// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-Application.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/app.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { app as content } from "../../content/app";

export function AppBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;
  const v = content.frValues;

  return (
    <>
      <section
        style={{
          padding: "72px 120px 24px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 640px",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={s[0][lang]}>{t[0]}</div>
          <h1 style={s[1][lang]}>{t[1]}</h1>
          <p style={{ margin: "0", fontSize: "19px", lineHeight: "1.6", color: "#4A5578" }}>
            {t[2]}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={`/${lang}/application`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "56px",
                padding: "0 20px",
                borderRadius: "14px",
                background: "#0E1A3D",
                color: "#FFFFFF",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v12" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11.5px", color: "#B8C4E6" }}>{t[3]}</span>
                <span style={{ fontSize: "16px", fontWeight: "600" }} dir="ltr">
                  {t[4]}
                </span>
              </span>
            </Link>
            <Link
              href={`/${lang}/application`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "56px",
                padding: "0 20px",
                borderRadius: "14px",
                background: "#0E1A3D",
                color: "#FFFFFF",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v12" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11.5px", color: "#B8C4E6" }}>{t[5]}</span>
                <span style={{ fontSize: "16px", fontWeight: "600" }} dir="ltr">
                  {t[6]}
                </span>
              </span>
            </Link>
            <span style={{ fontSize: "14px", color: "#4A5578" }}>
              {t[7]} <span style={s[2][lang]}>{t[8]}</span> {t[9]} <span dir="ltr">{t[10]}</span>
            </span>
          </div>
        </div>
        <div style={{ position: "relative", height: "700px" }}>
          <div style={s[3][lang]}>
            <div
              style={{
                width: "300px",
                height: "620px",
                boxSizing: "border-box",
                padding: "10px",
                borderRadius: "46px",
                background: "#0E1A3D",
                boxShadow: "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "37px",
                  background: "#FFFFFF",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "44px 20px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    aria-label={t[11]}
                    style={{
                      display: "inline-flex",
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: "#F5F7FC",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0E1A3D"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={v[0][lang]} />
                      <path d={v[1][lang]} />
                    </svg>
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{t[12]}</span>
                  <span
                    aria-label={t[13]}
                    style={{
                      display: "inline-flex",
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: "#F5F7FC",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0E1A3D"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                      <path d="M10 20a2 2 0 004 0" />
                    </svg>
                  </span>
                </div>
                <div
                  style={{
                    padding: "16px 20px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "18px",
                      background: "#162456",
                      color: "#FFFFFF",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span style={s[4][lang]}>{t[14]}</span>
                    <span style={s[5][lang]}>{t[15]}</span>
                    <span style={{ fontSize: "12.5px", color: "#C3CDEB" }}>{t[16]}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#155DFC",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#0E1A3D" }}>
                        {t[17]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#155DFC",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#0E1A3D" }}>
                        {t[18]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#155DFC",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#0E1A3D" }}>
                        {t[19]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#155DFC",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#0E1A3D" }}>
                        {t[20]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          border: "2.5px solid #155DFC",
                          boxSizing: "border-box",
                          boxShadow: "0 0 0 4px #EAF1FF",
                        }}
                      />
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0E1A3D" }}>
                        {t[21]}
                      </span>
                      <span style={s[6][lang]}>{t[22]}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "34px",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: "0",
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#F5F7FC",
                          border: "2px solid #DCE3F2",
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#6B7596" }}>
                        {t[23]}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      minHeight: "46px",
                      padding: "0 10px",
                      borderRadius: "14px",
                      background: "#155DFC",
                      color: "#FFFFFF",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                    {t[24]}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={s[7][lang]}>
            <div
              style={{
                width: "300px",
                height: "620px",
                boxSizing: "border-box",
                padding: "10px",
                borderRadius: "46px",
                background: "#0E1A3D",
                boxShadow: "0 40px 80px -30px rgba(14,26,61,0.55), inset 0 0 0 2px #2A3763",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "37px",
                  background: "#FFFFFF",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "44px 20px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={s[8][lang]}>{t[25]}</span>
                  <span style={s[9][lang]}>{t[26]}</span>
                </div>
                <div
                  style={{
                    padding: "14px 20px 0",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      height: "118px",
                      borderRadius: "14px",
                      background: "#EEF3FF",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src="/design/truck-unloading.svg"
                      alt=""
                      style={{ width: "132px", height: "126px" }}
                    />
                    <span style={s[10][lang]}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                      {t[27]}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "118px",
                      borderRadius: "14px",
                      background: "#EEF3FF",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src="/design/carton-inspection.svg"
                      alt=""
                      style={{ width: "132px", height: "126px" }}
                    />
                    <span style={s[11][lang]}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                      {t[28]}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "118px",
                      borderRadius: "14px",
                      background: "#EEF3FF",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src="/design/wooden-crate.svg"
                      alt=""
                      style={{ width: "132px", height: "126px" }}
                    />
                    <span style={s[12][lang]}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                      {t[29]}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "118px",
                      borderRadius: "14px",
                      background: "#EEF3FF",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src="/design/forklift-loading.svg"
                      alt=""
                      style={{ width: "132px", height: "126px" }}
                    />
                    <span style={s[13][lang]}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                      {t[30]}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px 20px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#0E1A3D",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: "0",
                        display: "inline-flex",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#E3F6EC",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
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
                    {t[31]}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#0E1A3D",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: "0",
                        display: "inline-flex",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#E3F6EC",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
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
                    {t[32]}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#0E1A3D",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: "0",
                        display: "inline-flex",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#FFF1CC",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7A4E00"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                    </span>
                    {t[33]}
                  </div>
                </div>
                <div style={{ padding: "16px 20px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px",
                      borderRadius: "14px",
                      background: "#F5F7FC",
                    }}
                  >
                    <img
                      src="/design/spot-1.svg"
                      alt=""
                      style={{ width: "34px", height: "34px", flexShrink: "0" }}
                    />
                    <span style={{ fontSize: "12.5px", lineHeight: "1.4", color: "#4A5578" }}>
                      {t[34]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <img
            src="/design/spot-2.svg"
            alt=""
            style={{
              position: "absolute",
              left: "238px",
              top: "548px",
              width: "150px",
              height: "150px",
            }}
          />
        </div>
      </section>
      <section
        style={{ padding: "72px 120px", display: "flex", flexDirection: "column", gap: "32px" }}
      >
        <h2 style={s[14][lang]}>{t[35]}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "22px 28px",
          }}
        >
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
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
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[36]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[37]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 20h16" />
                <path d="M14.5 4.5l5 5L9 20H4v-5z" />
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[38]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[39]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 15h4" />
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[40]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[41]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
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
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[42]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[43]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[44]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[45]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: "0",
                display: "inline-flex",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#FFFFFF",
                border: "1px solid #DCE3F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
                <path d="M10 20a2 2 0 004 0" />
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>{t[46]}</span>
              <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                {t[47]}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section style={{ padding: "0 120px 72px" }}>
        <div
          style={{
            padding: "44px",
            borderRadius: "28px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <h2 style={s[15][lang]}>{t[48]}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "22px 28px",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #DCE3F2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#155DFC"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 6h12" />
                  <path d="M8 12h12" />
                  <path d="M8 18h12" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="4" cy="12" r="1" />
                  <circle cx="4" cy="18" r="1" />
                </svg>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>
                  {t[49]}
                </span>
                <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                  {t[50]}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #DCE3F2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#155DFC"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 6.5A7 7 0 007 12a7 7 0 0010 5.5" />
                  <path d="M4 10h9" />
                  <path d="M4 14h9" />
                </svg>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>
                  {t[51]}
                </span>
                <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                  {t[52]}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #DCE3F2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#155DFC"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="7" height="7" rx="1" />
                  <rect x="13" y="4" width="7" height="7" rx="1" />
                  <rect x="4" y="13" width="7" height="7" rx="1" />
                  <rect x="13" y="13" width="7" height="7" rx="1" />
                </svg>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>
                  {t[53]}
                </span>
                <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                  {t[54]}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: "0",
                  display: "inline-flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #DCE3F2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
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
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#0E1A3D" }}>
                  {t[55]}
                </span>
                <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#4A5578" }}>
                  {t[56]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        style={{
          background: "#155DFC",
          padding: "88px 120px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 520px",
          gap: "56px",
          alignItems: "center",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={s[16][lang]}>{t[57]}</h2>
          <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "#E3EBFF" }}>
            {t[58]}
          </p>
          <img src="/design/spot-3.svg" alt="" style={{ width: "200px", height: "200px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "16px 18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 16px 36px -20px rgba(14,26,61,0.45)",
            }}
          >
            <img
              src="/design/spot-4.svg"
              alt=""
              style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: "0" }}
            />
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                minWidth: "0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#4A5578" }}>
                  {t[59]}
                </span>
                <span style={{ fontSize: "12px", color: "#4A5578" }}>{t[60]}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#0E1A3D" }}>{t[61]}</span>
              <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#4A5578" }}>
                {t[62]}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "16px 18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 16px 36px -20px rgba(14,26,61,0.45)",
            }}
          >
            <img
              src="/design/spot-4.svg"
              alt=""
              style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: "0" }}
            />
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                minWidth: "0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#4A5578" }}>
                  {t[63]}
                </span>
                <span style={{ fontSize: "12px", color: "#4A5578" }}>{t[64]}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#0E1A3D" }}>{t[65]}</span>
              <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#4A5578" }}>
                {t[66]}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "16px 18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 16px 36px -20px rgba(14,26,61,0.45)",
            }}
          >
            <img
              src="/design/spot-4.svg"
              alt=""
              style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: "0" }}
            />
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                minWidth: "0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#4A5578" }}>
                  {t[67]}
                </span>
                <span style={{ fontSize: "12px", color: "#4A5578" }}>{t[68]}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#0E1A3D" }}>{t[69]}</span>
              <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#4A5578" }}>
                {t[70]}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "16px 18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 16px 36px -20px rgba(14,26,61,0.45)",
            }}
          >
            <img
              src="/design/spot-4.svg"
              alt=""
              style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: "0" }}
            />
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                minWidth: "0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#4A5578" }}>
                  {t[71]}
                </span>
                <span style={{ fontSize: "12px", color: "#4A5578" }}>{t[72]}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#0E1A3D" }}>{t[73]}</span>
              <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#4A5578" }}>
                {t[74]}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section style={{ padding: "88px 120px 104px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            padding: "40px 44px",
            borderRadius: "28px",
            background: "#EAF1FF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <img
              src="/design/spot-4.svg"
              alt=""
              style={{ width: "96px", height: "96px", flexShrink: "0" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h2 style={s[17][lang]}>{t[75]}</h2>
              <p style={{ margin: "0", fontSize: "16.5px", color: "#4A5578" }}>{t[76]}</p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: "520px",
            }}
          >
            <Link
              href={`/${lang}/application`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "56px",
                padding: "0 20px",
                borderRadius: "14px",
                background: "#0E1A3D",
                color: "#FFFFFF",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v12" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11.5px", color: "#B8C4E6" }}>{t[77]}</span>
                <span style={{ fontSize: "16px", fontWeight: "600" }} dir="ltr">
                  {t[78]}
                </span>
              </span>
            </Link>
            <Link
              href={`/${lang}/application`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "56px",
                padding: "0 20px",
                borderRadius: "14px",
                background: "#0E1A3D",
                color: "#FFFFFF",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v12" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11.5px", color: "#B8C4E6" }}>{t[79]}</span>
                <span style={{ fontSize: "16px", fontWeight: "600" }} dir="ltr">
                  {t[80]}
                </span>
              </span>
            </Link>
            <span style={{ fontSize: "14px", color: "#4A5578" }}>
              {t[81]} <span style={s[18][lang]}>{t[82]}</span> {t[83]}{" "}
              <span dir="ltr">{t[84]}</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
