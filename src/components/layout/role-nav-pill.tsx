"use client";

import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/components/ui/link";
import type { NavItem } from "./role-nav";
import { cn } from "@/lib/utils";

/**
 * Floating bottom pill of primary nav routes. Mirror to the marketing
 * top pill so authenticated surfaces feel like the inverse of the public
 * site: the pill sits where the user's hand reaches on a phone, and on
 * desktop it's the closest thing to a permanent secondary nav without
 * sacrificing vertical space.
 *
 * Icon-only on small screens, icon + label on md+, keeping the footprint
 * tight regardless of viewport.
 */
export function RoleNavPill({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-3 sm:bottom-4 inset-x-0 z-sticky pointer-events-none",
        "flex justify-center px-3",
      )}
    >
      <ul
        className={cn(
          "pointer-events-auto inline-flex items-center gap-0.5 p-1",
          "rounded-full border border-line/70 bg-page/85 backdrop-blur-xl shadow-md",
        )}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                variant="muted"
                className={cn(
                  "group inline-flex items-center justify-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full",
                  "text-[12px] font-medium whitespace-nowrap transition-colors duration-fast",
                  isActive
                    ? "bg-action text-on-action"
                    : "text-fg hover:bg-ghost-hover",
                )}
                title={item.label}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-on-action" : "text-faint group-hover:text-fg",
                  )}
                />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
