"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, GlobeIcon } from "@hugeicons/core-free-icons";
import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Props = {
  /** "compact" hides the locale label on small screens, "full" always shows it. */
  display?: "compact" | "full";
  className?: string;
};

export function LocaleDropdown({ display = "compact", className }: Props) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const change = (next: Locale) => {
    if (next === currentLocale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    const newPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    router.push(newPath);
  };

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full h-9 px-3 text-sm font-medium text-fg",
          "hover:bg-ghost-hover transition-colors duration-fast",
          "data-focus:outline-2 data-focus:outline-focus data-focus:outline-offset-2",
        )}
        aria-label="Change language"
      >
        <HugeiconsIcon icon={GlobeIcon} size={16} strokeWidth={1.5} />
        <span className={cn(display === "compact" && "hidden sm:inline")}>
          {localeLabels[currentLocale]}
        </span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.5} className="text-faint" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className={cn(
          "z-popover mt-1 w-40 origin-top-right rounded-lg border border-line bg-page/95 backdrop-blur-md shadow-md p-1",
          "transition duration-fast ease-default",
          "data-closed:opacity-0 data-closed:scale-95",
          "focus:outline-none",
        )}
      >
        {locales.map((loc) => (
          <MenuItem key={loc}>
            <button
              type="button"
              onClick={() => change(loc)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-sm",
                "data-focus:bg-subtle",
                loc === currentLocale ? "text-headline font-medium" : "text-fg",
              )}
            >
              <span>{localeLabels[loc]}</span>
              {loc === currentLocale && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                  className="text-action"
                >
                  <path
                    d="M3 7l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
