export type Status = "brouillon" | "emis" | "accepte" | "payee" | "annulee";

export type Line = {
  id: string;
  code: string;
  title: string;
  material: string;
  details: string;
  unit: string;
  qty: number;
  unitPriceCents: number;
  image?: string;
  images?: string[];
  /** Shown on the paper, but already included in the prices. */
  omitFromTotal?: boolean;
};

type Base = {
  id: string;
  number: string;
  status: Status;
  clientId: string;
  issueDate: string;
  headline: string;
  conditions: string;
  conditionsCustom: boolean;
  createdAt: string;
  updatedAt: string;
  lang?: string;
  font?: string;
};

export type Devis = Base & {
  kind: "devis";
  validityDays: number;
  leadTime: string;
  delivery: string;
  port: string;
  commissionBps: number;
  depositBps: number;
  lines: Line[];
  signature?: {
    name: string;
    at: string;
    image: string;
    proof?: string;
    email?: string;
    role?: string;
    company?: string;
    ip?: string;
    place?: string;
    browser?: string;
    ua?: string;
  };
};

export type OrderSnap = {
  worksCents: number;
  commissionCents: number;
  netCents: number;
  commissionBps: number;
  depositBps: number;
  sourceNumber: string;
  sourceDate: string;
  postes: number;
  alreadyInvoicedCents: number;
};

export type FactureMode = "acompte" | "solde" | "integrale";

export type Facture = Base & {
  kind: "facture";
  mode: FactureMode;
  sourceDevisId: string | null;
  dueLabel: string;
  commissionBps: number;
  depositBps: number;
  order: OrderSnap | null;
  lines: Line[];
  paidOn: string;
  paidMethod: string;
  paidCents: number | null;
  feesCents: number;
};

export type Avoir = Base & {
  kind: "avoir";
  sourceFactureId: string | null;
  sourceNumber: string;
  sourceAmountCents: number;
  reason: string;
  lines: Line[];
};

export type Document = Devis | Facture | Avoir;

export type Client = {
  id: string;
  legalName: string;
  tradeName: string;
  address: string;
  vat: string;
  siret: string;
  rcs: string;
  siteNote: string;
  email: string;
};

export type Company = {
  legalName: string;
  brandLine: string;
  chineseName: string;
  contactName: string;
  email: string;
  address: string;
  usci: string;
  capital: string;
  iban: string;
  swift: string;
  bank: string;
  fxLabel: string;
  vatNote: string;
  conditionsExtra: string;
};

export type Seq = { devis: number; facture: number; avoir: number };

export const STATUS_LABEL: Record<Status, string> = {
  brouillon: "Brouillon",
  emis: "Émis",
  accepte: "Accepté",
  payee: "Payée",
  annulee: "Annulée",
};

export function statusesFor(kind: Document["kind"]): Status[] {
  if (kind === "devis") return ["brouillon", "emis", "accepte", "annulee"];
  if (kind === "facture") return ["brouillon", "emis", "payee", "annulee"];
  return ["brouillon", "emis", "annulee"];
}

export function isDevis(d: Document): d is Devis {
  return d.kind === "devis";
}

export function isFacture(d: Document): d is Facture {
  return d.kind === "facture";
}

export function isAvoir(d: Document): d is Avoir {
  return d.kind === "avoir";
}

export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatEURInput(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseMoney(raw: string): number | null {
  const t = raw.replace(/\s/g, "").replace("€", "").replace(",", ".").trim();
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function formatQty(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(n);
}

export function paperLabels(lang?: string) {
  const en = lang === "en";
  return {
    en,
    designation: en ? "Description" : "Désignation et description",
    unit: en ? "Unit" : "Unité",
    qty: en ? "Qty" : "Qté",
    price: en ? "Unit price" : "P.U.",
    vat: en ? "VAT" : "TVA",
    amount: en ? "Amount" : "Montant",
    empty: en ? "No lines yet." : "Aucune ligne pour le moment.",
    payment: en ? "Payment" : "Règlement",
    terms: en ? "Terms" : "Conditions",
    signKicker: en ? "Electronic signature" : "Espace de signature électronique",
    pieces: en ? "Attachments" : "Pièces jointes",
    signTitle: en ? "Approved" : "Bon pour accord",
    signNote: en
      ? "Signing in this box accepts the quote and the general terms of sale. The signature is time-stamped and kept with the document."
      : "La signature dans ce cadre vaut acceptation du devis et des conditions générales de vente. Elle est horodatée et conservée avec le document.",
    untitled: en ? "Untitled line" : "Ligne sans intitulé",
    vatFree: en ? "not applicable" : "non applicable",
    vatExport: en ? "0 % — export from China" : "0 % — exportation Chine",
    net: en ? "Amount due" : "Net à payer",
    netDap: en ? "Amount due, DAP included" : "Net à payer, DAP compris",
    works: en ? "Subtotal" : "Total des ouvrages",
    due: en ? "Amount due" : "Montant à régler",
    deposit: en ? "Deposit" : "Acompte",
    balance: en ? "Balance before shipment" : "Solde avant expédition",
    quote: en ? "Quote" : "Devis",
    invoice: en ? "Invoice" : "Facture",
    credit: en ? "Credit note" : "Avoir",
    issued: en ? "Issue date" : "Date d’émission",
    valid: en ? "Quote valid until" : "Validité du devis",
    days: en ? "days" : "jours",
    lead: en ? "Production time" : "Délai de production",
    delivery: en ? "Delivery" : "Livraison",
    port: en ? "Arrival port" : "Port d’arrivée",
    dueDate: en ? "Due date" : "Date d’exigibilité",
    refQuote: en ? "Source quote" : "Devis de référence",
    posts: en ? "Lines billed" : "Postes facturés",
    sourceInvoice: en ? "Original invoice" : "Facture d’origine",
    reason: en ? "Reason" : "Motif",
    creditAmount: en ? "Credit amount" : "Montant de l’avoir",
    afterCredit: en ? "Invoice balance after credit" : "Solde facture après avoir",
    transfer: en ? "Bank transfer in euros" : "Virement bancaire en euros",
    bankMissing: en ? "Bank: to be completed" : "Banque : à compléter",
    refHint: (number: string) => (en ? `Put the reference ${number} in the transfer reference.` : `Indiquez la référence ${number} dans le libellé.`),
    vatNote: en
      ? "VAT not applicable: goods and services supplied by a company established in China. Import duty and import VAT are payable by the client; an EORI number is required."
      : "",
    depositKicker: en ? "deposit" : "d’acompte",
    balanceKicker: en ? "balance" : "de solde",
    clientMissing: en ? "Choose a client." : "Sélectionnez un client dans l’atelier.",
    clientPending: en ? "Client to be completed" : "Client à renseigner",
  };
}

export function formatPercent(bps: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(bps / 100);
}

export function formatDate(iso: string): string {
  const [y, m, d] = String(iso ?? "").split("-");
  if (!y || !m || !d) return iso || "";
  return `${d}.${m}.${y}`;
}

export function formatDateSlash(iso: string): string {
  const [y, m, d] = String(iso ?? "").split("-");
  if (!y || !m || !d) return iso || "";
  return `${d}/${m}/${y}`;
}

export function addDays(iso: string, days: number): string {
  const dt = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(dt.getTime())) return iso;
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function todayISO(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function lineSum(lines: Line[]): number {
  return lines.reduce((sum, line) => {
    if (line.omitFromTotal) return sum;
    const qty = Number.isFinite(line.qty) ? line.qty : 0;
    const price = Number.isFinite(line.unitPriceCents) ? line.unitPriceCents : 0;
    return sum + Math.round(qty * price);
  }, 0);
}

export function commercial(worksCents: number, commissionBps: number, depositBps: number) {
  const commissionCents = Math.round((worksCents * commissionBps) / 10000);
  const netCents = worksCents + commissionCents;
  const depositCents = Math.round((netCents * depositBps) / 10000);
  const balanceCents = netCents - depositCents;
  return { worksCents, commissionCents, netCents, depositCents, balanceCents };
}

export function dueCents(doc: Document): number {
  if (isDevis(doc)) return commercial(lineSum(doc.lines), doc.commissionBps, doc.depositBps).netCents;
  if (isAvoir(doc)) return lineSum(doc.lines);
  if (doc.mode === "integrale") {
    return commercial(lineSum(doc.lines), doc.commissionBps, 0).netCents;
  }
  return lineSum(doc.lines);
}

export function bulletLines(details: string): string[] {
  const text = String(details ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p)>/gi, "\n")
    .replace(/<(div|p)[^>]*>/gi, "")
    .replace(/([a-zàâäéèêëïîôùûüç])([A-ZÉÈÊÀÂÎÔÙ])/g, "$1\n$2")
    .replace(/cm(?=\d)/gi, "cm\n");
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinAnd(parts: string[]): string {
  const clean = parts.filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? "";
  return `${clean.slice(0, -1).join(", ")} et ${clean[clean.length - 1]}`;
}

export function nextCode(lines: Line[]): string {
  const used = new Set(lines.map((l) => l.code.trim().toUpperCase()));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const c of alphabet) if (!used.has(c)) return c;
  return String(lines.length + 1);
}

export function emptyLine(lines: Line[]): Line {
  return {
    id: uid("ln"),
    code: nextCode(lines),
    title: "",
    material: "",
    details: "",
    unit: "unité",
    qty: 1,
    unitPriceCents: 0,
  };
}

export function snapFromDevis(devis: Devis, alreadyInvoicedCents = 0): OrderSnap {
  const totals = commercial(lineSum(devis.lines), devis.commissionBps, devis.depositBps);
  return {
    worksCents: totals.worksCents,
    commissionCents: totals.commissionCents,
    netCents: totals.netCents,
    commissionBps: devis.commissionBps,
    depositBps: devis.depositBps,
    sourceNumber: devis.number,
    sourceDate: devis.issueDate,
    postes: devis.lines.length,
    alreadyInvoicedCents,
  };
}

export function narrativeLine(
  devis: Devis,
  client: Client | undefined,
  mode: "acompte" | "solde",
): Line {
  const snap = snapFromDevis(devis);
  const totals = commercial(snap.worksCents, snap.commissionBps, snap.depositBps);
  const who = client?.tradeName || "client";
  const names = devis.lines.map((l) => l.title).filter(Boolean);
  const codes = joinAnd(devis.lines.map((l) => l.code));
  if (mode === "acompte") {
    return {
      id: uid("ln"),
      code: "1",
      title: `Acompte de ${formatPercent(devis.depositBps)} % sur le devis ${devis.number}`,
      material: `Devis du ${formatDate(devis.issueDate)}, ${devis.lines.length} postes — ${who}`,
      details: [
        names.length ? `Ouvrages ${codes} : ${names.join(", ")}.` : `Ouvrages du devis ${devis.number}.`,
        `Total des ouvrages ${formatEUR(totals.worksCents)} + commission SourcingPick ${formatPercent(devis.commissionBps)} % ${formatEUR(totals.commissionCents)} = ${formatEUR(totals.netCents)} net à payer, livraison ${devis.delivery || "DAP"} comprise.`,
        "La production est lancée à réception du présent acompte.",
        `Solde de ${formatEUR(totals.balanceCents)} exigible avant expédition, sur présentation des photos de contrôle.`,
      ].join("\n"),
      unit: "forfait",
      qty: 1,
      unitPriceCents: totals.depositCents,
    };
  }
  return {
    id: uid("ln"),
    code: "1",
    title: `Solde avant expédition sur le devis ${devis.number}`,
    material: `Après acompte de ${formatPercent(devis.depositBps)} %, ${devis.lines.length} postes — ${who}`,
    details: [
      names.length ? `Ouvrages ${codes} : ${names.join(", ")}.` : `Ouvrages du devis ${devis.number}.`,
      `Solde exigible avant expédition, sur présentation des photos de contrôle des pièces finies.`,
      `Acompte déjà prévu : ${formatEUR(totals.depositCents)} sur un net de ${formatEUR(totals.netCents)}.`,
    ].join("\n"),
    unit: "forfait",
    qty: 1,
    unitPriceCents: totals.balanceCents,
  };
}

export function devisConditions(d: Devis, company: Company): string {
  const deposit = formatPercent(d.depositBps);
  const balance = formatPercent(Math.max(0, 10000 - d.depositBps));
  const en = d.lang === "en";
  const lines = en
    ? [
        `Deposit: ${deposit}% of the net amount, payable on order. Production starts once it is received.`,
        `Balance: ${balance}% before shipment, against inspection photos of the finished goods.`,
        "Breakage cover is included. Any piece found broken, cracked or chipped on delivery, with reservations written on the delivery note, is remade and replaced at our cost.",
        `Delivery ${d.delivery || "DAP, unloaded"} is included: sea freight, blocking, export formalities, road haulage and unloading. Import duty and import VAT are payable by the client.`,
        "Not covered by SourcingPick: installation and maintenance.",
        "Prices in euros, exclusive of tax.",
        `Valid for ${d.validityDays} days. Paying the deposit accepts the quote and these terms.`,
        "This quote is also subject to our terms of sale: https://sourcingpick.com/cgv",
      ]
    : [
        `Acompte : ${deposit} % du net à payer à la commande. La production est lancée à réception.`,
        `Solde : ${balance} % avant expédition, sur présentation des photos de contrôle des pièces finies.`,
        "Assurance et garantie cassée incluses. Toute pièce cassée, fissurée ou éclatée constatée à la réception, avec réserves portées sur le bordereau de livraison, est refabriquée et remplacée à l’identique à notre charge.",
        `Livraison ${d.delivery || "DAP, déchargée"} comprise : fret maritime, calage, formalités d’export, acheminement routier, déchargement. Droits de douane et TVA à l’importation à la charge du client.`,
        "Non assurés par SourcingPick : la pose et l’entretien.",
        "Tous les plans des monuments seront refaits avant fabrication, pour tenir compte des derniers retours.",
        `Prix en euros hors taxes, établis au taux de 1 € = ${company.fxLabel || "7,60"} CNY, révisables au-delà de 3 % de variation.`,
        `Validité ${d.validityDays} jours. Le règlement de l’acompte vaut acceptation du devis et de ses conditions.`,
        "Notre devis est également soumis à nos conditions générales de ventes : https://sourcingpick.com/cgv",
      ];
  return lines.join("\n");
}

export function factureConditions(f: Facture): string {
  if (f.lang === "en") {
    if (f.mode === "integrale") {
      return [
        f.order ? `Invoice issued from quote ${f.order.sourceNumber} dated ${formatDate(f.order.sourceDate)}.` : "Invoice for services and goods.",
        "Prices in euros, exclusive of tax. Delivery follows the quote, when there is one.",
      ].join("\n");
    }
    if (f.mode === "acompte") return "Deposit invoice. Production starts once payment is received.\nPrices in euros, exclusive of tax.";
    return "Balance invoice, due before shipment, against inspection photos.\nPrices in euros, exclusive of tax.";
  }
  if (f.mode === "integrale") {
    return [
      f.order
        ? `Facture établie sur le devis ${f.order.sourceNumber} du ${formatDate(f.order.sourceDate)}.`
        : "Facture de prestations et marchandises.",
      "Prix en euros hors taxes. Livraison selon les conditions du devis, lorsque celui-ci existe.",
      "La production ou l’expédition suit le calendrier convenu à la commande.",
    ].join("\n");
  }
  const order = f.order;
  const billed = lineSum(f.lines);
  const rest = order ? Math.max(0, order.netCents - order.alreadyInvoicedCents - billed) : 0;
  if (f.mode === "acompte") {
    return [
      order
        ? `Facture d’acompte émise sur le devis ${order.sourceNumber} du ${formatDate(order.sourceDate)}, ${order.postes} postes.`
        : "Facture d’acompte.",
      "La production est lancée à réception du règlement.",
      `Solde de ${formatEUR(rest)} exigible avant expédition, sur présentation des photos de contrôle.`,
      "Prix en euros hors taxes, livraison DAP déchargée comprise.",
    ].join("\n");
  }
  return [
    order
      ? `Facture de solde émise sur le devis ${order.sourceNumber} du ${formatDate(order.sourceDate)}.`
      : "Facture de solde.",
    "Exigible avant expédition, sur présentation des photos de contrôle des pièces finies.",
    "Prix en euros hors taxes, livraison DAP déchargée comprise.",
  ].join("\n");
}

export function avoirConditions(a: Avoir): string {
  if (a.lang === "en") {
    return [
      a.sourceNumber ? `Credit note issued against invoice ${a.sourceNumber}.` : "Credit note issued as a correction.",
      "The amount is deducted from the original invoice. It is applied to the balance still due, unless a refund is agreed in writing.",
      "Prices in euros, exclusive of tax.",
    ].join("\n");
  }
  return [
    a.sourceNumber
      ? `Avoir émis en référence à la facture ${a.sourceNumber}.`
      : "Avoir émis pour rectification.",
    "Le montant vient en déduction de la facture d’origine. Il est imputé sur le solde restant dû, sauf accord écrit d’un remboursement.",
    "Prix en euros hors taxes.",
  ].join("\n");
}

export function conditionsFor(doc: Document, company: Company): string {
  const base = isDevis(doc) ? devisConditions(doc, company) : isFacture(doc) ? factureConditions(doc) : avoirConditions(doc);
  const extra = company.conditionsExtra?.trim();
  return extra ? `${base}\n${extra}` : base;
}

export const COMPANY: Company = {
  legalName: "HANGZHOU QIYUAN YING TECHNOLOGY INFORMATION CO., LTD.",
  brandLine: "SOURCINGPICK",
  chineseName: "杭州起源缨科技信息有限公司",
  contactName: "Matteo Jean Fernandez",
  email: "contact@sourcingpick.com",
  address:
    "Room 401, 4F, Building 3, No. 152 Haoyun Street\nLiangzhu Subdistrict, Yuhang District, Hangzhou, Zhejiang, China",
  usci: "91330110MAK784B049",
  capital: "100 000 CNY",
  iban: "BE15 9058 6919 0230",
  swift: "TRWIBEB1XXX",
  bank: "Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium",
  fxLabel: "7,60",
  vatNote:
    "TVA non applicable : marchandises et prestations fournies par une société établie en Chine. Droits de douane et TVA à l’importation à la charge du client ; numéro EORI nécessaire.",
  conditionsExtra: "",
};

export const CLIENTS: Client[] = [
  {
    id: "cli_manzini",
    legalName: "SOC. D’EXPLOITATION DES ETS MANZINI",
    tradeName: "Granit Manzini — SARL",
    address: "Rue de Verdun\n71140 Bourbon-Lancy, France",
    vat: "FR05384621520",
    siret: "384 621 520 00012",
    rcs: "RCS Mâcon",
    siteNote: "DAP · Bourbon-Lancy (71), France",
    email: "",
  },
];

function L(
  code: string,
  title: string,
  material: string,
  details: string,
  qty: number,
  euros: number,
  unit = "unité",
): Line {
  return {
    id: `ln_${code.toLowerCase()}`,
    code,
    title,
    material,
    details,
    unit,
    qty,
    unitPriceCents: Math.round(euros * 100),
  };
}

const manziniLines: Line[] = [
  L(
    "A",
    "Monument double à stèle cœur",
    "Granit Rosa Bella (Brésil), toutes pièces",
    [
      "Semelle trottoir 210 × 210 cm.",
      "Semelle à revers d’eau 200 × 200 cm, épaisseur 5 à 5,10 cm.",
      "Tombale moderne double avec jardinière intégrée.",
      "Stèle en forme de cœur, travaillée et découpée.",
    ].join("\n"),
    1,
    2250,
  ),
  L(
    "B",
    "Monument pyramide, colonne et banc",
    "Viscount White, granit noir, pierre blanche",
    [
      "Entourage 200 × 100 × 20 cm de hauteur.",
      "Plaquage horizontal 210 × 110 × 5 cm.",
      "Pyramidion en 4 plaques de granit noir : 180 × 80 cm en appui, hauteur environ 40 cm.",
      "Colonne en pierre blanche, 120 cm de hauteur × 20 × 20 cm.",
      "Banc inclus. Sans semelle trottoir.",
    ].join("\n"),
    1,
    1260,
  ),
  L(
    "C",
    "2 tombales grises",
    "Granit gris équivalent Tarn Moyen",
    ["Tombale 2,00 × 1,00 m, épaisseur 5 cm.", "2 pièces identiques."].join("\n"),
    2,
    1519,
  ),
  L(
    "D",
    "Monument en granit Rose Levant",
    "Rose Levant — selon commande client CMA260090",
    [
      "Placage avant 150 × 20 cm de hauteur × 3 cm.",
      "Semelle en U 150 × 300 × 5 cm : 1 pièce avant 150 × 35, 2 pièces latérales 265 × 30, 1 pièce arrière 90 × 35.",
      "2 baguettes 240 × 13 × 15 cm de hauteur. Marche prie-Dieu 74 × 25 × 5 cm.",
      "2 parpaings en closoir 74 × 10 cm et 74 × 13 × 15 cm de hauteur.",
      "Tombale 189 × 79 × 6 cm. Socle 83 × 15 × 8 cm.",
      "Stèle 2 faces polies, 77 × 75 cm de hauteur × 10 cm.",
    ].join("\n"),
    1,
    1577,
  ),
  L(
    "F",
    "Columbarium en gradins, 9 cases",
    "Équivalent Rose de la Clarté, portes Noir Fin",
    [
      "9 cases réparties en 4 + 3 + 2. Intérieur de case 40 × 45 × 36 cm de hauteur.",
      "Plateaux bas 50 × 70 × 3 cm, plateaux hauts 50 × 57 × 3 cm.",
      "Murs arrière 40 × 5 × 36 cm, murs latéraux 5 × 70/57 × 36 cm.",
      "Portes en Noir Fin 40 × 2 × 35,5 cm.",
    ].join("\n"),
    1,
    1700,
  ),
  L(
    "G",
    "Monument gris foncé",
    "Gris foncé équivalent Tarn Royal (G654)",
    [
      "Semelle 2,20 × 1,20 m, épaisseur 5 cm.",
      "Entourage 2,00 × 1,00 m, hauteur 0,15 m, avec jardinière massive.",
      "Tombale 1,70 × 0,80 m, épaisseur 5 à 7 cm.",
      "Stèle doucine.",
    ].join("\n"),
    3,
    965,
  ),
  L(
    "H",
    "Monument granit Noir Afrique",
    "Noir Afrique d’Afrique du Sud — modèle Maffre, réf. client",
    [
      "Fondation béton armé sur concession 2,70 × 1,40 m.",
      "Monument 2,25 × 1,00 m. Placages verticaux avant et latéral gauche, hauteur 0,20 m.",
      "Semelle en U 1,40 × 2,70 × 0,05 m. Jeu coffret 4 pièces sous tombale, épaisseur 7 × 7 cm.",
      "Tombale 4 chants polis 2,25 × 1,00 m, épaisseur 12/10 à pente.",
      "Queue de billard sur les deux longueurs : 0 cm aux pieds, 10 cm à la tête.",
    ].join("\n"),
    3,
    1100,
  ),
  L(
    "I",
    "Monuments d’appel, granit gris",
    "Modèle standard 7 pièces — prix unitaire DAP",
    [
      "Bordure tête et pied 1 050 × 30 × 250 mm, 2 pièces.",
      "Bordure longueur 2 360 × 30 × 250 mm, 2 pièces.",
      "Plaque de couverture 2 170 × 1 100 × 50 mm.",
      "Socle 1 120 × 250 × 100 mm. Stèle 900 × 100 × 700 mm.",
      "Teinte du gris à préciser : clair ou foncé.",
    ].join("\n"),
    10,
    700,
  ),
];

const devisSeed: Devis = {
  id: "doc_dv_2026_08",
  kind: "devis",
  number: "SP-DV-2026-08",
  status: "emis",
  clientId: "cli_manzini",
  issueDate: "2026-09-26",
  headline: "Annule et remplace les devis SP-DV-2026-06 et SP-DV-2026-07.",
  conditions: "",
  conditionsCustom: false,
  createdAt: "2026-09-26T08:00:00.000Z",
  updatedAt: "2026-09-26T08:00:00.000Z",
  validityDays: 30,
  leadTime: "3 à 4 semaines",
  delivery: "DAP, déchargée",
  port: "",
  commissionBps: 200,
  depositBps: 4000,
  lines: manziniLines,
};

devisSeed.conditions = devisConditions(devisSeed, COMPANY);

const acompteSnap = snapFromDevis(devisSeed, 0);
const acompteLine = narrativeLine(devisSeed, CLIENTS[0], "acompte");
acompteLine.id = "ln_acompte";

const factureSeed: Facture = {
  id: "doc_fa_2026_004",
  kind: "facture",
  number: "SP-FA-2026-004",
  status: "emis",
  clientId: "cli_manzini",
  issueDate: "2026-09-26",
  headline: "Acompte de 40 % sur le devis SP-DV-2026-08 du 26.09.2026, 8 postes.",
  conditions: "",
  conditionsCustom: false,
  createdAt: "2026-09-26T09:00:00.000Z",
  updatedAt: "2026-09-26T09:00:00.000Z",
  mode: "acompte",
  sourceDevisId: devisSeed.id,
  dueLabel: "à réception",
  commissionBps: 200,
  depositBps: 4000,
  order: acompteSnap,
  lines: [acompteLine],
  paidOn: "",
  paidMethod: "Virement",
  paidCents: null,
  feesCents: 0,
};

factureSeed.conditions = factureConditions(factureSeed);

export const SEED_DOCS: Document[] = [factureSeed, devisSeed];
export const SEED_SEQ: Seq = { devis: 9, facture: 5, avoir: 1 };

export type PaperTotal = {
  label: string;
  value: string;
  tone: "plain" | "strong" | "pill" | "muted" | "emph";
  rule?: boolean;
};

export type PaperModel = {
  title: string;
  kicker: string;
  number: string;
  headline: string;
  issuerName: string;
  issuerBrand: string;
  issuerZh: string;
  issuerLines: string[];
  clientName: string;
  clientLines: string[];
  meta: { label: string; value: string }[];
  lines: {
    key: string;
    code: string;
    title: string;
    material: string;
    bullets: string[];
    image: string;
    images: string[];
    unit: string;
    qty: string;
    unitPrice: string;
    vat: string;
    amount: string;
  }[];
  totals: PaperTotal[];
  payment: PayLine[];
  conditions: string[];
  vatNote: string;
  sealTitle: string;
  sealHint: string;
};

export type PayLine = { text: string; tone: "lead" | "name" | "ref" };

function moneyRow(label: string, cents: number, tone: PaperTotal["tone"] = "plain"): PaperTotal {
  return { label, value: formatEUR(cents), tone };
}

export function toPaper(
  doc: Document,
  company: Company,
  client: Client | undefined,
): PaperModel {
  const copy = paperLabels(doc.lang);
  const issuerLines = [
    company.contactName,
    company.email,
    ...String(company.address ?? "").split("\n").filter(Boolean),
    company.usci ? `USCI : ${company.usci}` : "",
    company.capital ? (copy.en ? `Share capital: ${company.capital}` : `Capital social : ${company.capital}`) : "",
  ].filter(Boolean);

  const clientLines = client
    ? [
        client.tradeName && client.tradeName !== client.legalName ? client.tradeName : "",
        client.email,
        ...String(client.address ?? "").split("\n").filter(Boolean),
        client.vat ? `${copy.en ? "VAT no." : "N° TVA"} : ${client.vat}` : "",
        [client.siret ? `SIRET ${client.siret}` : "", client.rcs].filter(Boolean).join(" · "),
      ].filter(Boolean)
    : [copy.clientMissing];

  const tagged = (prefix: string, value: string) => {
    const v = String(value ?? "").trim();
    if (!v) return copy.en ? `${prefix}: to be completed` : `${prefix} à compléter`;
    return new RegExp(`^${prefix}\\b`, "i").test(v) ? v : `${prefix} ${v}`;
  };
  const payment: PayLine[] = [
    { text: copy.transfer, tone: "lead" },
    { text: company.legalName, tone: "name" },
    { text: tagged("IBAN", company.iban), tone: "name" },
    { text: tagged("SWIFT", company.swift), tone: "name" },
    { text: (company.bank || "").trim() || copy.bankMissing, tone: "name" },
    { text: copy.refHint(doc.number), tone: "ref" },
  ];

  const lines = doc.lines.map((line) => ({
    key: line.id,
    code: line.code || "·",
    title: line.title || copy.untitled,
    material: line.material,
    bullets: bulletLines(line.details),
    image: line.image || line.images?.[0] || "",
    images: (line.images?.length ? line.images : line.image ? [line.image] : []).filter(Boolean),
    unit: line.unit || "—",
    qty: formatQty(line.qty),
    unitPrice: formatEUR(line.unitPriceCents),
    vat: "—",
    amount: formatEUR(Math.round((Number.isFinite(line.qty) ? line.qty : 0) * line.unitPriceCents)),
  }));

  const base = {
    number: doc.number,
    headline: doc.headline,
    issuerName: company.legalName,
    issuerBrand: company.brandLine,
    issuerZh: company.chineseName,
    issuerLines,
    clientName: client?.legalName || copy.clientPending,
    clientLines,
    lines,
    payment,
    conditions: bulletLines(doc.conditions),
    vatNote: copy.en ? copy.vatNote : company.vatNote,
  };

  if (isDevis(doc)) {
    const t = commercial(lineSum(doc.lines), doc.commissionBps, doc.depositBps);
    const totals: PaperTotal[] = [moneyRow(copy.works, t.worksCents)];
    if (doc.commissionBps > 0) {
      totals.push(
        moneyRow(
          copy.en
            ? `SourcingPick commission ${formatPercent(doc.commissionBps)}% (sourcing, inspection, follow-up)`
            : `Commission SourcingPick ${formatPercent(doc.commissionBps)} % (sourcing, contrôles, suivi)`,
          t.commissionCents,
        ),
      );
    }
    totals.push({ label: copy.vat, value: copy.vatFree, tone: "muted" });
    const netLabel = /dap/i.test(doc.delivery) ? copy.netDap : copy.net;
    totals.push(moneyRow(netLabel, t.netCents, "strong"));
    if (doc.depositBps > 0) {
      totals.push(
        moneyRow(
          copy.en ? `Deposit ${formatPercent(doc.depositBps)}% on order` : `Acompte ${formatPercent(doc.depositBps)} % à la commande`,
          t.depositCents,
          "emph",
        ),
        moneyRow(copy.balance, t.balanceCents, "muted"),
      );
    }
    return {
      ...base,
      title: copy.quote,
      kicker: "",
      meta: [
        { label: copy.issued, value: formatDate(doc.issueDate) },
        {
          label: copy.valid,
          value: `${doc.validityDays} ${copy.days} — ${formatDate(addDays(doc.issueDate, doc.validityDays))}`,
        },
        { label: copy.lead, value: doc.leadTime || "—" },
        { label: copy.delivery, value: doc.delivery || "—" },
        ...(doc.port ? [{ label: copy.port, value: doc.port }] : []),
      ],
      totals,
      sealTitle: "",
      sealHint: "",
    };
  }

  if (isFacture(doc)) {
    const billed = lineSum(doc.lines);
    const totals: PaperTotal[] = [];
    if (doc.mode === "integrale") {
      const t = commercial(lineSum(doc.lines), doc.commissionBps, 0);
      totals.push(moneyRow(copy.works, t.worksCents));
    const included = doc.lines.reduce((sum, line) => {
      if (!line.omitFromTotal) return sum;
      const qty = Number.isFinite(line.qty) ? line.qty : 0;
      return sum + Math.round(qty * (Number.isFinite(line.unitPriceCents) ? line.unitPriceCents : 0));
    }, 0);
    if (included > 0) {
      totals.push({
        label: copy.en ? "Freight included in the prices, not added" : "Fret imputé, non ajouté au total",
        value: formatEUR(included),
        tone: "muted",
      });
    }
      if (doc.commissionBps > 0) {
        totals.push(
          moneyRow(
            copy.en ? `SourcingPick commission ${formatPercent(doc.commissionBps)}%` : `Commission SourcingPick ${formatPercent(doc.commissionBps)} %`,
            t.commissionCents,
            "muted",
          ),
        );
      }
      totals.push({ label: copy.vat, value: copy.vatExport, tone: "muted", rule: true });
      totals.push(moneyRow(copy.due, t.netCents, "strong"));
    } else if (doc.order) {
      const order = doc.order;
      const rest = Math.max(0, order.netCents - order.alreadyInvoicedCents - billed);
      totals.push(
        moneyRow(copy.works, order.worksCents),
        moneyRow(
          copy.en ? `SourcingPick commission ${formatPercent(order.commissionBps)}%` : `Commission SourcingPick ${formatPercent(order.commissionBps)} %`,
          order.commissionCents,
          "muted",
        ),
        moneyRow(copy.en ? "Order amount due" : "Net à payer de la commande", order.netCents),
        { label: copy.vat, value: copy.vatExport, tone: "muted", rule: true },
      );
      if (doc.mode === "solde" && order.alreadyInvoicedCents > 0) {
        totals.push(moneyRow(copy.en ? "Deposit already invoiced" : "Acompte déjà facturé", order.alreadyInvoicedCents, "muted"));
      }
      const pill =
        doc.mode === "acompte"
          ? copy.en
            ? `Deposit ${formatPercent(order.depositBps)}% — this invoice`
            : `Acompte ${formatPercent(order.depositBps)} % — présente facture`
          : copy.en
            ? "Balance — this invoice"
            : "Solde — présente facture";
      totals.push(moneyRow(pill, billed, "pill"), moneyRow(copy.due, billed, "strong"));
      if (rest > 0) totals.push(moneyRow(copy.en ? "Still due before shipment" : "Reste à payer avant expédition", rest, "muted"));
    } else {
      totals.push({ label: copy.vat, value: copy.vatExport, tone: "muted", rule: true }, moneyRow(copy.due, billed, "strong"));
    }
    const kicker = doc.mode === "acompte" ? copy.depositKicker : doc.mode === "solde" ? copy.balanceKicker : "";
    const meta = [
      { label: copy.issued, value: formatDate(doc.issueDate) },
      { label: copy.dueDate, value: doc.dueLabel || "—" },
    ];
    if (doc.order) {
      meta.push({ label: copy.refQuote, value: doc.order.sourceNumber }, { label: copy.posts, value: String(doc.order.postes) });
    }
    return {
      ...base,
      title: copy.invoice,
      kicker,
      meta,
      totals,
      sealTitle: "",
      sealHint: "",
    };
  }

  const credit = lineSum(doc.lines);
  const totals: PaperTotal[] = [];
  if (doc.sourceAmountCents > 0) {
    totals.push(moneyRow(copy.sourceInvoice, doc.sourceAmountCents, "muted"));
  }
  totals.push({ label: copy.vat, value: copy.vatFree, tone: "muted", rule: true }, moneyRow(copy.creditAmount, credit, "strong"));
  if (doc.sourceAmountCents > 0) {
    totals.push(moneyRow(copy.afterCredit, doc.sourceAmountCents - credit, "muted"));
  }
  return {
    ...base,
    title: copy.credit,
    kicker: "",
    meta: [
      { label: copy.issued, value: formatDate(doc.issueDate) },
      { label: copy.sourceInvoice, value: doc.sourceNumber || "—" },
      { label: copy.reason, value: doc.reason || "—" },
    ],
    totals,
    sealTitle: "",
    sealHint: "",
  };
}

/** Recale le devis d’exemple SP-DV-2026-08 sur le modèle validé (postes G et H au prix unitaire). */
export function normalizeDocs(
  company: Company,
  clients: Client[],
  docs: Document[],
): { docs: Document[]; changed: boolean } {
  let changed = false;
  const next = docs.map((doc) => {
    if (!isDevis(doc) || doc.number !== "SP-DV-2026-08") return doc;
    let lineChanged = false;
    const lines = doc.lines.map((line) => {
      if (line.code === "G" && line.qty === 1 && line.unitPriceCents === 289500) {
        lineChanged = true;
        return { ...line, qty: 3, unitPriceCents: 96500 };
      }
      if (line.code === "H" && line.qty === 1 && line.unitPriceCents === 414500) {
        lineChanged = true;
        return { ...line, qty: 3, unitPriceCents: 110000 };
      }
      return line;
    });
    let updated: Devis = lineChanged ? { ...doc, lines } : doc;
    if (!updated.conditionsCustom) {
      const conditions = devisConditions(updated, company);
      if (conditions !== updated.conditions) {
        changed = true;
        updated = { ...updated, conditions };
      }
    }
    if (lineChanged) changed = true;
    return updated;
  });

  const devis = next.find((d): d is Devis => isDevis(d) && d.number === "SP-DV-2026-08");
  const docsOut = devis
    ? next.map((doc) => {
        if (!isFacture(doc) || doc.number !== "SP-FA-2026-004") return doc;
        if (doc.conditionsCustom || doc.lines.length !== 1 || doc.lines[0]?.id !== "ln_acompte") return doc;
        const client = clients.find((c) => c.id === devis.clientId);
        const line = narrativeLine(devis, client, "acompte");
        line.id = "ln_acompte";
        const order = snapFromDevis(devis, 0);
        if (line.unitPriceCents === doc.lines[0].unitPriceCents && doc.order?.netCents === order.netCents) return doc;
        changed = true;
        const facture: Facture = {
          ...doc,
          lines: [line],
          order,
          headline: `Acompte de ${formatPercent(devis.depositBps)} % sur le devis ${devis.number} du ${formatDate(devis.issueDate)}, ${devis.lines.length} postes.`,
          conditionsCustom: false,
        };
        facture.conditions = factureConditions(facture);
        return facture;
      })
    : next;

  return { docs: changed ? docsOut : docs, changed };
}

export function kindLabel(kind: Document["kind"]): string {
  if (kind === "devis") return "Devis";
  if (kind === "facture") return "Facture";
  return "Avoir";
}

export function modeLabel(mode: FactureMode): string {
  if (mode === "acompte") return "Acompte";
  if (mode === "solde") return "Solde";
  return "Intégrale";
}
