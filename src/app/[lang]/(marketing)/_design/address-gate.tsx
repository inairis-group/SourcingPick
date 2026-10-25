import { Children, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { addressGateCopy } from "@/content/site/address-gate";

/**
 * Where the canvas draws the warehouse address (the home page's "Notre
 * entrepôt" card, the contact page, the warehouse page), the address is only
 * given to clients who have signed up. This keeps the drawn card — its title,
 * and on the warehouse page the hours, phone and e-mail under it — and puts,
 * in place of the address, a line saying so with the way to sign up.
 *
 * The address is the child in Chinese (`lang="zh-Hans"`) and the line in Latin
 * letters that follows it; on the contact page both sit inside one span. Both
 * go. The porter matches the card (port.py COMPONENTS), so a re-export that
 * moves the address fails the port instead of publishing it again.
 */
export function AddressGate({
  lang,
  style,
  children,
}: {
  lang: Locale;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const kids = Children.toArray(children);
  const at = kids.findIndex(holdsChinese);
  if (at < 0) return <div style={style}>{children}</div>;
  const own = (kids[at] as ReactElement<{ lang?: string }>).props.lang === "zh-Hans";
  const c = addressGateCopy[lang];
  return (
    <div style={style}>
      {kids.slice(0, at)}
      {/* Its own copy, not the canvas's: design:verify leaves it out by this id. */}
      <section
        key="gate"
        id="adresse-apres-inscription"
        style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}
      >
        <span
          style={{
            fontSize: "var(--sp-fs-16, 16px)",
            fontWeight: 600,
            lineHeight: 1.45,
            color: "#0E1A3D",
          }}
        >
          {c.title}
        </span>
        <span style={{ fontSize: "14.5px", lineHeight: 1.5, color: "#4A5578" }}>{c.body}</span>
        <span
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 18px",
            paddingTop: "2px",
            fontSize: "14.5px",
          }}
        >
          <a
            href="/inscription"
            style={{
              color: "#155DFC",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {c.cta}
          </a>
          <a
            href="/connexion"
            style={{ color: "#4A5578", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            {c.login}
          </a>
        </span>
      </section>
      {kids.slice(at + (own ? 2 : 1))}
    </div>
  );
}

function holdsChinese(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const props = (node as ReactElement<{ lang?: string; children?: ReactNode }>).props;
  if (props.lang === "zh-Hans") return true;
  return Children.toArray(props.children).some(
    (c) => isValidElement(c) && (c as ReactElement<{ lang?: string }>).props.lang === "zh-Hans",
  );
}
