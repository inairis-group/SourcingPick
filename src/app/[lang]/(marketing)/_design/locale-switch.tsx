"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { localeLabels, localeTags, locales, type Locale } from "@/lib/i18n/config";

/**
 * The language menu, and the strip along the foot of every page.
 *
 * The canvas draws twelve languages in both, and the site now speaks all
 * twelve — so the only thing here that departs from the drawing is the open
 * state, which a picture cannot have. The list comes from
 * `locales` while the styling — every border, radius and hex below — is lifted
 * from the artboard unchanged.
 *
 * The header control is a real menu because the canvas can draw a chevron
 * without having to make it do anything, and we cannot.
 */

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

  // Escape closes the menu. A control that opens from the keyboard has to
  // close from it too, and the click-away layer only catches pointers.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
          {/* Two columns, because twelve of anything in one column is a list
              you scroll rather than a menu you read. Six rows fits under the
              header on a laptop without the menu needing its own scrollbar,
              and the pairs stay in the canvas's own order. */}
          <ul
            role="menu"
            aria-label={localeLabels[lang]}
            style={{
              position: "absolute",
              insetInlineEnd: 0,
              top: "calc(100% + 10px)",
              zIndex: 50,
              margin: 0,
              padding: "8px",
              listStyle: "none",
              display: "grid",
              // An explicit width, because `1fr` tracks inside an
              // absolutely-positioned box with no width resolve against a
              // width that does not exist yet — which is what put a
              // horizontal scrollbar inside the menu.
              width: "min(calc(100vw - 32px), 420px)",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "2px",
              background: "#FFFFFF",
              border: "1px solid #DCE3F2",
              borderRadius: "16px",
              boxShadow: "0 18px 40px -20px rgba(14,26,61,0.45)",
              // No max-height and no scrolling: six rows of 40px is 266px
              // with the padding, which fits any window tall enough to have
              // shown the header that opened it. A menu you have to scroll to
              // find your own language in is not a menu.
            }}
          >
            {locales.map((l) => {
              const current = l === lang;
              return (
                <li key={l}>
                  <button
                    type="button"
                    role="menuitem"
                    lang={localeTags[l]}
                    aria-current={current ? "true" : undefined}
                    onClick={() => swap(l)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      minHeight: "40px",
                      padding: "0 10px",
                      border: 0,
                      borderRadius: "10px",
                      background: current ? "#EEF3FF" : "transparent",
                      color: current ? "#155DFC" : "#0E1A3D",
                      font: "inherit",
                      fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
                      fontSize: "14.5px",
                      fontWeight: current ? 600 : 500,
                      textAlign: "start",
                      cursor: "pointer",
                      transition: "background var(--duration-fast) var(--ease-default)",
                    }}
                    onMouseEnter={(e) => {
                      if (!current) e.currentTarget.style.background = "#F5F7FC";
                    }}
                    onMouseLeave={(e) => {
                      if (!current) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* The code carries the eye down the column when the
                        endonyms are in four different scripts. Always LTR:
                        "AR" is a code, not Arabic text. */}
                    <span
                      dir="ltr"
                      style={{
                        flexShrink: 0,
                        minWidth: "26px",
                        fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: current ? "#155DFC" : "#9FACD3",
                      }}
                    >
                      {l.toUpperCase()}
                    </span>
                    {/* `dir="auto"` renders the Arabic endonym correctly
                        without turning the whole row round, which would move
                        its code to the other side of the column. */}
                    <span
                      dir="auto"
                      style={{
                        flex: 1,
                        // Without this a flex item refuses to shrink below its
                        // content, and the ellipsis never engages.
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {localeLabels[l]}
                    </span>
                    {current && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#155DFC"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M5 12.5l4.5 4.5L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
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
          lang={localeTags[l]}
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
