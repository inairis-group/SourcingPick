// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: fr-FAQ.dc.html (and 11 more)
// Regenerate: npm run design:port
/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../../content/faq.ts, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { faq as content } from "../../content/faq";
import { Disclosure } from "../../disclosure";

export function FaqBoard({ lang }: { lang: Locale }) {
  const t = content.text[lang];
  const s = content.frStyles;

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
          <div style={s[0][lang]}>{t[0]}</div>
          <h1 style={s[1][lang]}>{t[1]}</h1>
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
            width: "300px",
            height: "300px",
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
            src="/design/picky-loupe.svg"
            alt=""
            style={{ width: "260px", height: "260px", objectFit: "contain" }}
          />
        </div>
      </section>
      <section style={{ padding: "0 120px 24px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a
          href="#faq-general"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#0E1A3D",
            color: "#FFFFFF",
            border: "1px solid #0E1A3D",
          }}
        >
          {t[3]}
        </a>
        <a
          href="#faq-logistique"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#FFFFFF",
            color: "#0E1A3D",
            border: "1px solid #DCE3F2",
          }}
        >
          {t[4]}
        </a>
        <a
          href="#faq-controle"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#FFFFFF",
            color: "#0E1A3D",
            border: "1px solid #DCE3F2",
          }}
        >
          {t[5]}
        </a>
        <Link
          href={`/${lang}/services`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#FFFFFF",
            color: "#0E1A3D",
            border: "1px solid #DCE3F2",
          }}
        >
          {t[6]}
        </Link>
        <a
          href="#faq-paiement"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#FFFFFF",
            color: "#0E1A3D",
            border: "1px solid #DCE3F2",
          }}
        >
          {t[7]}
        </a>
        <Link
          href={`/${lang}/application`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "44px",
            padding: "0 18px",
            borderRadius: "999px",
            fontSize: "15px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            background: "#FFFFFF",
            color: "#0E1A3D",
            border: "1px solid #DCE3F2",
          }}
        >
          {t[8]}
        </Link>
      </section>
      <section style={{ padding: "16px 120px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[2][lang]}>{t[9]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[3][lang]} aria-expanded="true">
                <span>{t[10]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[11]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[4][lang]} aria-expanded="true">
                <span>{t[12]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[13]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[5][lang]} aria-expanded="true">
                <span>{t[14]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[15]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[6][lang]} aria-expanded="true">
                <span>{t[16]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[17]} <span style={s[7][lang]}>{t[18]}</span>
              </p>
            </Disclosure>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[8][lang]}>{t[19]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[9][lang]} aria-expanded="true">
                <span>{t[20]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[21]} <span style={s[10][lang]}>{t[22]}</span>
                {t[23]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[11][lang]} aria-expanded="true">
                <span>{t[24]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                <span style={s[12][lang]}>{t[25]}</span>
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[13][lang]} aria-expanded="true">
                <span>{t[26]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                <span style={s[14][lang]}>{t[27]}</span>
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[15][lang]} aria-expanded="true">
                <span>{t[28]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                <span style={s[16][lang]}>{t[29]}</span>
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[17][lang]} aria-expanded="true">
                <span>{t[30]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[31]}
              </p>
            </Disclosure>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[18][lang]}>{t[32]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[19][lang]} aria-expanded="true">
                <span>{t[33]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[34]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[20][lang]} aria-expanded="true">
                <span>{t[35]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[36]}
              </p>
            </Disclosure>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[21][lang]}>{t[37]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[22][lang]} aria-expanded="true">
                <span>{t[38]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[39]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[23][lang]} aria-expanded="true">
                <span>{t[40]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[41]}
              </p>
            </Disclosure>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[24][lang]}>{t[42]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[25][lang]} aria-expanded="true">
                <span>{t[43]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[44]} <span style={s[26][lang]}>{t[45]}</span>
                {t[46]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[27][lang]} aria-expanded="true">
                <span>{t[47]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[48]} <span style={s[28][lang]}>{t[49]}</span>
                {t[50]}
              </p>
            </Disclosure>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            gap: "56px",
            padding: "40px 0",
            borderTop: "1px solid #DCE3F2",
          }}
        >
          <h2 style={s[29][lang]}>{t[51]}</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[30][lang]} aria-expanded="true">
                <span>{t[52]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                {t[53]}
              </p>
            </Disclosure>
            <Disclosure
              style={{
                borderBottom: "1px solid #DCE3F2",
                padding: "18px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button type="button" style={s[31][lang]} aria-expanded="true">
                <span>{t[54]}</span>
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
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "#4A5578",
                }}
              >
                <span style={s[32][lang]}>{t[55]}</span>
                {t[56]}
              </p>
            </Disclosure>
          </div>
        </div>
      </section>
      <section style={{ padding: "0 120px 104px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            padding: "32px 36px",
            borderRadius: "24px",
            background: "#FFFFFF",
            border: "1px solid #DCE3F2",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h2 style={s[33][lang]}>{t[57]}</h2>
            <p style={{ margin: "0", fontSize: "16px", color: "#4A5578" }}>{t[58]}</p>
          </div>
          <a href="mailto:contact@sourcingpick.com" style={s[34][lang]}>
            <span>
              <span dir="ltr">{t[59]}</span>
            </span>
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
