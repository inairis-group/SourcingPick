/**
 * The blog's articles (/blog/<slug>), French only.
 *
 * Empty on purpose: the SEO pack gives a writing brief and twenty subjects
 * (04_Master_Prompt_Claude_Articles_Blog_SEO), not articles, and an article
 * must not invent the "what we see at our warehouse" cases the brief asks
 * for. While this list is empty /blog answers 404 and nothing links to it or
 * lists it in the sitemap.
 *
 * To publish one, add an entry — the fields are the brief's front matter —
 * with the article in Markdown (`## ` for its H2s; tables are allowed). See
 * docs/content/blog.md.
 */

export type BlogArticle = {
  /** The address: /blog/<slug>. */
  slug: string;
  /** Publication date, YYYY-MM-DD. */
  date: string;
  /** The H1. */
  title: string;
  /** <title>, ending with "| Sourcing Pick". */
  metaTitle: string;
  metaDescription: string;
  /** The opening paragraph(s), Markdown. */
  lead: string;
  /** The rest of the article, Markdown, without its final FAQ. */
  body: string;
  /** The final questions, shown at the end and given to search engines as a FAQPage. */
  faq?: ReadonlyArray<{ question: string; answer: string }>;
};

export const BLOG_ARTICLES: readonly BlogArticle[] = [];

export function blogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
