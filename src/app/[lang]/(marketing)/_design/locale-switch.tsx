"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

/**
 * The one place the port departs from the canvas.
 *
 * The design draws twelve languages in the header dropdown and again along the
 * foot of every page. We ship four. Rendering the drawing literally would mean
 * eleven links to dictionaries that do not exist, so the list comes from
 * `locales` while the styling — every border, radius and hex below — is lifted
 * from the artboard unchanged.
 *
 * The header control is a real menu because the canvas can draw a chevron
 * without having to make it do anything, and we cannot.
 */

/** BCP 47 tags as the canvas spells them, for the `lang` attribute. */
const BCP47: Record<Locale, string> = {
  fr: "fr",
  en: "en-GB",
  zh: "zh-Hans",
  ar: "ar",
};

const BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  minHeight: "44px",
  padding: "0 14px",
  border: "1.5px solid #DCE3F2",
  borderRadius: "12px",
  background: "#FFFFFF",
  color: "#0E1A3D",
  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

function Globe({ size, stroke }: { size: number; stroke: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 3 2.8 15 0 18" />
      <path d="M12 3c-2.8 3-2.8 15 0 18" />
    </svg>
  );
}

export function LocaleSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const swap = (next: Locale) => {
    // The locale is the first path segment. Replacing it keeps the reader on
    // the page they were reading instead of returning them to the home page.
    router.push(`/${next}${pathname.replace(/^\/[^/]+/, "")}`);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={localeLabels[lang]}
        style={BUTTON}
      >
        <Globe size={18} stroke="#155DFC" />
        <span>{lang.toUpperCase()}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A5578"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-away layer. A button rather than a div so dismissing the
              menu is reachable from the keyboard as well as the mouse. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "transparent",
              border: 0,
              cursor: "default",
            }}
          />
          <ul
            role="menu"
            style={{
              position: "absolute",
              insetInlineEnd: 0,
              top: "calc(100% + 8px)",
              zIndex: 50,
              margin: 0,
              padding: "6px",
              listStyle: "none",
              minWidth: "180px",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "14px",
              boxShadow: "0 18px 40px -20px rgba(14,26,61,0.45)",
            }}
          >
            {locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  role="menuitem"
                  lang={BCP47[l]}
                  onClick={() => swap(l)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 12px",
                    border: 0,
                    borderRadius: "10px",
                    background: l === lang ? "#EEF3FF" : "transparent",
                    color: l === lang ? "#155DFC" : "#0E1A3D",
                    font: "inherit",
                    fontSize: "14px",
                    fontWeight: l === lang ? 600 : 500,
                    textAlign: "start",
                    cursor: "pointer",
                  }}
                >
                  {localeLabels[l]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * The language strip along the foot of every page.
 *
 * `label` is the canvas's own "12 langues" in whichever locale is being
 * rendered; the count is rewritten rather than the phrase, so the designer's
 * wording survives in all four.
 */
export function LocaleRow({ lang, label }: { lang: Locale; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "18px",
        flexWrap: "wrap",
        padding: "22px 0",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#8DB2FF",
          fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
          fontSize: "12px",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Globe size={16} stroke="#8DB2FF" />
        {label.replace(/\d+/, String(locales.length))}
      </span>
      {locales.map((l) => (
        <a
          key={l}
          href={`/${l}`}
          lang={BCP47[l]}
          style={{
            color: l === lang ? "#FFFFFF" : "#9FACD3",
            fontSize: "14px",
            fontWeight: l === lang ? 600 : 500,
          }}
        >
          {localeLabels[l]}
        </a>
      ))}
    </div>
  );
}
