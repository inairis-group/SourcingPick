import type { ReactNode } from "react";
import type { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/marketing/logo";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MessagesBell } from "@/components/messaging/messages-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RoleNavPill } from "@/components/layout/role-nav-pill";
import { RoleNavOverlay } from "@/components/layout/role-nav-overlay";
import { navForRole, primaryItems } from "@/components/layout/role-nav";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  role: Role;
  children: ReactNode;
};

/**
 * Authenticated app shell.
 *
 * Top bar (mobile):  hamburger · logo · messages · notifications
 * Top bar (md+):     hamburger · logo · messages · notifications
 *                                              · locale · theme · logout
 * Bottom pill:       primary routes for the current role.
 *
 * Locale / theme / logout collapse into the hamburger overlay on mobile so
 * the top bar stays uncluttered — three icon-only utilities still fit
 * comfortably alongside the brand at small widths.
 *
 * `pb-24` on <main> reserves room so the pill never covers content.
 */
export async function RoleShell({ locale, role, children }: Props) {
  if (!isLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  const dict = await getDictionary(locale);
  const groups = navForRole(role, locale, dict);
  const pillItems = primaryItems(groups);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="border-b border-line-subtle bg-page/80 backdrop-blur-sm sticky top-0 z-sticky">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <RoleNavOverlay groups={groups} />
            <Link
              href={dashboardPathForRole(role, locale)}
              variant="muted"
              className="shrink-0"
            >
              <Logo height={22} />
              <span className="sr-only">SourcingPick</span>
            </Link>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <MessagesBell />
            <NotificationBell />
            <div className="hidden md:flex items-center gap-1 ps-1 ms-1 border-s border-line-subtle">
              <LocaleDropdown display="compact" />
              <ThemeToggle display="compact" />
              <LogoutButton variant="labelled" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      {pillItems.length > 0 && <RoleNavPill items={pillItems} />}
    </div>
  );
}
