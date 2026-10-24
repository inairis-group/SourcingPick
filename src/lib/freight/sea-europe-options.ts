/**
 * What the sea simulator offers, without the prices (those stay on the
 * server, in sea-europe.ts): each line of the carrier's card, the countries
 * and warehouses it serves, how it is delivered, and the product classes.
 */

export type SeaRegime = "ddp" | "vat";
export type GoodsClass = "ordinary" | "plus1" | "plus3" | "plus4" | "refused";

export type SeaLine = {
  id: string;
  regime: SeaRegime;
  /** amazon: one named Amazon warehouse; country: any address in these countries; thirdParty: 4PX, Goodcang, Winit. */
  kind: "amazon" | "country" | "thirdParty";
  /** How the last leg is done. */
  carrier: "truck" | "upsDpd" | "ups" | "qot";
  /** ISO codes, for country lines. */
  countries?: readonly string[];
  /** Warehouse codes as the card writes them, for warehouse lines. */
  warehouses?: string;
  /** The card's minimum billed weight per carton on this line. */
  minKgPerCarton: number;
  /** The line takes addresses that are not Amazon warehouses (+1 RMB/kg). */
  nonAmazonAllowed: boolean;
  /** The least a shipment is billed: 21 kg, or 71 kg on lines whose card starts at 71 kg. */
  minShipmentKg: 21 | 71;
};

const country = (id: string, regime: SeaRegime, carrier: SeaLine["carrier"], countries: string[]): SeaLine => ({
  id, regime, kind: "country", carrier, countries, minKgPerCarton: 12, nonAmazonAllowed: true, minShipmentKg: 21,
});
const amazon = (id: string, regime: SeaRegime, warehouses: string, minKgPerCarton: number, minShipmentKg: 21 | 71 = 21): SeaLine => ({
  id, regime, kind: "amazon", carrier: "truck", warehouses, minKgPerCarton, nonAmazonAllowed: false, minShipmentKg,
});

export const SEA_LINES: readonly SeaLine[] = [
  // Taxes included (DDP).
  amazon("ddp-truck-dtm2", "ddp", "DTM2 (44145)", 10, 71),
  amazon("ddp-truck-haj1", "ddp", "HAJ1 (38350)", 10, 71),
  amazon("ddp-truck-wro5", "ddp", "WRO5 (06126)", 10, 71),
  amazon("ddp-truck-cdg7", "ddp", "CDG7 (60300)", 10, 71),
  amazon("ddp-truck-de", "ddp", "DTM9 / BER8 / MHG9 / KSF7", 10, 71),
  country("ddp-upsdpd-de", "ddp", "upsDpd", ["DE"]),
  country("ddp-upsdpd-fr", "ddp", "upsDpd", ["FR"]),
  country("ddp-upsdpd-it-es", "ddp", "upsDpd", ["IT", "ES"]),
  country("ddp-ups-de", "ddp", "ups", ["DE"]),
  country("ddp-ups-fr", "ddp", "ups", ["FR"]),
  country("ddp-ups-it-es", "ddp", "ups", ["IT", "ES"]),
  country("ddp-ups-cz-be-lu-nl-pl", "ddp", "ups", ["CZ", "BE", "LU", "NL", "PL"]),
  country("ddp-ups-fi-mc-at-dk", "ddp", "ups", ["FI", "MC", "AT", "DK"]),
  country("ddp-ups-gr-ie-pt-se-hu", "ddp", "ups", ["GR", "IE", "PT", "SE", "HU"]),
  country("ddp-ups-sk-si-bg-lt-ro", "ddp", "ups", ["SK", "SI", "BG", "LT", "RO"]),
  // Under the client's VAT number (import VAT deferred).
  amazon("vat-truck-dtm2", "vat", "DTM2 (44145)", 12),
  amazon("vat-truck-haj1", "vat", "HAJ1 (38350)", 12),
  amazon("vat-truck-wro5-59225", "vat", "WRO5 (59225)", 12),
  amazon("vat-truck-wro5-06126", "vat", "WRO5 (02977 / 06126)", 12),
  amazon("vat-truck-dtm1", "vat", "DTM1", 12),
  amazon("vat-truck-04758", "vat", "KTW5 / XPLC / LCJ2 / WRO1 / XWR3 / XPO1 (04758)", 12),
  amazon("vat-truck-ber8", "vat", "BER8 / KSF7 / DTM9 / XSC1", 12),
  amazon("vat-truck-mhg9", "vat", "MHG9 / STR1 / RLG1 / LEJ3 / LEJ1", 12),
  amazon("vat-truck-cdg7", "vat", "CDG7 (60300) / XOR1", 12),
  {
    id: "vat-truck-3pl", regime: "vat", kind: "thirdParty", carrier: "truck",
    warehouses: "4PX (55459 / 65462), Goodcang (53881 / 55450), Winit (28197)",
    minKgPerCarton: 12, nonAmazonAllowed: false, minShipmentKg: 21,
  },
  country("vat-qot-de", "vat", "qot", ["DE"]),
  country("vat-qot-fr-pl", "vat", "qot", ["FR", "PL"]),
  country("vat-ups-it-es", "vat", "ups", ["IT", "ES"]),
];

/** Countries served by a regime's country lines, in the card's order. */
export function seaCountries(regime: SeaRegime): string[] {
  const out: string[] = [];
  for (const l of SEA_LINES) {
    if (l.regime !== regime || l.kind !== "country") continue;
    for (const c of l.countries ?? []) if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** The country lines that serve `iso` under `regime` (one, or UPS/DPD and UPS). */
export function seaCountryLines(regime: SeaRegime, iso: string): SeaLine[] {
  return SEA_LINES.filter((l) => l.regime === regime && l.kind === "country" && l.countries?.includes(iso));
}

export function seaWarehouseLines(regime: SeaRegime): SeaLine[] {
  return SEA_LINES.filter((l) => l.regime === regime && l.kind !== "country");
}
