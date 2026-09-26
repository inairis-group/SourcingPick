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

export function formatPercent(bps: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(bps / 100);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function formatDateSlash(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
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
  return details
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
  return [
    `Acompte : ${deposit} % du net à payer à la commande. La production est lancée à réception.`,
    `Solde : ${balance} % avant expédition, sur présentation des photos de contrôle des pièces finies.`,
    "Assurance et garantie cassée incluses. Toute pièce cassée, fissurée ou éclatée constatée à la réception, avec réserves portées sur le bordereau de livraison, est refabriquée et remplacée à l’identique à notre charge.",
    `Livraison ${d.delivery || "DAP"} comprise : fret maritime, calage, formalités d’export, acheminement routier, déchargement. Droits de douane et TVA à l’importation à la charge du client.`,
    "Non assurés par SourcingPick : la pose et l’entretien.",
    "Tous les plans des monuments seront refaits avant fabrication, pour tenir compte des derniers retours.",
    `Prix en euros hors taxes, établis au taux de 1 € = ${company.fxLabel || "7,60"} CNY, révisables au-delà de 3 % de variation.`,
    `Validité ${d.validityDays} jours. Le règlement de l’acompte vaut acceptation du devis et de ses conditions.`,
  ].join("\n");
}

export function factureConditions(f: Facture): string {
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
  return [
    a.sourceNumber
      ? `Avoir émis en référence à la facture ${a.sourceNumber}.`
      : "Avoir émis pour rectification.",
    "Le montant vient en déduction de la facture d’origine. Il est imputé sur le solde restant dû, sauf accord écrit d’un remboursement.",
    "Prix en euros hors taxes.",
  ].join("\n");
}

export function conditionsFor(doc: Document, company: Company): string {
  if (isDevis(doc)) return devisConditions(doc, company);
  if (isFacture(doc)) return factureConditions(doc);
  return avoirConditions(doc);
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
    1,
    2895,
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
    1,
    4145,
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
  tone: "plain" | "strong" | "pill" | "muted";
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
    unit: string;
    qty: string;
    unitPrice: string;
    vat: string;
    amount: string;
  }[];
  totals: PaperTotal[];
  payment: string[];
  conditions: string[];
  vatNote: string;
  sealTitle: string;
  sealHint: string;
};

function moneyRow(label: string, cents: number, tone: PaperTotal["tone"] = "plain"): PaperTotal {
  return { label, value: formatEUR(cents), tone };
}

export function toPaper(
  doc: Document,
  company: Company,
  client: Client | undefined,
): PaperModel {
  const issuerLines = [
    company.contactName,
    company.email,
    ...company.address.split("\n").filter(Boolean),
    company.usci ? `USCI : ${company.usci}` : "",
    company.capital ? `Capital social : ${company.capital}` : "",
  ].filter(Boolean);

  const clientLines = client
    ? [
        client.tradeName,
        ...client.address.split("\n").filter(Boolean),
        client.vat ? `N° TVA : ${client.vat}` : "",
        [client.siret ? `SIRET ${client.siret}` : "", client.rcs].filter(Boolean).join(" · "),
        client.siteNote,
      ].filter(Boolean)
    : ["Sélectionnez un client dans l’atelier."];

  const payment = [
    "Virement bancaire en euros",
    company.legalName,
    company.iban ? `IBAN ${company.iban}` : "IBAN à compléter",
    company.swift ? `SWIFT ${company.swift}` : "SWIFT à compléter",
    company.bank || "Banque : à compléter",
    `Indiquez la référence ${doc.number} dans le libellé.`,
  ];

  const lines = doc.lines.map((line) => ({
    key: line.id,
    code: line.code || "·",
    title: line.title || "Ligne sans intitulé",
    material: line.material,
    bullets: bulletLines(line.details),
    image: line.image || "",
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
    clientName: client?.legalName || "Client à renseigner",
    clientLines,
    lines,
    payment,
    conditions: bulletLines(doc.conditions),
    vatNote: company.vatNote,
  };

  if (isDevis(doc)) {
    const t = commercial(lineSum(doc.lines), doc.commissionBps, doc.depositBps);
    const totals: PaperTotal[] = [
      moneyRow("Total des ouvrages", t.worksCents),
    ];
    if (doc.commissionBps > 0) {
      totals.push(
        moneyRow(
          `Commission SourcingPick ${formatPercent(doc.commissionBps)} % (sourcing, contrôles, suivi)`,
          t.commissionCents,
        ),
      );
    }
    totals.push({ label: "TVA", value: "non applicable", tone: "plain" });
    const netLabel = /dap/i.test(doc.delivery) ? "Net à payer, DAP compris" : "Net à payer";
    totals.push(moneyRow(netLabel, t.netCents, "strong"));
    if (doc.depositBps > 0) {
      totals.push(
        moneyRow(`Acompte ${formatPercent(doc.depositBps)} % à la commande`, t.depositCents, "pill"),
        moneyRow("Solde avant expédition", t.balanceCents, "muted"),
      );
    }
    return {
      ...base,
      title: "Devis",
      kicker: "",
      meta: [
        { label: "Date d’émission", value: formatDate(doc.issueDate) },
        {
          label: "Validité du devis",
          value: `${doc.validityDays} jours — ${formatDate(addDays(doc.issueDate, doc.validityDays))}`,
        },
        { label: "Délai de production", value: doc.leadTime || "—" },
        { label: "Livraison", value: doc.delivery || "—" },
        ...(doc.port ? [{ label: "Port d’arrivée", value: doc.port }] : []),
      ],
      totals,
      sealTitle: "Bon pour accord",
      sealHint: "Date, nom du signataire et signature",
    };
  }

  if (isFacture(doc)) {
    const billed = lineSum(doc.lines);
    const totals: PaperTotal[] = [];
    if (doc.mode === "integrale") {
      const t = commercial(lineSum(doc.lines), doc.commissionBps, 0);
      totals.push(moneyRow("Total des ouvrages", t.worksCents));
      if (doc.commissionBps > 0) {
        totals.push(
          moneyRow(`Commission SourcingPick ${formatPercent(doc.commissionBps)} %`, t.commissionCents),
        );
      }
      totals.push({ label: "TVA", value: "0 % — exportation Chine", tone: "plain" });
      totals.push(moneyRow("Montant à régler", t.netCents, "strong"));
    } else if (doc.order) {
      const order = doc.order;
      const rest = Math.max(0, order.netCents - order.alreadyInvoicedCents - billed);
      totals.push(
        moneyRow("Total des ouvrages", order.worksCents),
        moneyRow(`Commission SourcingPick ${formatPercent(order.commissionBps)} %`, order.commissionCents),
        moneyRow("Net à payer de la commande", order.netCents),
        { label: "TVA", value: "0 % — exportation Chine", tone: "plain" },
      );
      if (doc.mode === "solde" && order.alreadyInvoicedCents > 0) {
        totals.push(moneyRow("Acompte déjà facturé", order.alreadyInvoicedCents, "muted"));
      }
      const pill =
        doc.mode === "acompte"
          ? `Acompte ${formatPercent(order.depositBps)} % — présente facture`
          : "Solde — présente facture";
      totals.push(moneyRow(pill, billed, "pill"), moneyRow("Montant à régler", billed, "strong"));
      if (rest > 0) totals.push(moneyRow("Reste à payer avant expédition", rest, "muted"));
    } else {
      totals.push(
        { label: "TVA", value: "non applicable", tone: "plain" },
        moneyRow("Montant à régler", billed, "strong"),
      );
    }
    const kicker = doc.mode === "acompte" ? "d’acompte" : doc.mode === "solde" ? "de solde" : "";
    const meta = [
      { label: "Date d’émission", value: formatDate(doc.issueDate) },
      { label: "Date d’exigibilité", value: doc.dueLabel || "—" },
    ];
    if (doc.order) {
      meta.push(
        { label: "Devis de référence", value: doc.order.sourceNumber },
        { label: "Postes facturés", value: String(doc.order.postes) },
      );
    }
    return {
      ...base,
      title: "Facture",
      kicker,
      meta,
      totals,
      sealTitle: "Cachet contractuel",
      sealHint: company.chineseName,
    };
  }

  const credit = lineSum(doc.lines);
  const totals: PaperTotal[] = [];
  if (doc.sourceAmountCents > 0) {
    totals.push(moneyRow("Facture d’origine", doc.sourceAmountCents, "muted"));
  }
  totals.push(
    { label: "TVA", value: "non applicable", tone: "plain" },
    moneyRow("Montant de l’avoir", credit, "strong"),
  );
  if (doc.sourceAmountCents > 0) {
    totals.push(moneyRow("Solde facture après avoir", doc.sourceAmountCents - credit, "muted"));
  }
  return {
    ...base,
    title: "Avoir",
    kicker: "",
    meta: [
      { label: "Date d’émission", value: formatDate(doc.issueDate) },
      { label: "Facture d’origine", value: doc.sourceNumber || "—" },
      { label: "Motif", value: doc.reason || "—" },
    ],
    totals,
    sealTitle: "Avoir",
    sealHint: "À déduire de la facture d’origine",
  };
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
