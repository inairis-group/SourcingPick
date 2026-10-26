/**
 * The freight simulator (/livraisons#simulateur, and the admin's): its form,
 * the explanation of how a price is built, and the e-mail that carries it.
 * The rules are the carrier's rate card of 26 October (src/lib/freight); this
 * is how they are said to the visitor. No rate per kilo here: those stay on
 * the server and reach the visitor by e-mail.
 *
 * One file per language in simulator-locales/. `{name}` placeholders are
 * filled in by the component or the e-mail.
 */
import type { Locale } from "@/lib/i18n/config";
import { goodsSheet, type ContainerType, type GoodsKey, type Line, type Mode, type QuoteReason } from "@/lib/freight/modes";
import type { LineItem } from "@/lib/freight/estimate";
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
    /** On the container's button: its price comes as a quote. */
    onQuote: string;
    /** Under the buttons, for the mode chosen. */
    hints: Record<Mode, string>;
  };
  formula: {
    label: string;
    names: { ddp: string; fob: string; customs: string };
    hints: { ddp: string; fob: string; customs: string };
  };
  /** The full container's fields. */
  container: {
    type: string;
    types: Record<ContainerType, string>;
    count: string;
    hint: string;
  };
  address: {
    title: string;
    street: string;
    postcode: string;
    /** Under the postcode: what it is used for. */
    postcodeHint: string;
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
    /** The same, for a container: the dimensions may be left out. */
    cartonHintContainer: string;
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
  /** The product classes of the sea and air sheets, and the descriptive list of the quoted modes. */
  goods: Record<"sea" | "air" | "quoted", Partial<Record<GoodsKey, string>>>;
  options: {
    declaration: string;
    /** Its price, line by line. */
    declarationHints: Record<Line, string>;
  };
  /** The card's line the shipment takes, and why. */
  lines: { label: string; names: Record<Line, string>; hints: Record<Line, string> };
  calc: {
    /** Over the weight the price is worked out on. */
    title: string;
    /** Under it: the heavier of the real and the volumetric weight. */
    rule: string;
    volumetric: string;
    bracket: string;
    billed: string;
    volume: string;
  };
  estimate: {
    title: string;
    delayLabel: string;
    /** By mode, and by line for the large-parcel lines. */
    delays: Record<Mode | Line, string>;
    surcharges: string;
    /** "{n}": cartons or pieces concerned. */
    oversize: string;
    crate: string;
    overlength: string;
    extraNames: string;
    singleCarton: string;
    batteryRates: string;
    reinforcement: string;
    declaration: string;
  };
  quote: { title: string; reasons: Record<QuoteReason, string> };
  warnings: { refusedGoods: string; noProducts: string; noProductsContainer: string };
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
  /** Under the simulator: every rule of the card, in plain words; `items` as a list under `text`. */
  rules: { title: string; intro: string; sections: { title: string; text: string; items?: string[] }[] };
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
      line: string;
      container: string;
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
    /** The same without dimensions (a container): "{name} : {cartons} cartons" */
    productCount: string;
    /** One label per line of the price; `{…}` from the line's figures. */
    items: Record<LineItem["key"], string>;
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

/** A product class's wording for a mode: the quoted modes share one list. */
export function goodsLabel(c: Pick<FreightSimulatorCopy, "goods">, mode: Mode, key: GoodsKey): string {
  return c.goods[goodsSheet(mode)][key] ?? key;
}
