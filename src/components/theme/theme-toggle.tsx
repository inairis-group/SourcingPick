"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import {
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "@/lib/theme/config";
import { cn } from "@/lib/utils";

type Theme = ThemeChoice;

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function writeThemeCookie(theme: Theme) {
  if (typeof document === "undefined") return;
  if (theme === "system") {
    // Expire the cookie so absence becomes "system".
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  if (theme === "dark") html.classList.add("dark");
  if (theme === "light") html.classList.add("light");
  writeThemeCookie(theme);
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable — cookie still wins */
  }
}

function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "system";
  // Cookie is the source of truth (the server reads it); fall back to
  // localStorage only for legacy clients that haven't written the cookie yet.
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${THEME_COOKIE}=`));
  const fromCookie = match?.split("=")[1];
  if (fromCookie === "dark" || fromCookie === "light") return fromCookie;
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    if (t === "dark" || t === "light") return t;
  } catch {
    /* ignore */
  }
  return "system";
}

const ICONS: Record<Theme, typeof Moon02Icon> = {
  light: Sun03Icon,
  dark: Moon02Icon,
  system: ComputerIcon,
};

export function ThemeToggle({
  display = "compact",
}: {
  /** "compact" hides the label on small screens, "full" always shows it. */
  display?: "compact" | "full";
}) {
  const dict = useDictionary();
  const [theme, setTheme] = useState<Theme>("system");

  // Hydrate from storage after mount — initial markup stays deterministic
  // and the ThemeScript handles the class application before first paint.
  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  const labelFor = (t: Theme) => dict.theme[t];

  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label={dict.theme.toggleLabel}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full h-9 px-3 text-sm font-medium text-fg",
          "hover:bg-ghost-hover transition-colors duration-fast",
          "data-focus:outline-2 data-focus:outline-focus data-focus:outline-offset-2",
        )}
      >
        <HugeiconsIcon icon={ICONS[theme]} size={16} strokeWidth={1.5} />
        <span className={cn(display === "compact" && "hidden sm:inline")}>
          {labelFor(theme)}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          strokeWidth={1.5}
          className="text-faint"
        />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className={cn(
          "z-popover mt-1 w-40 origin-top-right rounded-lg border border-line bg-page/95 backdrop-blur-md shadow-md p-1",
          "transition duration-fast ease-default",
          "data-closed:opacity-0 data-closed:scale-95",
          "focus:outline-none",
        )}
      >
        {(["light", "dark", "system"] as Theme[]).map((t) => (
          <MenuItem key={t}>
            <button
              type="button"
              onClick={() => choose(t)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-sm",
                "data-focus:bg-subtle",
                t === theme ? "text-headline font-medium" : "text-fg",
              )}
            >
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={ICONS[t]} size={14} strokeWidth={1.5} />
                {labelFor(t)}
              </span>
              {t === theme && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                  className="text-action"
                >
                  <path
                    d="M3 7l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
