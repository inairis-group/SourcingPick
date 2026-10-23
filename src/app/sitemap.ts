import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { getSiteUrl, OTHER_APP_PAGES, PUBLIC_PAGES } from "@/lib/seo/site";

/**
 * The sitemap of the whole host. Every language version of a page is listed
 * with all of its alternates (and the French address as x-default), which is
 * the hreflang form Google reads; French addresses are at the root.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const lastModified = new Date();
  const abs = (path: string) => `${site}${path}`;

  const pages = PUBLIC_PAGES.flatMap(({ route, only, changeFrequency, priority }) => {
    const langs = only ?? locales;
    const languages: Record<string, string> = {};
    for (const l of langs) languages[l] = abs(sitePath(l, route));
    if (langs.length > 1) languages["x-default"] = abs(sitePath("fr", route));
    return langs.map((lang) => ({
      url: abs(sitePath(lang, route)),
      lastModified,
      changeFrequency,
      // The French page leads; its translations rank just below it.
      priority: lang === "fr" ? priority : Math.round(priority * 0.8 * 100) / 100,
      ...(langs.length > 1 ? { alternates: { languages } } : {}),
    }));
  });

  const otherApp = OTHER_APP_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: abs(path),
    lastModified,
    changeFrequency,
    priority,
  }));

  return [...pages, ...otherApp];
}
