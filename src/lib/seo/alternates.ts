import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";

/**
 * `<link rel="canonical">` and the `hreflang` alternates of a public page.
 *
 * Every language version names itself as canonical and lists the others; the
 * French address (at the root) is also the `x-default`. A page that exists in
 * French only (`only: ["fr"]` — the service pages, the blog) is
 * French in every language's URL, so those URLs point at the French one.
 * Relative, resolved against the layout's `metadataBase`.
 */
export function pageAlternates(
  lang: Locale,
  route: string,
  only: readonly Locale[] = locales,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of only) languages[l] = sitePath(l, route);
  languages["x-default"] = sitePath("fr", route);
  return {
    canonical: sitePath(only.includes(lang) ? lang : "fr", route),
    languages,
  };
}
