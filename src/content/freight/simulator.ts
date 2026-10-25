/**
 * The freight simulator (/livraisons#simulateur, and the admin's): its form,
 * the explanation of how a price is built, and the e-mail that carries it.
 * The rules are the carrier's rate card (src/lib/freight); this is how they
 * are said to the visitor.
 *
 * One file per language in simulator-locales/. `{name}` placeholders are
 * filled in by the component or the e-mail.
 */
import type { Locale } from "@/lib/i18n/config";
import type { GoodsKey, Mode, QuoteReason } from "@/lib/freight/modes";
import { ar } from "./simulator-locales/ar";
import { de } from "./simulator-locales/de";
import { en } from "./simulator-locales/en";
import { es } from "./simulator-locales/es";
import { fr } from "./simulator-locales/fr";
import { it } from "./simulator-locales/it";
import { nl } from "./simulator-locales/nl";
import { pl } from "./simulator-locales/pl";
import { pt } from "./simulator-locales/pt";
import { ru } from "./simulator-locales/ru";
import { tr } from "./simulator-locales/tr";
import { zh } from "./simulator-locales/zh";

export type FreightSimulatorCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  mode: {
    label: string;
    names: Record<Mode, string>;
    /** Tags on the mode buttons. */
    recommended: string;
    discouraged: string;
    /** Under the buttons, for the mode chosen. */
    hints: Record<Mode, string>;
  };
  formula: {
    label: string;
    names: { ddp: string; fob: string; customs: string };
    hints: { ddp: string; fob: string; customs: string };
  };
  address: {
    title: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
  };
  products: {
    title: string;
    /** "Produit {n}" */
    item: string;
    name: string;
    namePlaceholder: string;
    goods: string;
    cartons: string;
    length: string;
    width: string;
    height: string;
    weight: string;
    /** Under the carton fields: they describe one carton. */
    cartonHint: string;
    /** For the classes priced per unit. */
    units: string;
    battery: string;
    reinforce: string;
    reinforceHint: string;
    add: string;
    remove: string;
    /** Under each product: "{m3} · {volumetric} volumétriques" */
    summary: string;
    /** Shown when a mode change reset a product's class. */
    goodsReset: string;
  };
  /** The product classes of each mode's sheet, with examples from it. */
  goods: Record<Mode, Partial<Record<GoodsKey, string>>>;
  options: { declaration: string; declarationHint: string; declarationHintSea: string };
  calc: {
    volumetric: string;
    /** Under the volumetric weight: how it is worked out. */
    formula: string;
    bracket: string;
    billed: string;
    volume: string;
  };
  estimate: {
    title: string;
    delayLabel: string;
    delays: Record<Mode, string>;
    surcharges: string;
    oversize: string;
    singleCarton: string;
    battery: string;
    reinforcement: string;
    declaration: string;
  };
  quote: { title: string; reasons: Record<QuoteReason, string> };
  warnings: { refusedGoods: string; refusedCarton: string; noProducts: string };
  gate: {
    locked: string;
    lockedQuote: string;
    points: [string, string, string];
    name: string;
    phone: string;
    email: string;
    emailPlaceholder: string;
    cta: string;
    ctaQuote: string;
    already: string;
    note: string;
    sending: string;
    sent: string;
    sentQuote: string;
    errors: { invalid_email: string; rate_limited: string; failed: string; invalid: string };
  };
  rules: { title: string; intro: string; sections: { title: string; text: string }[] };
  email: {
    /** Between a label and its value: " : " in French, ": " in English. */
    sep: string;
    subject: string;
    subjectQuote: string;
    heading: string;
    headingQuote: string;
    intro: string;
    introQuote: string;
    summary: {
      mode: string;
      formula: string;
      address: string;
      cartons: string;
      real: string;
      volumetric: string;
      chargeable: string;
      bracket: string;
      delay: string;
    };
    productsTitle: string;
    /** "{name} : {cartons} cartons · {m3} · {chargeable} facturables" */
    product: string;
    items: {
      freight: string;
      goods: string;
      pieces: string;
      units: string;
      singleCarton: string;
      oversize: string;
      battery: string;
      declaration: string;
      reinforcement: string;
    };
    subtotal: string;
    commission: string;
    total: string;
    notIncludedTitle: string;
    notIncluded: string[];
    disclaimer: string;
    quoteNext: string;
    signup: string;
    signupCta: string;
    footer: string;
  };
};

export const FREIGHT_SIMULATOR: Record<Locale, FreightSimulatorCopy> = { fr, en, zh, es, de, it, pt, nl, ar, ru, tr, pl };

export function freightCopy(lang: Locale): FreightSimulatorCopy {
  return FREIGHT_SIMULATOR[lang] ?? FREIGHT_SIMULATOR.fr;
}

/** The copy the form shows: everything but the rules and the e-mail, plus the label separator. */
export type FreightFormCopy = Omit<FreightSimulatorCopy, "rules" | "email"> & { sep: string };

/** What a server component hands the form, so the rules and the e-mail stay out of the browser. */
export function freightFormCopy(lang: Locale): FreightFormCopy {
  const c = freightCopy(lang);
  const form = Object.fromEntries(Object.entries(c).filter(([k]) => k !== "rules" && k !== "email")) as Omit<FreightSimulatorCopy, "rules" | "email">;
  return { ...form, sep: c.email.sep };
}
