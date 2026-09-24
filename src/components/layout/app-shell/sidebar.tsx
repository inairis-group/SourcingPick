"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Link } from "@/components/ui/link";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icons";
import type { AppNav, AppNavItem } from "./nav";

/**
 * The navy rail the canvas draws down the left of every application screen.
 *
 * Measurements are the artboard's: 248px wide, #0B1433, 26px/16px padding,
 * a 22px gap between the brand block and the navigation, 3px between rows,
 * and rows that are 44px tall with a 12px corner and 14px of side padding.
 *
 * Below `lg` it becomes a drawer. The canvas has no mobile artboards at all,
 * so this is the one part of the shell that is a decision rather than a
 * transcription: a 248px fixed rail leaves 72px of content on a 320px screen,
 * which is not a layout. Everything about the rail's appearance is unchanged
 * when it slides in — the same widths, the same rows — so the phone gets the
 * drawn sidebar rather than a different, smaller idea of one.
 */
export function AppSidebar({
  nav,
  open,
  onClose,
  brandHref,
  brandName,
  closeLabel,
}: {
  nav: AppNav;
  open: boolean;
  onClose: () => void;
  brandHref: string;
  brandName: string;
  closeLabel: string;
}) {
  const pathname = usePathname();

  // A tap on a nav row navigates; the drawer has to get out of the way by
  // itself, because the route change does not unmount it.
  useEffect(() => {
    onClose();
    // Closing depends on where we are, not on the identity of the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes the drawer. Only bound while it is open, so it never
  // competes with a dialog on the page underneath.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* The scrim exists only in drawer mode. `lg:hidden` rather than a
          conditional render so opening and closing can be animated. */}
      <div
        className={cn(
          "fixed inset-0 z-modal bg-overlay transition-opacity duration-base lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "bg-navy-950 box-border flex w-62 shrink-0 flex-col gap-[22px] px-4 py-6.5",
          // Drawer below lg, rail at lg and up.
          "fixed inset-y-0 start-0 z-modal overflow-y-auto transition-transform duration-base ease-emphasize",
          "lg:static lg:z-auto lg:translate-x-0 lg:rtl:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex flex-col gap-3 px-1.5">
          <div className="flex items-center justify-between gap-2">
            <Link href={brandHref} variant="muted" aria-label={brandName}>
              <Image
                src="/design/logo-white.svg"
                alt={brandName}
                width={123}
                height={28}
                priority
                className="h-7 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="text-navy-nav hover:text-white -me-1 rounded-lg p-1 transition-colors duration-fast lg:hidden"
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
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <span className="text-amber-edge inline-flex w-fit items-center gap-[7px] rounded-full bg-white/12 px-[11px] py-[5px] font-mono text-xs font-semibold tracking-wide uppercase">
            {nav.badge}
          </span>
        </div>

        <nav className="flex flex-col gap-[3px]" aria-label={nav.badge}>
          {nav.items.map((item) => (
            <Row key={item.key} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-[3px] border-t border-white/12 pt-3.5">
          {nav.footer.map((item) => (
            <Row key={item.key} item={item} pathname={pathname} muted />
          ))}
        </div>
      </aside>
    </>
  );
}

/**
 * Whether a row is the one you are on.
 *
 * Prefix rather than equality, because a request's detail page is still
 * "Requests" — but guarded so that `/admin` does not light up for every
 * administrator route that begins with it.
 */
function isCurrent(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

/** The row's appearance, which is the same whether it navigates or submits. */
function rowClass(current: boolean) {
  return cn(
    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-md text-start transition-colors duration-fast",
    current
      ? "bg-white/10 font-semibold text-white"
      : "text-navy-nav font-medium hover:bg-white/[0.06] hover:text-white",
  );
}

function Row({
  item,
  pathname,
  muted = false,
}: {
  item: AppNavItem;
  pathname: string;
  muted?: boolean;
}) {
  const current = !muted && isCurrent(item.href, pathname);
  const inner = (
    <>
      <span className={current ? "text-amber-edge" : "text-navy-navicon"}>
        <NavIcon name={item.icon} />
      </span>
      <span className="truncate">{item.label}</span>
    </>
  );

  // Signing out is a state change, so it posts. Wrapped in a form rather than
  // wired to an onClick so it still works with no JavaScript — the same
  // reason the button it replaces did.
  if (item.action === "logout") {
    return (
      <form action={logoutAction}>
        <button type="submit" className={rowClass(false)}>
          {inner}
        </button>
      </form>
    );
  }

  return (
    <Link
      href={item.href}
      variant="muted"
      aria-current={current ? "page" : undefined}
      className={rowClass(current)}
    >
      {inner}
    </Link>
  );
}
