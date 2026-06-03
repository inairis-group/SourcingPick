import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

/**
 * Safe markdown renderer used wherever a user has authored a long-form
 * description (product details, request notes, etc.). Built on
 * `react-markdown` + `rehype-sanitize` so authored HTML can't escape into
 * arbitrary tags / attributes — only the default safe list passes through.
 *
 * Headers and emphasis are styled inline because product descriptions
 * render inside cards with constrained widths; we don't want full
 * prose-class scale that would break the surrounding visual rhythm.
 */
export function MarkdownDisplay({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm text-fg leading-relaxed",
        // Keep header sizes restrained vs prose defaults
        "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-headline [&_h1]:mt-3 [&_h1]:mb-1.5",
        "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-headline [&_h2]:mt-3 [&_h2]:mb-1",
        "[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-headline [&_h3]:mt-2 [&_h3]:mb-1",
        "[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0",
        "[&_strong]:text-headline [&_strong]:font-semibold",
        "[&_em]:italic",
        "[&_ul]:list-disc [&_ul]:ps-5 [&_ul]:my-2",
        "[&_ol]:list-decimal [&_ol]:ps-5 [&_ol]:my-2",
        "[&_li]:my-0.5",
        "[&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-link-hover",
        "[&_code]:font-mono [&_code]:text-xs [&_code]:bg-subtle [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
        "[&_pre]:bg-subtle [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-2",
        "[&_blockquote]:border-s-2 [&_blockquote]:border-line [&_blockquote]:ps-3 [&_blockquote]:text-muted [&_blockquote]:my-2",
        "[&_hr]:my-3 [&_hr]:border-line",
        className,
      )}
    >
      <Markdown rehypePlugins={[rehypeSanitize]}>{source}</Markdown>
    </div>
  );
}
