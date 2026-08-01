import { Role } from "@prisma/client";

/**
 * Canonical landing path for a given role. Used by post-login redirects
 * and by `requireRole()` after auth.
 */
export function dashboardPathForRole(role: Role, locale: string): string {
  switch (role) {
    case Role.CLIENT:
      return `/${locale}/client/dashboard`;
    case Role.FACTORY:
      return `/${locale}/factory/dashboard`;
    case Role.AGENT:
      return `/${locale}/agent/dashboard`;
    case Role.ADMIN:
      return `/${locale}/admin`;
    case Role.SHIPPER:
      return `/${locale}/shipper/shipments`;
  }
}

/**
 * Onboarding entry point. The page at this path inspects the session and
 * dispatches to /onboarding/client or /onboarding/factory (or silently
 * completes the flag and bounces staff to their dashboard).
 */
export function onboardingPath(locale: string): string {
  return `/${locale}/onboarding`;
}

/**
 * Settings page path per role. Distinct from dashboardPathForRole because
 * agent / client / factory keep settings at `/<role>/settings` while admin
 * settings live at `/admin/settings` (no `/admin/dashboard` segment).
 *
 * Used by the profile-save flow when the user changes locale, so we land
 * them back on the settings page in the new language.
 */
export function settingsPathForRole(role: Role, locale: string): string {
  switch (role) {
    case Role.CLIENT:
      return `/${locale}/client/settings`;
    case Role.FACTORY:
      return `/${locale}/factory/settings`;
    case Role.AGENT:
      return `/${locale}/agent/settings`;
    case Role.ADMIN:
      return `/${locale}/admin/settings`;
    case Role.SHIPPER:
      return `/${locale}/shipper/settings`;
  }
}
