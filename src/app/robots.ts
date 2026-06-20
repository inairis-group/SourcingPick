import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getSiteUrl, PRIVATE_SEGMENTS } from "@/lib/seo/site";

/**
 * Allow crawling of public marketing pages; disallow authenticated dashboards,
 * auth/onboarding flows and the API. Private segments are listed per-locale
 * (e.g. /fr/admin, /en/admin) since every route is under `/[lang]`.
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  const disallow = [
    ...locales.flatMap((lang) =>
      PRIVATE_SEGMENTS.map((seg) => `/${lang}/${seg}`),
    ),
    "/api/",
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
