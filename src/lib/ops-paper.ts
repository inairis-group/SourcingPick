import { saveAtelier } from "@/lib/backend.functions";
import { conditionsFor, type Avoir, type Devis, type Facture, type Line } from "@/lib/docs";
import { percent, pricedLines, quoteMath, type OpsInvoice, type OpsQuote } from "@/lib/ops.shared";
import { useAtelier } from "@/lib/store";

function line(id: string, code: string, title: string, qty: number, unitPriceCents: number, unit = "unité", details = "", image = "", images: string[] = []): Line {
  const photos = (images.length ? images : image ? [image] : []).filter(Boolean);
  return { id, code, title, material: "", details, unit, qty, unitPriceCents, image: photos[0] || "", images: photos };
}

function rememberClient(clientId: string, legalName: string, siteNote: string) {
  if (!clientId.startsWith("usr_")) return;
  useAtelier.setState((state) => ({
    clients: state.clients.some((client) => client.id === clientId)
      ? state.clients
      : [
          ...state.clients,
          {
            id: clientId,
            legalName: legalName || "Client",
            tradeName: legalName,
            address: "",
            vat: "",
            siret: "",
            rcs: "",
            siteNote,
            email: "",
          },
        ],
  }));
}

const PRINT_PREFIX = "sp-print:";

function stagePrint(id: string) {
  const state = useAtelier.getState();
  const doc = state.docs.find((item) => item.id === id);
  if (!doc) return false;
  const client = state.clients.find((item) => item.id === doc.clientId) ?? null;
  const key = `${PRINT_PREFIX}${id}`;
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const existing = localStorage.key(index);
      if (existing?.startsWith(PRINT_PREFIX) && existing !== key) localStorage.removeItem(existing);
    }
    localStorage.setItem(key, JSON.stringify({ doc, company: state.company, client }));
    return true;
  } catch {
    return false;
  }
}

async function open(id: string) {
  if (!stagePrint(id)) {
    const state = useAtelier.getState();
    await saveAtelier({ data: { company: state.company, clients: state.clients, docs: state.docs, seq: state.seq } });
  }
  window.open(`/imprimer/${id}`, "_blank", "noopener");
}

export function printNamed(number: string) {
  const previous = document.title;
  const name = number.replace(/\.pdf$/i, "").trim();
  if (name) document.title = name;
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

function proofOf(raw: string) {
  const facts = readSign(raw);
  return [facts.atLabel, facts.email, facts.place, facts.ip ? `IP ${facts.ip}` : "", facts.browser].filter(Boolean).join(" · ");
}

export function readSign(raw: string, name = "", at = "") {
  let meta: { name?: string; role?: string; company?: string; email?: string; ip?: string; place?: string; ua?: string; at?: string } = {};
  try {
    meta = raw ? (JSON.parse(raw) as typeof meta) : {};
  } catch {
    meta = {};
  }
  const ua = meta.ua || "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  const when = meta.at || at;
  const date = when ? new Date(when) : null;
  const atLabel = date && !Number.isNaN(date.getTime())
    ? date.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Paris" })
    : when;
  return {
    name: meta.name || String(name ?? "").split(",")[0]?.trim() || String(name ?? ""),
    role: meta.role || "",
    company: meta.company && meta.company !== (meta.name || name) ? meta.company : "",
    email: meta.email || "",
    at: when,
    atLabel,
    ip: meta.ip || "",
    place: meta.place || "",
    browser: [browser, os].filter(Boolean).join(" · "),
    ua,
  };
}

export function signRows(quote: { signMeta: string; signerName: string; signedAt: string; lang?: string }) {
  const en = quote.lang === "en";
  const facts = readSign(quote.signMeta, quote.signerName, quote.signedAt);
  return [
    { label: en ? "Signed on" : "Signé le", value: facts.atLabel },
    { label: en ? "Signer" : "Signataire", value: facts.name },
    { label: en ? "Role" : "Fonction", value: facts.role },
    { label: en ? "Company" : "Société", value: facts.company },
    { label: "Email", value: facts.email },
    { label: en ? "IP address" : "Adresse IP", value: facts.ip },
    { label: en ? "Connection" : "Lieu de connexion", value: facts.place },
    { label: en ? "Browser" : "Navigateur", value: facts.browser },
    { label: en ? "Device" : "Appareil", value: facts.ua, wide: true },
  ].filter((row) => row.value);
}

export function devisFromOps(quote: OpsQuote): Devis {
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  const clientId = quote.clientUserId || "";
  const en = quote.lang === "en";
  const priced = pricedLines(quote.lines, quote.goodsBps);
  const lines = [
    ...priced.map((item, index) => {
      const imputed = item.kind === "freight" && (item.rateBps || 0) > 0;
      const note = imputed
        ? en
          ? `Included in the prices (${percent(item.rateBps || 0)}% of the order). Not added again to the total.`
          : `Imputé dans les prix (${percent(item.rateBps || 0)} % de la commande). Non ajouté une seconde fois au total.`
        : "";
      const row = line(
        item.id,
        item.kind === "goods" ? String.fromCharCode(65 + (index % 26)) : item.kind === "freight" ? "F" : item.kind === "fee" ? "X" : item.kind === "discount" ? "R" : "P",
        item.title || (item.kind === "freight" ? (en ? "Freight" : "Fret") : item.title),
        item.qty,
        item.kind === "discount" ? -Math.abs(item.unitCents) : item.unitCents,
        item.kind === "freight" || item.kind === "fee" || item.kind === "discount" ? "forfait" : "unité",
        [item.details || "", note].filter(Boolean).join("\n"),
        item.image || "",
        item.images || [],
      );
      if (imputed) row.omitFromTotal = true;
      return row;
    }),
    ...(math.goodsCommissionCents > 0
      ? [line("comm_goods", "C", en ? `Sourcing Pick commission — ${percent(quote.goodsBps)}% on the goods` : `Commission Sourcing Pick — ${percent(quote.goodsBps)} % sur la marchandise`, 1, math.goodsCommissionCents, "forfait")]
      : []),
    ...(math.freightCommissionCents > 0
      ? [line("comm_freight", "D", en ? `Sourcing Pick commission — ${percent(quote.freightBps)}% on the freight` : `Commission Sourcing Pick — ${percent(quote.freightBps)} % sur le fret`, 1, math.freightCommissionCents, "forfait")]
      : []),
  ];
  const company = useAtelier.getState().company;
  const facts = readSign(quote.signMeta, quote.signerName, quote.signedAt);
  const draft: Devis = {
    id: `ops_${quote.id}`,
    kind: "devis",
    number: quote.number,
    status: "emis",
    clientId,
    issueDate: quote.issuedOn,
    headline: quote.emailSubject,
    conditions: "",
    conditionsCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validityDays: quote.validityDays,
    leadTime: "",
    delivery: quote.incoterm,
    port: quote.port,
    commissionBps: 0,
    depositBps: quote.depositBps,
    lang: en ? "en" : "fr",
    font: quote.font || "onest",
    lines,
    ...(quote.signerName
      ? {
          signature: {
            name: facts.name || quote.signerName,
            at: facts.at || quote.signedAt,
            image: quote.signatureImage,
            proof: proofOf(quote.signMeta),
            email: facts.email,
            role: facts.role,
            company: facts.company,
            ip: facts.ip,
            place: facts.place,
            browser: facts.browser,
            ua: facts.ua,
          },
        }
      : {}),
  };
  draft.conditions = conditionsFor(draft, company);
  return draft;
}

export function syncInvoiceClient(invoice: OpsInvoice) {
  const clientId = invoice.clientUserId || "";
  const next = clientId.startsWith("usr_")
    ? {
        id: clientId,
        legalName: invoice.clientCompany || invoice.clientName || "Client",
        tradeName: invoice.clientName && invoice.clientCompany && invoice.clientName !== invoice.clientCompany ? invoice.clientName : "",
        address: invoice.clientAddress || "",
        vat: invoice.clientVat || "",
        siret: invoice.clientSiret || "",
        rcs: [invoice.clientSiren ? `SIREN ${invoice.clientSiren}` : "", invoice.clientNaf ? `NAF ${invoice.clientNaf}` : ""].filter(Boolean).join(" · "),
        siteNote: "",
        email: invoice.clientEmail || "",
      }
    : null;
  useAtelier.setState((state) => {
    const kept = state.clients.filter((client) => client.id.startsWith("usr_") && client.id !== clientId);
    if (!next) return kept.length === state.clients.length ? state : { clients: kept };
    return { clients: [...kept, next] };
  });
}

export function stageClient(clientId: string, legalName: string, siteNote: string) {
  const existing = useAtelier.getState().clients.find((client) => client.id === clientId);
  if (existing?.legalName === legalName) return;
  rememberClient(clientId, legalName, siteNote);
}

export function factureFromOps(invoice: OpsInvoice): Facture {
  const clientId = invoice.clientUserId || "";
  const company = useAtelier.getState().company;
  const source = invoice.lines.length
    ? pricedLines(invoice.lines)
    : [{ id: "ln_acompte", kind: "service" as const, title: "Acompte à la commande", details: "", qty: 1, unitCents: invoice.amountCents }];
  const acompte = source.length === 1 && /acompte/i.test(source[0].title);
  const draft: Facture = {
    id: `ops_${invoice.id}`,
    kind: "facture",
    number: invoice.number,
    status: invoice.status === "Payée" ? "payee" : "emis",
    clientId,
    issueDate: invoice.receivedOn || new Date().toISOString().slice(0, 10),
    headline: acompte ? `Facture d’acompte ${invoice.orderRef}` : `Facture ${invoice.orderRef}`.trim(),
    conditions: "",
    conditionsCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: acompte ? "acompte" : "integrale",
    sourceDevisId: null,
    dueLabel: invoice.lang === "en" ? "On receipt" : "À réception",
    commissionBps: 0,
    depositBps: 0,
    order: null,
    lines: source.map((item, index) => {
      const row = line(
        item.id,
        String.fromCharCode(65 + (index % 26)),
        item.title || (invoice.lang === "en" ? "Description" : "Désignation"),
        item.qty,
        item.kind === "discount" ? -Math.abs(item.unitCents) : item.unitCents,
        item.kind === "freight" || item.kind === "fee" || item.kind === "discount" ? "forfait" : "unité",
        item.details || "",
        item.image || "",
        item.images || [],
      );
      if (item.kind === "freight" && (item.rateBps || 0) > 0) row.omitFromTotal = true;
      return row;
    }),
    paidOn: invoice.receivedOn,
    paidMethod: invoice.method,
    paidCents: invoice.receivedCents,
    feesCents: invoice.feesCents,
    lang: invoice.lang === "en" ? "en" : "fr",
  };
  draft.conditions = conditionsFor(draft, company);
  return draft;
}

export function avoirFromOps(input: {
  number: string;
  clientName: string;
  amountCents: number;
  sourceNumber: string;
  reason?: string;
  issuedOn?: string;
  clientId?: string;
  lines?: Array<{ id: string; title: string; details?: string; qty: number; unitCents: number; kind?: string }>;
}): Avoir {
  const clientId = input.clientId?.startsWith("usr_") ? input.clientId : "";
  const company = useAtelier.getState().company;
  const source = input.lines?.length
    ? input.lines
    : [{ id: "ln_avoir", title: input.reason || `Avoir sur ${input.sourceNumber}`, details: "", qty: 1, unitCents: input.amountCents, kind: "service" }];
  const draft: Avoir = {
    id: `ops_${input.number}`,
    kind: "avoir",
    number: input.number,
    status: "emis",
    clientId,
    issueDate: input.issuedOn || new Date().toISOString().slice(0, 10),
    headline: `Avoir sur ${input.sourceNumber}`,
    conditions: "",
    conditionsCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceFactureId: null,
    sourceNumber: input.sourceNumber,
    sourceAmountCents: input.amountCents,
    reason: input.reason || "Avoir émis depuis l’administration.",
    lines: source.map((item, index) =>
      line(
        item.id || `ln_${index}`,
        String.fromCharCode(65 + (index % 26)),
        item.title || `Avoir sur ${input.sourceNumber}`,
        item.qty || 1,
        item.unitCents,
        item.kind === "freight" ? "forfait" : "unité",
        item.details || "",
      ),
    ),
  };
  draft.conditions = conditionsFor(draft, company);
  return draft;
}

export async function openOpsQuote(quote: OpsQuote) {
  let full = quote;
  if (!quote.signatureImage && !quote.lines.some((line) => line.image || line.images?.length)) {
    try {
      const { opsQuote } = await import("@/lib/ops.functions");
      const loaded = await opsQuote({ data: quote.id });
      if (loaded) full = loaded;
    } catch {
      /* le résumé suffit si le détail n’est pas lisible */
    }
  }
  const draft = devisFromOps(full);
  syncOpsClient(full);
  useAtelier.setState((state) => ({ docs: [draft, ...state.docs.filter((doc) => doc.id !== draft.id)] }));
  await open(draft.id);
}

export function syncOpsClient(quote: OpsQuote) {
  const clientId = quote.clientUserId || "";
  const company = quote.clientCompany || quote.clientName || "Client";
  const next = clientId.startsWith("usr_")
    ? {
        id: clientId,
        legalName: company,
        tradeName: quote.clientName && quote.clientCompany && quote.clientName !== quote.clientCompany ? quote.clientName : "",
        address: [quote.clientAddress, quote.clientCountry].filter(Boolean).join("\n"),
        vat: quote.clientVat || "",
        siret: quote.clientSiret || "",
        rcs: [quote.clientSiren ? `SIREN ${quote.clientSiren}` : "", quote.clientNaf ? `NAF ${quote.clientNaf}` : ""].filter(Boolean).join(" · "),
        siteNote: "",
        email: quote.clientEmail || "",
      }
    : null;
  useAtelier.setState((state) => {
    const kept = state.clients.filter((client) => client.id.startsWith("usr_") && client.id !== clientId);
    if (!next) return kept.length === state.clients.length ? state : { clients: kept };
    return { clients: [...kept, next] };
  });
}

export async function openOpsInvoice(invoice: OpsInvoice) {
  let full = invoice;
  if (!invoice.lines.some((line) => line.image || line.images?.length)) {
    try {
      const { opsInvoice } = await import("@/lib/ops.functions");
      full = await opsInvoice({ data: invoice.id });
    } catch {
      /* garder le résumé */
    }
  }
  const draft = factureFromOps(full);
  syncInvoiceClient(full);
  useAtelier.setState((state) => ({ docs: [draft, ...state.docs.filter((doc) => doc.id !== draft.id)] }));
  await open(draft.id);
}

export async function openOpsAvoir(input: {
  number: string;
  clientName: string;
  amountCents: number;
  sourceNumber: string;
  reason?: string;
  issuedOn?: string;
  clientId?: string;
  lines?: Array<{ id: string; title: string; details?: string; qty: number; unitCents: number; kind?: string }>;
}) {
  const draft = avoirFromOps(input);
  stageClient(draft.clientId, input.clientName, "");
  useAtelier.setState((state) => ({ docs: [draft, ...state.docs.filter((doc) => doc.id !== draft.id)] }));
  await open(draft.id);
}
