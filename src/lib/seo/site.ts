import type { MetadataRoute } from "next";
import type { Locale } from "@/lib/i18n/config";

/**
 * Canonical public origin used to build absolute URLs across SEO surfaces
 * (sitemap, robots, metadataBase, Open Graph). Mirrors the fallback chain in
 * the payments redirect builder (lib/stripe/client.ts `getSiteUrl`) so dev and
 * prod agree on the origin. Set NEXT_PUBLIC_SITE_URL (or SITE_URL) in prod.
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  );
}

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

/**
 * The public pages, as routes (this app's folders: /pricing, /about), for the
 * sitemap. Their addresses come from `sitePath` — French at the root under
 * French slugs, the other languages at /<lang>/<route>. `only` marks a page
 * that exists in French alone. Not listed: the cookie policy (noindex), the
 * hidden marketplace and auctions, the legacy factories and delivery
 * calculator pages, and the contact, quote and app pages, which the other
 * application serves (see OTHER_APP_PAGES).
 */
export const PUBLIC_PAGES: Array<{
  route: string;
  only?: readonly Locale[];
  changeFrequency: ChangeFreq;
  priority: number;
}> = [
  { route: "/", changeFrequency: "weekly", priority: 1 },
  { route: "/services", changeFrequency: "weekly", priority: 0.95 },
  { route: "/comment-ca-marche", changeFrequency: "monthly", priority: 0.9 },
  { route: "/entrepot", changeFrequency: "monthly", priority: 0.9 },
  { route: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { route: "/faq", changeFrequency: "monthly", priority: 0.85 },
  { route: "/about", changeFrequency: "monthly", priority: 0.8 },
  { route: "/livraisons", changeFrequency: "monthly", priority: 0.8 },
  { route: "/outils/simulateur-import-cbm", changeFrequency: "monthly", priority: 0.9 },
  { route: "/legal/mentions-legales", changeFrequency: "yearly", priority: 0.3 },
  { route: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { route: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
];

/** Public French pages the other application serves at the root. */
export const OTHER_APP_PAGES: Array<{ path: string; changeFrequency: ChangeFreq; priority: number }> = [
  { path: "/demande", changeFrequency: "monthly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/application", changeFrequency: "monthly", priority: 0.5 },
];

/**
 * What the other application keeps out of search engines. Once this app
 * serves /robots.txt for the whole host, these have to be said here: they are
 * the other application's client area, administration and documents, copied
 * from the robots.txt it served (2026-10). Keep in step with it.
 */
export const OTHER_APP_PRIVATE = [
  "/admin", "/espace", "/devis", "/factures", "/avoirs", "/clients", "/documents",
  "/emails", "/journal", "/logs", "/parametres", "/paiements", "/sessions",
  "/societe", "/stock", "/statistiques", "/contrats", "/utilisateurs", "/agents",
  "/agent", "/commandes", "/demandes", "/gestion", "/imprimer", "/consulter",
  "/signer", "/acces", "/aide", "/connexion", "/verification",
  // Added by the SEO pack: the sign-up and the usual private entry points.
  "/inscription", "/login", "/register", "/dashboard/", "/app/", "/espace-client/",
];

/**
 * Locale-relative path segments that must never be indexed — authenticated
 * surfaces and auth/onboarding flows. Expanded per-locale in robots.ts.
 */
export const PRIVATE_SEGMENTS = [
  "admin",
  "agent",
  "client",
  "factory",
  "forwarder",
  "support",
  "messages",
  "login",
  "signup",
  "onboarding",
  "forgot-password",
  "reset-password",
  "verify-otp",
];
