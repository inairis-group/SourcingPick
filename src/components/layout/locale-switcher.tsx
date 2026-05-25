"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Locale switcher. Sets a 1-year cookie so the choice survives subsequent
 * visits, then navigates to the same path under the new locale prefix.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
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
    <div
      role="group"
      aria-label="Language"
      className={cn("inline-flex items-center gap-0.5 rounded-md border border-line p-0.5", className)}
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => change(loc)}
          aria-current={loc === currentLocale ? "true" : undefined}
          className={cn(
            "px-2.5 py-1 text-sm rounded-sm transition-colors duration-fast",
            loc === currentLocale
              ? "bg-action text-on-action"
              : "text-muted hover:text-fg hover:bg-subtle",
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
