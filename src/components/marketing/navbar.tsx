"use client";

import { Fragment, useState } from "react";
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
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "./logo";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Floating pill navbar — sticky, centred, away from the viewport edge.
 *
 * `mt-4` on the header gives a consistent 16px gap from the top of the
 * viewport at all scroll positions (including scroll=0). `sticky top-4`
 * pins it there once scroll begins.
 *
 * Mobile menu: full-page overlay (not a collapse-in-pill panel) — preserves
 * the pill shape and matches the Kuiper / AIK pattern Caystone called out.
 */
export function MarketingNavbar({
  signedIn = false,
  dashboardHref,
}: {
  signedIn?: boolean;
  dashboardHref?: string | null;
} = {}) {
  const dict = useDictionary();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: `/${locale}/marketplace`, label: dict.nav.marketplace },
    { href: `/${locale}/pricing`, label: dict.footer.pricing },
    { href: `/${locale}/about`, label: dict.footer.about },
  ];

  const resolvedDashboardHref = dashboardHref ?? `/${locale}`;

  return (
    <>
      <header className="fixed w-full top-0 z-50 mt-4 px-4">
        <div className="mx-auto max-w-5xl">
          <nav
            className={cn(
              "flex items-center justify-between gap-3 h-14 px-3 sm:ps-5 sm:pe-3",
              "rounded-full border border-line/70 bg-page/85 backdrop-blur-xl",
            )}
          >
            <Link href={`/${locale}`} variant="muted" className="shrink-0 px-1">
              <Logo height={24} priority />
              <span className="sr-only">SourcingPick</span>
            </Link>

            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    variant="muted"
                    className="inline-flex items-center h-9 px-3 rounded-full text-sm font-medium whitespace-nowrap hover:bg-ghost-hover transition-colors duration-fast"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden md:flex items-center gap-1">
              <ThemeToggle display="compact" />
              <LocaleDropdown display="compact" />
              {signedIn ? (
                <Link
                  href={resolvedDashboardHref}
                  className={cn(
                    buttonClass({ variant: "primary", size: "sm" }),
                    "rounded-full whitespace-nowrap",
                  )}
                >
                  {dict.nav.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    variant="muted"
                    className="inline-flex items-center h-9 px-3 rounded-full text-sm font-medium whitespace-nowrap hover:bg-ghost-hover transition-colors duration-fast"
                  >
                    {dict.auth.login.submit}
                  </Link>
                  <Link
                    href={`/${locale}/signup`}
                    className={cn(
                      buttonClass({ variant: "primary", size: "sm" }),
                      "rounded-full whitespace-nowrap",
                    )}
                  >
                    {dict.marketing.hero.ctaPrimary}
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-1">
              <ThemeToggle display="compact" />
              <LocaleDropdown display="compact" />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-fg hover:bg-ghost-hover transition-colors duration-fast"
              >
                <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.75} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        signedIn={signedIn}
        loginLabel={dict.auth.login.submit}
        ctaLabel={dict.marketing.hero.ctaPrimary}
        dashboardLabel={dict.nav.dashboard}
        loginHref={`/${locale}/login`}
        signupHref={`/${locale}/signup`}
        dashboardHref={resolvedDashboardHref}
      />
    </>
  );
}

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  navItems: Array<{ href: string; label: string }>;
  signedIn: boolean;
  loginLabel: string;
  ctaLabel: string;
  dashboardLabel: string;
  loginHref: string;
  signupHref: string;
  dashboardHref: string;
};

function MobileMenu({
  open,
  onClose,
  navItems,
  signedIn,
  loginLabel,
  ctaLabel,
  dashboardLabel,
  loginHref,
  signupHref,
  dashboardHref,
}: MobileMenuProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="md:hidden relative z-50">
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
            {/* Top bar — brand + close, matches the pill's vertical rhythm */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <Logo height={24} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-line-strong text-fg hover:bg-ghost-hover transition-colors duration-fast"
              >
                <HugeiconsIcon icon={MultiplicationSignIcon} size={18} strokeWidth={1.75} />
              </button>
            </div>

            {/* Nav items — large bold links, AIK/Kuiper style */}
            <nav className="flex-1 px-4 py-8 overflow-y-auto">
              <ul className="flex flex-col">
                {navItems.map((item, i) => (
                  <li key={item.href} className={i > 0 ? "border-t border-line-subtle" : undefined}>
                    <Link
                      href={item.href}
                      variant="muted"
                      onClick={onClose}
                      className="group flex items-center justify-between py-5 text-3xl font-bold text-headline hover:text-action transition-colors duration-fast"
                    >
                      <span>{item.label}</span>
                      <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        size={20}
                        strokeWidth={1.5}
                        className="text-faint group-hover:text-action transition-colors duration-fast"
                      />
                    </Link>
                  </li>
                ))}
                {!signedIn && (
                  <li className="border-t border-line-subtle">
                    <Link
                      href={loginHref}
                      variant="muted"
                      onClick={onClose}
                      className="group flex items-center justify-between py-5 text-xl font-semibold text-muted hover:text-fg transition-colors duration-fast"
                    >
                      <span>{loginLabel}</span>
                      <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        size={18}
                        strokeWidth={1.5}
                        className="text-faint group-hover:text-fg transition-colors duration-fast"
                      />
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* CTA pinned at the bottom */}
            <div className="px-4 pb-6 pt-4 border-t border-line-subtle">
              <Link
                href={signedIn ? dashboardHref : signupHref}
                onClick={onClose}
                className={cn(
                  buttonClass({ variant: "primary", size: "lg", fullWidth: true }),
                )}
              >
                {signedIn ? dashboardLabel : ctaLabel}
              </Link>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
