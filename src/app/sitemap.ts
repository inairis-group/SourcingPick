import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { getSiteUrl, PUBLIC_ROUTES } from "@/lib/seo/site";

/**
 * Localized sitemap. Every public route is emitted once (under the default
 * locale) with `alternates.languages` pointing at each locale variant, which
 * is the hreflang signal Google expects for a multilingual site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => {
    const suffix = path ? `/${path}` : "";
    const languages: Record<string, string> = {};
    for (const lang of locales) {
      languages[lang] = `${site}/${lang}${suffix}`;
    }
    return {
      url: `${site}/${defaultLocale}${suffix}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    };
  });
}
