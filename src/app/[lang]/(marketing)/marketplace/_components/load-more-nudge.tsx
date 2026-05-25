import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Public marketplace cap: anonymous browsers see the first 20 products. The
 * nudge renders below the grid — either an explicit "load more" CTA that
 * routes to /signup (when there are more products) or a generic "sign up to
 * buy" prompt (when the grid is already complete).
 *
 * Server-rendered so we can pick the correct dict + login URL based on locale
 * without an extra client roundtrip.
 */
export async function LoadMoreNudge({
  lang,
  hasMore,
  totalShown,
}: {
  lang: string;
  hasMore: boolean;
  totalShown: number;
}) {
  if (!isLocale(lang)) return null;
  const dict = await getDictionary(lang);
  if (totalShown === 0) return null;

  const signupHref = `/${lang}/signup/client`;
  const loginHref = `/${lang}/login`;

  return (
    <div
      className={cn(
        "mt-10 rounded-lg border border-line bg-surface px-6 py-8 text-center",
        "flex flex-col items-center gap-3",
      )}
    >
      <p className="text-sm font-semibold text-headline">
        {hasMore
          ? dict.publicMarketplace.loadMoreTitle
          : dict.publicMarketplace.endOfPreviewTitle}
      </p>
      <p className="text-xs text-muted max-w-md">
        {hasMore
          ? dict.publicMarketplace.loadMoreBody
          : dict.publicMarketplace.endOfPreviewBody}
      </p>
      <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
        <Link
          href={signupHref}
          className={cn(buttonClass({ variant: "primary", size: "sm" }))}
        >
          {dict.publicMarketplace.signupCta}
        </Link>
        <Link
          href={loginHref}
          className={cn(buttonClass({ variant: "secondary", size: "sm" }))}
        >
          {dict.publicMarketplace.loginCta}
        </Link>
      </div>
    </div>
  );
}
