export const STATE_TREE: Array<{ state: string; subs: Array<{ name: string; internal?: boolean }> }> = [
  { state: "Demande reçue", subs: [{ name: "Reçue" }, { name: "Qualification en cours" }, { name: "Informations manquantes" }] },
  {
    state: "Agent assigné",
    subs: [{ name: "Agent assigné" }, { name: "Sourcing en cours" }, { name: "Fournisseurs consultés" }, { name: "Offre fournisseur reçue" }],
  },
  {
    state: "Devis envoyé",
    subs: [{ name: "Devis envoyé" }, { name: "Devis consulté" }, { name: "Devis signé" }, { name: "Devis refusé" }, { name: "Devis expiré" }],
  },
  {
    state: "Paiement en attente",
    subs: [{ name: "Facture d’acompte émise" }, { name: "Virement annoncé" }, { name: "En attente des fonds" }, { name: "Paiement partiel" }],
  },
  {
    state: "Paiement reçu",
    subs: [{ name: "Acompte encaissé" }, { name: "Commande passée au fournisseur" }, { name: "Production en cours" }],
  },
  {
    state: "Préparation terminée",
    subs: [
      { name: "Réception partielle à l’entrepôt" },
      { name: "Réception complète" },
      { name: "Contrôle en cours", internal: true },
      { name: "Anomalie signalée" },
      { name: "Contrôle validé" },
      { name: "Consolidation et renforcement", internal: true },
      { name: "Prêt à charger" },
    ],
  },
  {
    state: "Expédié",
    subs: [
      { name: "Solde réglé" },
      { name: "Conteneur chargé" },
      { name: "Documents d’export émis", internal: true },
      { name: "Booking confirmé", internal: true },
    ],
  },
  {
    state: "En transit",
    subs: [{ name: "En mer" }, { name: "Transbordement", internal: true }, { name: "Arrivé au port" }, { name: "Dédouanement" }],
  },
  { state: "Terminé", subs: [{ name: "Marchandise livrée" }, { name: "Dossier clos" }] },
  {
    state: "Annulé",
    subs: [{ name: "Annulé par le client" }, { name: "Annulé par Sourcing Pick" }, { name: "Remboursement effectué" }],
  },
];

export function stateOf(substate: string) {
  for (const group of STATE_TREE) if (group.subs.some((sub) => sub.name === substate)) return group.state;
  return substate;
}

export function isInternal(substate: string) {
  return STATE_TREE.some((group) => group.subs.some((sub) => sub.name === substate && sub.internal));
}

export function publicSubstate(state: string, substate: string, internalOnly = false) {
  if (!internalOnly && substate && !isInternal(substate)) return substate;
  return STATE_TREE.find((item) => item.state === state)?.subs.find((sub) => !sub.internal)?.name ?? state;
}

export type QuoteLine = {
  id: string;
  kind: "goods" | "service" | "freight" | "fee" | "discount";
  title: string;
  details: string;
  qty: number;
  unitCents: number;
  image?: string;
  images?: string[];
  rateBps?: number;
};

export function lineKind(value: string | undefined): QuoteLine["kind"] {
  if (value === "goods" || value === "freight" || value === "service" || value === "fee" || value === "discount") return value;
  return "service";
}

export function lineAmount(line: { kind?: string; qty?: number; unitCents?: number }) {
  const raw = Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0));
  return line.kind === "discount" ? -Math.abs(raw) : raw;
}

export function chargedAmount(line: { kind?: string; qty?: number; unitCents?: number; rateBps?: number }) {
  if (line.kind === "freight" && Math.round(Number(line.rateBps) || 0) > 0) return 0;
  return lineAmount(line);
}

const MAX_LINE_IMAGES = 8;

export function packImages(line: { image?: string; images?: string[] }) {
  const raw = [...(Array.isArray(line.images) ? line.images : []), ...(line.image ? [line.image] : [])];
  const images: string[] = [];
  for (const item of raw) {
    const value = String(item ?? "");
    if (!value.startsWith("data:image/")) continue;
    const next = value.slice(0, 180000);
    if (images.includes(next)) continue;
    images.push(next);
    if (images.length >= MAX_LINE_IMAGES) break;
  }
  return { image: images[0] || "", images };
}

/** A freight line with a percent takes that share of the order: goods, services, fees and the goods commission, minus discounts. */
export function pricedLines(lines: QuoteLine[], _goodsBps = 0): QuoteLine[] {
  const rows = Array.isArray(lines) ? lines : [];
  const sum = (kind: QuoteLine["kind"]) =>
    rows
      .filter((line) => line && line.kind === kind)
      .reduce((total, line) => total + Math.abs(Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0))), 0);
  const goodsCents = sum("goods");
  const base = Math.max(0, goodsCents + sum("service") + sum("fee") - sum("discount"));
  return rows.map((line) => {
    const rate = Math.max(0, Math.round(Number(line?.rateBps) || 0));
    if (!line || line.kind !== "freight" || rate <= 0) return line;
    const unitCents = Math.round((base * rate) / 10000);
    if (line.rateBps === rate && line.qty === 1 && line.unitCents === unitCents) return line;
    return { ...line, rateBps: rate, qty: 1, unitCents };
  });
}

export type QuoteMath = {
  goodsCents: number;
  serviceCents: number;
  freightCents: number;
  includedFreightCents: number;
  feeCents: number;
  discountCents: number;
  goodsCommissionCents: number;
  freightCommissionCents: number;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
};

export function quoteMath(lines: QuoteLine[], goodsBps: number, freightBps: number, depositBps: number): QuoteMath {
  const rows = pricedLines(lines, goodsBps);
  const sum = (kind: QuoteLine["kind"]) => rows.filter((line) => line && line.kind === kind).reduce((total, line) => total + Math.abs(Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0))), 0);
  const goodsCents = sum("goods");
  const serviceCents = sum("service");
  const freightCents = rows.filter((line) => line && line.kind === "freight" && !(Number(line.rateBps) > 0)).reduce((total, line) => total + Math.abs(Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0))), 0);
  const includedFreightCents = rows.filter((line) => line && line.kind === "freight" && Number(line.rateBps) > 0).reduce((total, line) => total + Math.abs(Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0))), 0);
  const feeCents = sum("fee");
  const discountCents = sum("discount");
  const goodsCommissionCents = Math.round((goodsCents * goodsBps) / 10000);
  const freightBase = freightCents + includedFreightCents;
  const freightCommissionCents = Math.round((freightBase * freightBps) / 10000);
  const totalCents = goodsCents + serviceCents + freightCents + feeCents + goodsCommissionCents + freightCommissionCents - discountCents;
  const depositCents = Math.round((Math.max(0, totalCents) * depositBps) / 10000);
  return {
    goodsCents,
    serviceCents,
    freightCents,
    includedFreightCents,
    feeCents,
    discountCents,
    goodsCommissionCents,
    freightCommissionCents,
    totalCents,
    depositCents,
    balanceCents: totalCents - depositCents,
  };
}

export const DUE_ON_RECEIPT = "reception";

export function dueIsReceipt(value: string) {
  return !/^\d{4}-\d{2}-\d{2}$/.test(String(value || "").slice(0, 10));
}

export function duePhrase(value: string, en = false) {
  if (!dueIsReceipt(value)) return value.slice(0, 10).split("-").reverse().join("/");
  return en ? "On receipt" : "À réception";
}

export function dueAnchor(dueOn: string, issuedOn: string) {
  return dueIsReceipt(dueOn) ? issuedOn || "" : dueOn.slice(0, 10);
}

export function euros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function percent(bps: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(bps / 100);
}

export function clientLabel(client: { name?: string; company?: string; email?: string; kind?: string }) {
  if (client.kind === "particulier") return (client.name || "").trim() || client.email || "Particulier";
  const parts = [client.name, client.company].map((part) => (part || "").trim()).filter(Boolean);
  const unique = parts.filter((part, index) => parts.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index);
  return unique.join(" — ") || client.email || "Client";
}

export type OpsOrder = {
  id: string;
  ref: string;
  clientName: string;
  product: string;
  agentName: string;
  state: string;
  substate: string;
  internalOnly: boolean;
  note: string;
  internalNote: string;
  updatedAt: string;
  createdAt: string;
  clientEmail: string;
  clientPhone: string;
  clientUserId: string;
  clientTalk: boolean;
};

export type OpsSupplier = {
  id: string;
  orderId: string;
  name: string;
  price: string;
  qty: string;
  lead: string;
  status: string;
};

export type OpsMessage = {
  id: string;
  orderId: string;
  author: string;
  body: string;
  atLabel: string;
  kind: string;
  internalOnly: boolean;
};

export type OpsJournal = {
  id: string;
  atLabel: string;
  actor: string;
  action: string;
  objectRef: string;
  createdAt: string;
};

export type OpsQuote = {
  id: string;
  number: string;
  orderRef: string;
  clientName: string;
  amountCents: number;
  issuedOn: string;
  status: string;
  lang: string;
  currency: string;
  incoterm: string;
  port: string;
  validityDays: number;
  depositBps: number;
  goodsBps: number;
  freightBps: number;
  lines: QuoteLine[];
  emailSubject: string;
  emailBody: string;
  clientEmail: string;
  clientUserId: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  clientCountry: string;
  clientSiren: string;
  clientSiret: string;
  clientNaf: string;
  signerName: string;
  signedAt: string;
  signatureImage: string;
  signMeta: string;
  font: string;
};

export type OpsInvoice = {
  id: string;
  number: string;
  orderRef: string;
  clientName: string;
  clientUserId: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  clientSiren: string;
  clientSiret: string;
  clientNaf: string;
  lines: QuoteLine[];
  amountCents: number;
  method: string;
  issuedOn: string;
  receivedOn: string;
  status: string;
  receivedCents: number | null;
  feesCents: number;
  kind: string;
  dueOn: string;
  remindersOn: boolean;
  reminderLevel: number;
  reminderOn: string;
  seriesId: string;
  lang: string;
  currency: string;
};

export type OpsSeries = {
  id: string;
  label: string;
  clientUserId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  orderRef: string;
  lines: QuoteLine[];
  cadence: "month" | "quarter" | "year";
  nextOn: string;
  endOn: string;
  active: boolean;
  lastNumber: string;
};

export type OpsCharge = {
  id: string;
  supplier: string;
  nature: string;
  description: string;
  costCents: number;
  markupBps: number;
  billCents: number;
  clientUserId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  orderRef: string;
  invoiceId: string;
  invoiceNumber: string;
  status: string;
  incurredOn: string;
};

export type OpsDocument = {
  id: string;
  clientName: string;
  category: string;
  title: string;
  orderRef: string;
  issuedOn: string;
  fileName: string;
  mime: string;
  byteSize: number;
  signStatus: string;
  signEmail: string;
  signerName: string;
};

export type OpsEmail = {
  id: string;
  name: string;
  category: string;
  triggerLabel: string;
  subject: string;
  body: string;
};

export type OpsInboxItem = OpsMessage & {
  ref: string;
  product: string;
  clientName: string;
  agentName: string;
};

export type OpsSettings = {
  legalName: string;
  chineseName: string;
  usci: string;
  address: string;
  representative: string;
  goodsBps: number;
  freightBps: number;
  depositBps: number;
  validityDays: number;
  beneficiary: string;
  iban: string;
  swift: string;
  bank: string;
  monthCents: number;
  prevMonthCents: number;
};

export type OpsClient = {
  id: string;
  name: string;
  email: string;
  company: string;
  vat: string;
  country: string;
  address: string;
  siren: string;
  siret: string;
  naf: string;
  kind: "pro" | "particulier";
};

export type CompanyHit = {
  siren: string;
  siret: string;
  name: string;
  address: string;
  naf: string;
  vat: string;
  open: boolean;
};

export type OpsUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  lastSeen: string;
  verification: string;
  active: boolean;
};
