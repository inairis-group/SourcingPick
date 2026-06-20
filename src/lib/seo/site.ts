import type { MetadataRoute } from "next";

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
 * Locale-relative public routes (no `/[lang]` prefix) that are safe to index.
 * Authenticated dashboards, auth/onboarding flows and API routes are excluded
 * here and disallowed in robots.ts. Dynamic detail pages (marketplace/[id],
 * auctions/[id]) are intentionally omitted — add a DB-backed sitemap segment
 * when we want individual listings indexed.
 */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: ChangeFreq;
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "marketplace", changeFrequency: "daily", priority: 0.9 },
  { path: "auctions", changeFrequency: "daily", priority: 0.8 },
  { path: "pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "factories", changeFrequency: "weekly", priority: 0.7 },
  { path: "about", changeFrequency: "monthly", priority: 0.6 },
  { path: "faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "delivery-calculator", changeFrequency: "monthly", priority: 0.5 },
  { path: "legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "legal/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "legal/security", changeFrequency: "yearly", priority: 0.3 },
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
