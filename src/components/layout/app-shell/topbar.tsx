"use client";

import type { ReactNode } from "react";

/**
 * The white bar across the top of every application screen.
 *
 * The canvas draws it 76px tall with 28px of side padding: a search field
 * capped at 460px on the left, then the notification bell and the signed-in
 * person pushed to the far end by `margin-inline-start: auto`.
 *
 * The hamburger is the one addition, and it only exists below `lg`, where
 * the sidebar has become a drawer and would otherwise have no way to open.
 */
export function AppTopbar({
  search,
  openMenuLabel,
  onOpenMenu,
  children,
}: {
  search: string;
  openMenuLabel: string;
  onOpenMenu: () => void;
  /** The bell and the account block — server-rendered, passed through. */
  children: ReactNode;
}) {
  return (
    <div className="border-line bg-surface box-border flex h-19 shrink-0 items-center gap-3 border-b px-4 sm:gap-5 sm:px-7">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={openMenuLabel}
        className="border-line text-fg hover:bg-subtle inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-fast lg:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* A label, not a form: the canvas draws a search field, and what it
          searches is a screen that does not exist yet. It filters the page
          it is on once those screens land; until then it is honest about
          being a field rather than pretending to be a destination. */}
      <label className="border-line bg-page flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border px-3.5 sm:max-w-115">
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
          className="text-muted shrink-0"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <input
          type="search"
          placeholder={search}
          aria-label={search}
          className="text-fg placeholder:text-muted min-w-0 flex-1 border-0 bg-transparent text-[14.5px] outline-none"
        />
      </label>

      <div className="ms-auto flex shrink-0 items-center gap-2.5 sm:gap-3.5">{children}</div>
    </div>
  );
}
