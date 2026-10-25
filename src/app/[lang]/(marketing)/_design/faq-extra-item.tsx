import { Children, cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { faqSuppliersCopy } from "@/content/site/faq-suppliers";

/**
 * The FAQ's sourcing questions, plus one the canvas does not have: what
 * happens when the suppliers we propose do not suit (the clause of the terms
 * of sale, article 1). The new question is the group's last one, cloned, so it
 * has the drawn styling of its neighbours in every language; only its words
 * change. The FAQ's structured data lists it too (faq/page.tsx).
 */
export function FaqExtraItem({
  lang,
  style,
  children,
}: {
  lang: Locale;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const kids = Children.toArray(children);
  const last = kids.at(-1);
  const c = faqSuppliersCopy[lang];
  let extra: ReactNode = null;
  if (isValidElement(last)) {
    const [button, ...panel] = Children.toArray(
      (last as ReactElement<{ children?: ReactNode }>).props.children,
    );
    if (isValidElement(button) && isValidElement(panel[0])) {
      const [label, ...icon] = Children.toArray(
        (button as ReactElement<{ children?: ReactNode }>).props.children,
      );
      // Its own copy, not the canvas's: design:verify leaves it out by this id.
      extra = (
        <section key="faq-suppliers" id="faq-fournisseurs">
          {cloneElement(
            last,
            {},
            cloneElement(
              button,
              {},
              isValidElement(label) ? cloneElement(label, {}, c.question) : c.question,
              ...icon,
            ),
            cloneElement(panel[0], {}, c.answer),
          )}
        </section>
      );
    }
  }
  return (
    <div style={style}>
      {kids}
      {extra}
    </div>
  );
}
