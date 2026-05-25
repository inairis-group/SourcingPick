import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  localeCookieName,
  locales,
} from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/match-locale";

const PROTECTED_PREFIXES = ["/client", "/factory", "/agent", "/admin"] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!pathnameHasLocale) {
    const locale = resolveLocale(
      request.cookies.get(localeCookieName)?.value,
      request.headers.get("accept-language"),
    );
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // TODO Phase 1: optimistic auth-cookie check on PROTECTED_PREFIXES.
  // Full role enforcement happens in role layouts via requireRole() —
  // do NOT trust the proxy for authorization.
  void PROTECTED_PREFIXES;

  const locale = pathname.split("/")[1] ?? defaultLocale;
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
