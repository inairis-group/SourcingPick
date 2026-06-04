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
  /** Where the menu opens relative to the trigger. Defaults to "bottom end" for the top bar; overlay usage flips to "top end" so it doesn't run off-screen. */
  align?: "bottom end" | "top end" | "bottom start" | "top start";
  /** Extra classes appended to the MenuItems wrapper (e.g. higher z-index). */
  menuClassName?: string;
  /**
   * Render the items inside the Menu wrapper (absolutely positioned)
   * instead of via Headless UI's anchored portal. The portal mode is
   * great for top-bar usage but breaks inside `<Dialog>` — the Dialog
   * inert-ifies its siblings, killing pointer events on the portal.
   * The mobile role-nav overlay sets this to true.
   */
  inline?: boolean;
};

export function LocaleDropdown({
  display = "compact",
  className,
  align = "bottom end",
  menuClassName,
  inline = false,
}: Props) {
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
        {...(inline ? {} : { anchor: align })}
        className={cn(
          "w-40 rounded-lg border border-line bg-page/95 backdrop-blur-md shadow-md p-1",
          "transition duration-fast ease-default",
          "data-closed:opacity-0 data-closed:scale-95",
          "focus:outline-none",
          inline
            ? [
                "absolute",
                align.startsWith("top") ? "bottom-full mb-1" : "top-full mt-1",
                align.endsWith("end") ? "inset-e-0 origin-bottom-right" : "inset-s-0 origin-bottom-left",
                "z-overlay-popover",
              ]
            : ["z-popover mt-1 origin-top-right"],
          menuClassName,
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
