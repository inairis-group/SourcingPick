"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Locale switch for the site header.
 *
 * The design draws twelve languages; we ship the four the product actually
 * has. Driving this from `locales` rather than from copy means the list can
 * never claim a language whose dictionary doesn't exist — a footer that
 * offers Polski and then 404s is worse than one that offers four.
 */
export function LocaleSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const swap = (next: Locale) => {
    // The locale is the first path segment; replacing it keeps the reader on
    // the same page rather than dumping them on the home page.
    const rest = pathname.replace(/^\/[^/]+/, "");
    router.push(`/${next}${rest || ""}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="border-navy-100 text-navy-900 hover:bg-navy-50 duration-fast inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold uppercase transition-colors"
      >
        {lang}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="border-navy-100 absolute end-0 z-40 mt-2 w-40 rounded-xl border bg-white p-1.5 shadow-lg"
          >
            {locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => swap(l)}
                  className={cn(
                    "hover:bg-navy-50 w-full rounded-lg px-3 py-2 text-start text-sm",
                    l === lang ? "text-action font-semibold" : "text-navy-900",
                  )}
                >
                  {localeLabels[l]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
