import { isLocale, type Locale } from "./config";

/**
 * Where a public page lives.
 *
 * French, the site's first language, is served at the root under French
 * addresses — /tarifs, /a-propos, /mentions — which are the addresses the
 * site always published and that search engines hold. The other eleven
 * languages keep /<lang>/<route>. Routes are this app's own folders
 * (/pricing, /about, /legal/mentions-legales): the proxy rewrites a French
 * address to its route, and sends the old /fr/<route> to the French address
 * with a permanent redirect.
 */

/** Route → its French address at the root. */
const FRENCH: Readonly<Record<string, string>> = {
  "/": "/",
  "/services": "/services",
  "/comment-ca-marche": "/comment-ca-marche",
  "/entrepot": "/entrepot",
  "/pricing": "/tarifs",
  "/faq": "/faq",
  "/about": "/a-propos",
  "/livraisons": "/livraisons",
  "/legal/mentions-legales": "/mentions",
  "/legal/privacy": "/confidentialite",
  "/legal/terms": "/cgv",
  "/legal/cookies": "/cookies",
  "/outils/simulateur-import-cbm": "/outils/simulateur-import-cbm",
  "/blog": "/blog",
};

/** Routes whose pages below keep their own path: /services/<page>, /blog/<article>. */
const FRENCH_SECTIONS = ["/services/", "/blog/"] as const;

/**
 * Pages the other application serves on the same host — the forms the team
 * reads (contact, quote request) and the app page. In French they are its
 * root addresses; in the other languages, /<lang>/<route>, which the server
 * forwards there.
 */
const OTHER_APP_FRENCH: Readonly<Record<string, string>> = {
  "/contact": "/contact",
  "/devis": "/demande",
  "/application": "/application",
};

const FRENCH_TO_ROUTE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FRENCH).map(([route, address]) => [address, route]),
);

function split(target: string): [string, string] {
  const at = target.search(/[?#]/);
  return at === -1 ? [target, ""] : [target.slice(0, at), target.slice(at)];
}

function inFrenchSection(path: string): boolean {
  return FRENCH_SECTIONS.some((s) => path.startsWith(s) && path.length > s.length);
}

/** True for a route whose page is served by the other application. */
export function isOtherAppRoute(route: string): boolean {
  return split(route)[0] in OTHER_APP_FRENCH;
}

/**
 * The address of `route` (with an optional ?query or #fragment) in `lang`.
 *
 *   sitePath("fr", "/pricing")        → "/tarifs"
 *   sitePath("fr", "/#verite")        → "/#verite"
 *   sitePath("en", "/pricing")        → "/en/pricing"
 *   sitePath("en", "/")               → "/en"
 *   sitePath("fr", "/devis")          → "/demande"
 */
export function sitePath(lang: Locale, route: string): string {
  const [path, tail] = split(route);
  if (lang === "fr") {
    const address =
      FRENCH[path] ??
      OTHER_APP_FRENCH[path] ??
      (inFrenchSection(path) ? path : `/fr${path === "/" ? "" : path}`);
    return address + tail;
  }
  return `/${lang}${path === "/" ? "" : path}${tail}`;
}

/** A French address at the root → its route, or null when it is not one. */
export function frenchRouteOf(pathname: string): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path in FRENCH_TO_ROUTE) return FRENCH_TO_ROUTE[path];
  if (inFrenchSection(path)) return path;
  return null;
}

/** A route → its French address at the root, or null when French keeps /fr. */
export function frenchAddressOf(route: string): string | null {
  const path = route.length > 1 ? route.replace(/\/+$/, "") : route;
  if (path in FRENCH) return FRENCH[path];
  if (inFrenchSection(path)) return path;
  return null;
}

/**
 * The language and route of the page at `pathname`, whichever form it is
 * read in: /en/pricing, /fr/pricing, or the French /tarifs.
 */
export function pageOf(pathname: string): { lang: Locale; route: string } {
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) {
    return { lang: first, route: pathname.slice(first.length + 1) || "/" };
  }
  return { lang: "fr", route: frenchRouteOf(pathname) ?? pathname };
}
