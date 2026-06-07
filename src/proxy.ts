import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
} from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/match-locale";

const PROTECTED_PREFIXES = ["/client", "/factory", "/agent", "/admin"] as const;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

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
    const redirect = NextResponse.redirect(url);
    // Sticky locale: persist the resolved choice so any subsequent
    // unprefixed navigation honours it instead of re-running
    // Accept-Language negotiation (which can disagree between visits
    // for users whose browser sends multiple high-weight languages).
    redirect.cookies.set({
      name: localeCookieName,
      value: locale,
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
      sameSite: "lax",
    });
    return redirect;
  }

  // TODO Phase 1: optimistic auth-cookie check on PROTECTED_PREFIXES.
  // Full role enforcement happens in role layouts via requireRole() —
  // do NOT trust the proxy for authorization.
  void PROTECTED_PREFIXES;

  const urlLocale = pathname.split("/")[1] ?? defaultLocale;
  // Forward `x-locale` to RSC + server actions via the REQUEST
  // headers — `response.headers.set(...)` only puts it on the
  // response to the browser, leaving `headers().get("x-locale")`
  // null for downstream `currentLocale()` helpers. That null fell
  // through to `defaultLocale = "fr"` and redirected the user to a
  // `/fr/...` URL, flipping their locale silently after a server
  // action (Order Now, sign-up, etc.).
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-locale", urlLocale);
  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });
  response.headers.set("x-locale", urlLocale);

  // Keep the cookie in lockstep with whatever URL the user is actually
  // on. Two reasons:
  //   1. They explicitly typed / linked to /<lang>/... — that's a
  //      stronger signal than the original Accept-Language guess.
  //   2. A stale cookie pointing at a different locale would flip the
  //      page back the next time they hit an unprefixed redirect (the
  //      partner-reported "English keeps flipping to French" bug).
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (isLocale(urlLocale) && cookieLocale !== urlLocale) {
    response.cookies.set({
      name: localeCookieName,
      value: urlLocale,
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
