/**
 * Design tokens as TypeScript constants.
 *
 * The visual law for SourcingPick lives in src/styles/globals.css —
 * this file mirrors a subset of those values for places where TS
 * needs to read them (chart palettes, conditional styling, generated
 * email templates that can't rely on CSS variables).
 *
 * Keep this file and globals.css in sync. If a value differs between
 * the two, globals.css wins — change this file to match, not the other
 * way around.
 *
 * See docs/design-tokens.md for the rationale.
 */

export const brand = {
  50: "#eff4ff",
  100: "#dce6ff",
  200: "#b9cdff",
  300: "#8aabff",
  400: "#5582ff",
  500: "#155dfc",
  600: "#0a48d6",
  700: "#0738ab",
  800: "#0a2f86",
  900: "#0c2a6a",
  950: "#061846",
} as const;

export const ink = {
  default: "#162456",
  deep: "#0a1330",
} as const;

export const neutral = {
  0: "#ffffff",
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
} as const;

export const status = {
  success: { fg: "#166534", soft: "#dcfce7", edge: "#86efac" },
  warning: { fg: "#92400e", soft: "#fef3c7", edge: "#fcd34d" },
  danger: { fg: "#991b1b", soft: "#fee2e2", edge: "#fca5a5" },
  info: { fg: brand[700], soft: brand[50], edge: brand[200] },
} as const;

export const radius = {
  none: 0,
  sm: 3,
  md: 5,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
  pageish: 480,
} as const;

export const ease = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  emphasize: "cubic-bezier(0.2, 0, 0, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const;
