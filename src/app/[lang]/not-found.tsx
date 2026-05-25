import { cookies, headers } from "next/headers";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * 404 — surfaces whenever a page calls notFound() or a route doesn't exist
 * under [lang]. We can't pull `lang` from params here (Next strips the
 * segment for not-found.tsx), so we resolve it from the locale cookie,
 * then the `x-locale` header set by the proxy, then the default.
 */
export default async function NotFoundPage() {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  const h = await headers();
  const fromProxy = h.get("x-locale");
  const lang =
    fromCookie && isLocale(fromCookie)
      ? fromCookie
      : fromProxy && isLocale(fromProxy)
        ? fromProxy
        : defaultLocale;
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-dvh bg-page flex flex-col">
      <header className="px-6 py-5">
        <Link href={`/${lang}`} variant="muted">
          <Logo height={24} />
          <span className="sr-only">SourcingPick</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center flex flex-col gap-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-faint">
            404
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
            {dict.errors.notFound.title}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {dict.errors.notFound.body}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <Link
              href={`/${lang}`}
              className={cn(buttonClass({ variant: "primary", size: "md" }))}
            >
              {dict.errors.notFound.home}
            </Link>
            <Link
              href={`/${lang}/marketplace`}
              className={cn(buttonClass({ variant: "secondary", size: "md" }))}
            >
              {dict.errors.notFound.browse}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
