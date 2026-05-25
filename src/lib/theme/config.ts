/**
 * Theme persistence — cookie-backed.
 *
 * Why cookie instead of just localStorage:
 *   The root layout re-renders on every locale change (the [lang] segment
 *   is a layout boundary, so navigating /fr → /en re-runs the layout).
 *   React reconciles the <html> className prop with reality, which would
 *   wipe any .dark/.light class we'd added at runtime via JS. So the
 *   server must know the theme up front and render it into className.
 *
 * Cookie semantics:
 *   - Absent              → "system" (CSS media query takes over)
 *   - "dark" / "light"    → explicit user choice
 *   We don't store "system" as a cookie value; absence is the signal.
 *
 * localStorage is kept in sync for legacy clients + so the ThemeScript
 * can do a final paint-time check before hydration.
 */

export const THEME_COOKIE = "sp_theme";
export const THEME_STORAGE_KEY = "sp_theme";

export type StoredTheme = "light" | "dark";
export type ThemeChoice = StoredTheme | "system";

export function isStoredTheme(value: string | undefined): value is StoredTheme {
  return value === "light" || value === "dark";
}
