/**
 * The sea freight simulator on /livraisons (section #simulateur): its form,
 * the explanation of how a sea price is built, and the e-mail that carries the
 * price. The rules are the carrier's rate card (src/lib/freight); this is how
 * they are said to the visitor.
 *
 * `{name}` placeholders are filled in by the component or the e-mail.
 */
import type { Locale } from "@/lib/i18n/config";
import { en } from "./sea-simulator-locales/en";
import { es } from "./sea-simulator-locales/es";
import { fr } from "./sea-simulator-locales/fr";
import { it } from "./sea-simulator-locales/it";
import { tr } from "./sea-simulator-locales/tr";
import { zh } from "./sea-simulator-locales/zh";

export type SeaSimulatorCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  regime: { label: string; ddp: string; ddpHint: string; vat: string; vatHint: string };
  deliverTo: { label: string; amazon: string; other: string; thirdParty: string };
  warehouse: { label: string; byCountry: string };
  country: string;
  carrier: { label: string; truck: string; upsDpd: string; ups: string; qot: string };
  goods: {
    label: string;
    ordinary: string;
    plus1: string;
    plus3: string;
    plus4: string;
    refused: string;
    hint: string;
  };
  units: { label: string; phones: string; scooters: string; bikes: string };
  cartons: {
    title: string;
    line: string;
    quantity: string;
    length: string;
    width: string;
    height: string;
    weight: string;
    add: string;
    remove: string;
  };
  designations: { label: string; hint: string };
  options: { declaration: string; declarationHint: string; signature: string; signatureHint: string };
  calc: {
    title: string;
    real: string;
    volumetric: string;
    /** Under the volumetric weight: how it is worked out. */
    formula: string;
    chargeable: string;
    chargeableHint: string;
    bracket: string;
    billed: string;
    volume: string;
    cartons: string;
  };
  estimate: {
    title: string;
    mode: string;
    delayLabel: string;
    delay: string;
    surcharges: string;
    oversize: string;
    singleCarton: string;
    nonAmazon: string;
    vatClearance: string;
  };
  warnings: {
    refusedGoods: string;
    refusedCarton: string;
    tooManyDesignations: string;
    noCartons: string;
  };
  gate: {
    locked: string;
    points: [string, string, string];
    email: string;
    emailPlaceholder: string;
    cta: string;
    already: string;
    note: string;
    sending: string;
    sent: string;
    errors: { invalid_email: string; rate_limited: string; failed: string; invalid: string };
  };
  rules: { title: string; intro: string; sections: { title: string; text: string }[] };
  email: {
    /** Between a label and its value: " : " in French, ": " in English. */
    sep: string;
    subject: string;
    heading: string;
    intro: string;
    summary: {
      regime: string;
      delivery: string;
      cartons: string;
      real: string;
      volumetric: string;
      chargeable: string;
      bracket: string;
      delay: string;
    };
    items: {
      freight: string;
      goods: string;
      nonAmazon: string;
      singleCarton: string;
      oversize: string;
      phones: string;
      vatClearance: string;
      declaration: string;
      designations: string;
      signature: string;
      scooters: string;
      bikes: string;
    };
    subtotal: string;
    commission: string;
    total: string;
    notIncludedTitle: string;
    notIncluded: string[];
    disclaimer: string;
    signup: string;
    signupCta: string;
    footer: string;
  };
};

export const SEA_SIMULATOR: Partial<Record<Locale, SeaSimulatorCopy>> & { fr: SeaSimulatorCopy } = { fr, en, zh, es, it, tr };

export function seaCopy(lang: Locale): SeaSimulatorCopy {
  return SEA_SIMULATOR[lang] ?? SEA_SIMULATOR.fr;
}
