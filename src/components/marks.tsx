import { useEffect, useRef, type ReactNode } from "react";

const ALLOWED = /^(strong|em|b|i|u|mark|br)$/i;

export function sanitizeRich(input: string) {
  const source = String(input ?? "")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/\n/g, "<br>");
  if (typeof document === "undefined") {
    return source.replace(/<(?!\/?(?:strong|em|b|i|u|mark|br)\b)[^>]*>/gi, "");
  }
  const root = document.createElement("div");
  root.innerHTML = source;
  const clean = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").replace(/</g, "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(clean).join("");
    if (tag === "span" && /background/i.test(el.getAttribute("style") || "")) return `<mark>${inner}</mark>`;
    if (tag === "br") return "<br>";
    if (!ALLOWED.test(tag)) return inner;
    return `<${tag}>${inner}</${tag}>`;
  };
  return Array.from(root.childNodes).map(clean).join("").replace(/(<br>){3,}/g, "<br><br>");
}

export function marks(text: string): ReactNode {
  return <span dangerouslySetInnerHTML={{ __html: sanitizeRich(text) }} />;
}

export function RichField({
  value,
  onChange,
  placeholder,
  minHeight = "5.5rem",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    const field = ref.current;
    if (!field || focused.current) return;
    const next = sanitizeRich(value).replace(/\n/g, "<br>");
    if (field.innerHTML !== next) field.innerHTML = next;
  }, [value]);

  function commit() {
    onChange(sanitizeRich(ref.current?.innerHTML || ""));
  }

  function run(tag: "strong" | "em" | "mark") {
    const field = ref.current;
    if (!field) return;
    field.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!field.contains(range.commonAncestorContainer)) return;
    const hits = new Set<HTMLElement>();
    const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
    const end = range.endContainer instanceof Element ? range.endContainer : range.endContainer.parentElement;
    for (const node of [start, end]) {
      const found = node?.closest(tag);
      if (found && field.contains(found)) hits.add(found);
    }
    field.querySelectorAll(tag).forEach((node) => {
      if (node instanceof HTMLElement && range.intersectsNode(node)) hits.add(node);
    });
    if (hits.size) {
      for (const existing of hits) {
        existing.replaceWith(document.createTextNode(existing.textContent || ""));
      }
      commit();
      return;
    }
    const node = document.createElement(tag);
    node.appendChild(range.extractContents());
    range.insertNode(node);
    selection.removeAllRanges();
    const next = document.createRange();
    next.selectNodeContents(node);
    selection.addRange(next);
    commit();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-1 border-b border-line bg-canvas px-2 py-1">
        <button type="button" className="rounded-md px-2 py-1 text-sm font-bold" onMouseDown={(event) => event.preventDefault()} onClick={() => run("strong")}>
          G
        </button>
        <button type="button" className="rounded-md px-2 py-1 text-sm italic" onMouseDown={(event) => event.preventDefault()} onClick={() => run("em")}>
          I
        </button>
        <button type="button" className="rounded-md bg-[#fff3a3] px-2 py-1 text-sm" onMouseDown={(event) => event.preventDefault()} onClick={() => run("mark")}>
          Surligner
        </button>
      </div>
      <div
        ref={ref}
        className="rich-edit px-3 py-2 text-sm leading-relaxed outline-none"
        style={{ minHeight }}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          commit();
        }}
        onInput={commit}
      />
    </div>
  );
}

export function BoldField(props: { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return <RichField value={props.value} onChange={props.onChange} placeholder={props.placeholder} />;
}
