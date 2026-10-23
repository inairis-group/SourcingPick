import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getSiteUrl, OTHER_APP_PRIVATE, PRIVATE_SEGMENTS } from "@/lib/seo/site";

/**
 * robots.txt for the whole host: this app's private areas in every language,
 * the API, and the other application's own private paths (it shares the host
 * and used to serve this file).
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  const disallow = [
    ...locales.flatMap((lang) => PRIVATE_SEGMENTS.map((seg) => `/${lang}/${seg}`)),
    "/api/",
    ...OTHER_APP_PRIVATE,
    // Session and post-login parameters on any page.
    "/*?session=",
    "/*?redirect=",
  ];

  return {
    rules: { userAgent: "*", allow: "/", disallow },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
