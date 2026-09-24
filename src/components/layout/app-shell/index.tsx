import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { Role } from "@prisma/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import { appNav } from "./nav";
import { AppFrame } from "./frame";
import { AccountBlock } from "./account-block";

/**
 * The application shell, as the 2026-09 SaaS canvas draws it: a navy rail on
 * the left, a white bar across the top, the page in the remaining space.
 *
 * SUPERSEDES `RoleShell`, which was a top bar over a floating bottom pill.
 * Nothing of that layout survives — the canvas draws a different application
 * — so this is a replacement rather than a restyle.
 *
 * A role the canvas does not draw gets `notFound()` rather than a shell with
 * an empty sidebar. That is the visible half of Caystone's rule that anything
 * undrawn is not a feature; `hidden-routes.ts` is the other half.
 */
export async function AppShell({
  locale,
  role,
  children,
}: {
  locale: Locale;
  role: Role;
  children: ReactNode;
}) {
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const nav = appNav(role, locale, dict);
  if (!nav) notFound();

  const user = await getCurrentUser();

  return (
    // The canvas has one palette and no dark counterpart. Same mechanism the
    // marketing pages and the access screens use.
    <div className="theme-light">
      <AppFrame
        nav={nav}
        brandHref={nav.items[0]?.href ?? `/${locale}`}
        brandName={dict.brand.name}
        labels={{
          search: dict.nav.topbar.search,
          openMenu: dict.nav.topbar.openMenu,
          closeMenu: dict.nav.topbar.closeMenu,
        }}
        topbarEnd={
          <>
            <NotificationBell />
            <AccountBlock
              name={user?.name ?? user?.email ?? ""}
              role={nav.badge}
              image={user?.image ?? null}
            />
          </>
        }
      >
        {children}
      </AppFrame>
    </div>
  );
}
