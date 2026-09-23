"use client";

import { usePathname } from "next/navigation";
import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import styles from "./board.module.css";

/**
 * The header, with the menu a phone needs and the canvas could not draw.
 *
 * The porter swaps the transcribed `<header>` for this component (see
 * `header_retag` in scripts/design/port.py) and hands it every attribute and
 * child unchanged: the wordmark, the five-link nav, and the actions cluster
 * of language menu, client-area link and quote button. All of it stays
 * server-rendered; this file only adds the hamburger and, while it is open,
 * the drawer.
 *
 * The phone artboard (Site-Mobile.dc.html) draws the header as wordmark +
 * language button + a 44px hamburger, and nothing else — no nav, no quote
 * button. It does not draw the drawer, so the drawer is a judgement: a panel
 * that hangs from the header, listing the five links as rows and then the two
 * actions as the full-width buttons the same artboard uses in its hero. The
 * links in the drawer are the transcribed elements rendered a second time;
 * the drawer only exists while it is open, so at rest there is one copy of
 * every link in the document.
 *
 * Keyboard: Escape closes; Tab is trapped between the button and the drawer;
 * focus moves into the drawer on open and back to the button on close. The
 * page behind does not scroll while it is open.
 */

// aria-label of the hamburger in each locale's mobile artboard — the
// designer's own wording, not a translation made here. The button stays
// labelled "open" while expanded; `aria-expanded` carries the state.
const MENU_LABEL: Record<Locale, string> = {
  fr: "Ouvrir le menu",
  en: "Open menu",
  zh: "打开菜单",
  es: "Abrir menú",
  de: "Menü öffnen",
  it: "Apri il menu",
  pt: "Abrir o menu",
  nl: "Menu openen",
  ar: "فتح القائمة",
  ru: "Открыть меню",
  tr: "Menüyü aç",
  pl: "Otwórz menu",
};

type El = ReactElement<{ style?: CSSProperties; className?: string; children?: ReactNode }>;

const asElement = (node: ReactNode): El | null => (isValidElement(node) ? (node as El) : null);

// The hero's full-width button on the phone artboard: `width: 100%;
// justify-content: center; padding: 18px 28px; border-radius: 12px;
// font-size: 17px`. The drawer's two actions take that shape; the quote
// button keeps its own blue, the client-area link takes the artboard's
// outlined secondary style (`border: 1.5px solid #DCE3F2`).
const DRAWER_BUTTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "44px",
  padding: "18px 28px",
  borderRadius: "12px",
  fontFamily: "'Onest', 'Segoe UI', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: "17px",
  textAlign: "center",
  whiteSpace: "normal",
};

export function HeaderShell({
  lang,
  style,
  children,
}: {
  lang: Locale;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // The drawer remembers the page it was opened on: a navigation changes
  // the pathname and closes it without an effect having to.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) =>
    setOpenedOn((typeof next === "function" ? next(open) : next) ? pathname : null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const drawer = drawerRef.current;
    const focusables = (): HTMLElement[] => [
      ...(button ? [button] : []),
      ...Array.from(drawer?.querySelectorAll<HTMLElement>("a[href], button") ?? []),
    ];
    focusables()[1]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenedOn(null);
        return;
      }
      if (e.key !== "Tab") return;
      const ring = focusables();
      if (ring.length === 0) return;
      const first = ring[0];
      const last = ring[ring.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!ring.includes(active as HTMLElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
      button?.focus();
    };
  }, [open]);

  // The transcribed children, in the order the canvas draws them. The porter
  // asserts this shape (`assert_header_shape`), so the destructuring is safe.
  const [logo, nav, actions] = Children.toArray(children).map(asElement);
  const [locale, login, quote] = Children.toArray(actions?.props.children).map(asElement);

  const desktopOnly = (el: El | null) =>
    el &&
    cloneElement(el, {
      className: [el.props.className, styles.headerAction].filter(Boolean).join(" "),
    });

  const asRow = (el: El | null) =>
    el &&
    cloneElement(el, {
      className: styles.drawerLink,
      // The link's own colour and weight, at the phone artboard's body size.
      style: { ...el.props.style, fontSize: "16px", whiteSpace: "normal" },
    });

  return (
    <header style={style} className={styles.header} data-menu={open ? "open" : undefined}>
      {logo}
      {nav && cloneElement(nav, { className: styles.nav })}
      {actions &&
        cloneElement(actions, {}, [
          locale,
          desktopOnly(login),
          desktopOnly(quote),
          <button
            key="menu"
            ref={buttonRef}
            type="button"
            className={styles.burger}
            aria-label={MENU_LABEL[lang]}
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen((v) => !v)}
          >
            {/* The artboard's own glyph, 22px: three bars, each with a dot. */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0E1A3D"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M8 6h12" />
                  <path d="M8 12h12" />
                  <path d="M8 18h12" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="4" cy="12" r="1" />
                  <circle cx="4" cy="18" r="1" />
                </>
              )}
            </svg>
          </button>,
        ])}
      {open && (
        <>
          {/* Click-away layer below the drawer. A button so it is also
              dismissable from a switch device; keyboard users have Escape. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={styles.scrim}
            onClick={() => setOpen(false)}
          />
          <div id={drawerId} ref={drawerRef} className={styles.drawer}>
            {nav && (
              <nav
                aria-label={nav.props["aria-label" as keyof typeof nav.props] as string}
                className={styles.drawerNav}
              >
                {Children.toArray(nav.props.children).map((c) => asRow(asElement(c)))}
              </nav>
            )}
            <div className={styles.drawerActions}>
              {login &&
                cloneElement(login, {
                  style: {
                    ...login.props.style,
                    ...DRAWER_BUTTON,
                    background: "transparent",
                    color: "#0E1A3D",
                    border: "1.5px solid #DCE3F2",
                  },
                })}
              {quote && cloneElement(quote, { style: { ...quote.props.style, ...DRAWER_BUTTON } })}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
