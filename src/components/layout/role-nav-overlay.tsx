"use client";

import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Menu01Icon,
  MultiplicationSignIcon,
} from "@hugeicons/core-free-icons";
import { Logo } from "@/components/marketing/logo";
import { Link } from "@/components/ui/link";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import type { NavGroup } from "./role-nav";
import { cn } from "@/lib/utils";

/**
 * Full role menu — opens via the hamburger button in the top bar. Same
 * AIK/Kuiper-inspired pattern as the marketing mobile menu: full-page
 * panel, large bold links, grouped by section, slides up from below.
 */
export function RoleNavOverlay({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-md",
          "hover:bg-subtle transition-colors duration-fast",
          "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        )}
      >
        <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.75} />
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-modal">
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-base ease-default"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-fast ease-default"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-page/80 backdrop-blur-sm" aria-hidden />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition duration-slow ease-emphasize"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="transition duration-base ease-default"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <DialogPanel className="fixed inset-0 z-modal flex flex-col bg-page">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <Logo height={24} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-line-strong text-fg hover:bg-ghost-hover transition-colors duration-fast"
                >
                  <HugeiconsIcon
                    icon={MultiplicationSignIcon}
                    size={18}
                    strokeWidth={1.75}
                  />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6 sm:py-8">
                <div className="mx-auto max-w-3xl flex flex-col gap-6 sm:gap-8">
                  {groups.map((group) => (
                    <section key={group.label}>
                      {groups.length > 1 && (
                        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-faint mb-2">
                          {group.label}
                        </h3>
                      )}
                      <ul className="flex flex-col">
                        {group.items.map((item, i) => {
                          const isActive =
                            pathname === item.href ||
                            pathname?.startsWith(`${item.href}/`);
                          return (
                            <li
                              key={item.href}
                              className={i > 0 ? "border-t border-line-subtle" : undefined}
                            >
                              <Link
                                href={item.href}
                                variant="muted"
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "group flex items-center justify-between gap-3 py-3 sm:py-4",
                                  "text-lg sm:text-xl font-semibold transition-colors duration-fast",
                                  isActive
                                    ? "text-action"
                                    : "text-fg hover:text-action",
                                )}
                              >
                                <span className="flex items-center gap-3 min-w-0">
                                  <HugeiconsIcon
                                    icon={item.icon}
                                    size={20}
                                    strokeWidth={1.5}
                                    className={cn(
                                      "flex-shrink-0",
                                      isActive
                                        ? "text-action"
                                        : "text-faint group-hover:text-action",
                                    )}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </span>
                                <HugeiconsIcon
                                  icon={ArrowUpRight01Icon}
                                  size={16}
                                  strokeWidth={1.5}
                                  className={cn(
                                    "flex-shrink-0",
                                    isActive
                                      ? "text-action"
                                      : "text-faint group-hover:text-action",
                                  )}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              </nav>

              {/* Preferences footer — only relevant on viewports where these
                  utilities aren't already in the top bar, but harmless to
                  show everywhere since the menu is a temporary overlay. */}
              <div className="md:hidden border-t border-line-subtle px-4 py-4 bg-page">
                <div className="mx-auto max-w-3xl flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <LocaleDropdown display="full" />
                    <ThemeToggle display="full" />
                  </div>
                  <LogoutButton variant="icon" />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
