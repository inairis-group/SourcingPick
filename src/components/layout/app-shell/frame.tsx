"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "./sidebar";
import { AppTopbar } from "./topbar";
import type { AppNav } from "./nav";

/**
 * Holds the one piece of state the shell has: whether the drawer is open.
 *
 * It exists so that `AppShell` can stay a server component. Everything with
 * real content — the page, the notification bell, the account block — is
 * passed through as children and rendered on the server; only the open/closed
 * flag and the two controls that read it live on the client.
 */
export function AppFrame({
  nav,
  brandHref,
  brandName,
  labels,
  topbarEnd,
  children,
}: {
  nav: AppNav;
  brandHref: string;
  brandName: string;
  labels: { search: string; openMenu: string; closeMenu: string };
  topbarEnd: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-page flex min-h-dvh">
      <AppSidebar
        nav={nav}
        open={open}
        onClose={() => setOpen(false)}
        brandHref={brandHref}
        brandName={brandName}
        closeLabel={labels.closeMenu}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          search={labels.search}
          openMenuLabel={labels.openMenu}
          onOpenMenu={() => setOpen(true)}
        >
          {topbarEnd}
        </AppTopbar>
        {/* 28px padding and a 22px stack — the canvas's <main> on every
            board. Tightened to 16px below `sm`, where 28px of gutter on a
            360px screen costs a fifth of the width. */}
        <main className="flex flex-1 flex-col gap-[22px] p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
