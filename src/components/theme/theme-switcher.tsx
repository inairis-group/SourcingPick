"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
const ICONS: Record<Theme, typeof Moon02Icon> = {
  light: Sun03Icon,
  dark: Moon02Icon,
  system: ComputerIcon,
};
const ORDER = ["light", "dark", "system"] as const;

/**
 * Inline 3-up theme switcher — same role as {@link ThemeToggle} but
 * without a Headless UI Menu popover. Used inside the mobile role-nav
 * overlay where an anchored portal would land underneath the modal's
 * stacking context (z-modal beats z-popover on purpose).
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const dict = useDictionary();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div
      role="group"
      aria-label={dict.theme.toggleLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-line p-0.5",
        className,
      )}
    >
      {ORDER.map((t) => {
        const active = t === theme;
        return (
          <button
            key={t}
            type="button"
            onClick={() => choose(t)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-sm",
              "transition-colors duration-fast",
              active
                ? "bg-action text-on-action"
                : "text-muted hover:text-fg hover:bg-subtle",
            )}
          >
            <HugeiconsIcon icon={ICONS[t]} size={14} strokeWidth={1.5} />
            <span>{dict.theme[t]}</span>
          </button>
        );
      })}
    </div>
  );
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  if (theme === "dark") html.classList.add("dark");
  else if (theme === "light") html.classList.add("light");
  else {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.classList.add(prefersDark ? "dark" : "light");
  }
  if (theme === "system") {
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable — cookie still wins */
  }
}

function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "light";
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
  return "light";
}
