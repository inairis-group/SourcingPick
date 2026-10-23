import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CSSProperties, ReactNode } from "react";

/**
 * Markdown in the site's own type and colours — the long-form pages of the
 * SEO pack (service pages, blog articles) are written in Markdown and set
 * here with the canvas's values: Unbounded headings in navy, Onest body in
 * slate, the green check of the service cards on bullet lists, the blue disc
 * of the sourcing steps on numbered ones, tables as the white rounded cards
 * the pricing page draws.
 *
 * Content is ours (committed files), not user input; raw HTML in it is not
 * rendered all the same.
 */

const NAVY = "#0E1A3D";
const SLATE = "#4A5578";
const BLUE = "#155DFC";
const LINE = "#DCE3F2";
const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace";
const DISPLAY = "'Unbounded', 'Trebuchet MS', sans-serif";

/** Pages another application serves on this host: plain anchors. */
const OTHER_APP = /^\/(contact|demande|application|connexion|inscription)(?:[/?#]|$)/;

function A({ href = "", children }: { href?: string; children?: ReactNode }) {
  const style: CSSProperties = {
    color: BLUE,
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationThickness: "1px",
  };
  if (href.startsWith("/") && !OTHER_APP.test(href)) {
    return (
      <Link href={href} style={style}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a href={href} style={style} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function Check() {
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        display: "inline-flex",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        alignItems: "center",
        justifyContent: "center",
        background: "#E3F6EC",
        marginTop: "2px",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <h2 style={{ margin: "48px 0 0", fontFamily: DISPLAY, fontSize: "var(--sp-fs-34, 34px)", lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.03em", color: NAVY, textWrap: "balance" }}>
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: "56px 0 0", fontFamily: DISPLAY, fontSize: "var(--sp-fs-34, 34px)", lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.03em", color: NAVY, textWrap: "balance" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: "32px 0 0", fontFamily: DISPLAY, fontSize: "var(--sp-fs-22, 22px)", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.03em", color: NAVY, textWrap: "balance" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: "18px 0 0", fontSize: "var(--sp-fs-18, 18px)", lineHeight: 1.65, color: SLATE, textWrap: "pretty" }}>{children}</p>
  ),
  strong: ({ children }) => <strong style={{ color: NAVY, fontWeight: 600 }}>{children}</strong>,
  a: ({ href, children }) => <A href={href}>{children}</A>,
  ul: ({ children }) => (
    <ul style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="sp-md-ol" style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", counterReset: "sp-md" }}>
      {children}
    </ol>
  ),
  // Every item carries the check; in a numbered list (.sp-md-ol) the
  // stylesheet swaps it for the step's numbered disc.
  li: ({ children }) => (
    <li style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "var(--sp-fs-17, 17px)", lineHeight: 1.6, color: NAVY }}>
      <Check />
      <span style={{ minWidth: 0 }}>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ margin: "24px 0 0", padding: "18px 24px", borderRadius: "18px", background: "#EEF3FF", borderInlineStart: `3px solid ${BLUE}` }}>
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ margin: "48px 0 0", border: 0, borderTop: `1px solid ${LINE}` }} />,
  code: ({ children }) => (
    <code style={{ fontFamily: MONO, fontSize: "0.9em", background: "#EEF3FF", borderRadius: "6px", padding: "1px 6px", color: NAVY }}>{children}</code>
  ),
  table: ({ children }) => (
    <div style={{ margin: "28px 0 0", overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: "20px", background: "#FFFFFF" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--sp-fs-15_5, 15.5px)", lineHeight: 1.5, color: NAVY }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ textAlign: "start", padding: "14px 18px", background: "#EEF3FF", fontFamily: MONO, fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, verticalAlign: "bottom" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ padding: "14px 18px", borderTop: `1px solid ${LINE}`, verticalAlign: "top", color: SLATE }}>{children}</td>
  ),
};

export function SeoMarkdown({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
      {children}
    </Markdown>
  );
}

/** One paragraph's worth of Markdown, inline — for a lead under a heading. */
export function SeoInline({ children }: { children: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{ ...components, p: ({ children: c }) => <>{c}</> }}
      skipHtml
    >
      {children}
    </Markdown>
  );
}
