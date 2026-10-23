import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localeCookieName, locales } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/match-locale";
import { frenchAddressOf, frenchRouteOf } from "@/lib/i18n/site-paths";
import { isHiddenRoute, withoutLocale } from "@/lib/permissions/hidden-routes";

const PROTECTED_PREFIXES = ["/client", "/factory", "/agent", "/admin", "/shipper"] as const;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Old French addresses of pages the site no longer has, and where they went. */
const FRENCH_RETIRED: Readonly<Record<string, string>> = {
  "/fr/factories": "/services",
};

function rememberLocale(response: NextResponse, request: NextRequest, locale: string) {
  if (request.cookies.get(localeCookieName)?.value === locale) return;
  response.cookies.set({
    name: localeCookieName,
    value: locale,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // French pages live at the root under French addresses (see
  // lib/i18n/site-paths.ts): /tarifs is served by the /fr/pricing route,
  // without the address changing.
  const frenchRoute = frenchRouteOf(pathname);
  if (frenchRoute !== null) {
    // The home page included: it is French for everyone, search engines too.
    // No guess from Accept-Language or from the language cookie — a crawler
    // would be sent elsewhere, and a visitor choosing "Français" in the menu
    // would be sent back to the language they were leaving.
    const url = request.nextUrl.clone();
    url.pathname = `/fr${frenchRoute === "/" ? "" : frenchRoute}`;
    const forwarded = new Headers(request.headers);
    forwarded.set("x-locale", "fr");
    const response = NextResponse.rewrite(url, { request: { headers: forwarded } });
    response.headers.set("x-locale", "fr");
    rememberLocale(response, request, "fr");
    return response;
  }

  // The French pages' old addresses, permanently: one address per page is
  // what lets a search engine drop the duplicate.
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const route = pathname.slice(3) || "/";
    const address = FRENCH_RETIRED[pathname.replace(/\/+$/, "")] ?? frenchAddressOf(route);
    if (address) {
      const url = request.nextUrl.clone();
      url.pathname = address;
      return NextResponse.redirect(url, 301);
    }
  }

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

  // Sections the SaaS canvas does not draw do not resolve. Rewriting rather
  // than redirecting, so the address the visitor typed stays in the bar and
  // the response is an honest 404 instead of a bounce to somewhere they did
  // not ask for. This is presentation, not authorization: the route files
  // still exist and their own `requireRole` guards still run, which is what
  // keeps a rewrite from being the only thing between a bookmark and data.
  if (isHiddenRoute(withoutLocale(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathname.split("/")[1] ?? defaultLocale}/not-found`;
    return NextResponse.rewrite(url, { status: 404 });
  }

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
  if (isLocale(urlLocale)) rememberLocale(response, request, urlLocale);

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
