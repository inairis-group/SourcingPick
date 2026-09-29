import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/admin-auth.server";
import { listErrorLogs } from "@/lib/error-log.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { clientAddress, rateLimit } from "@/lib/guard.server";
import {
  addDocument,
  addMessage,
  assignOrder,
  setOrderTalk,
  clientCancelOrder,
  clientConsultQuote,
  clientDeclareTransfer,
  clientPostMessage,
  clientRefuseQuote,
  clientSignQuote,
  changeClientPassword,
  clientReadDocument,
  sendClientSignCode,
  createClientOrder,
  clientAttachOrder,
  createCreditNote,
  createBlankInvoice,
  createDepositInvoice,
  createManualOrder,
  createPortalUser,
  createQuote,
  createQuoteClient,
  deleteOrder,
  deleteQuote,
  deleteUser,
  getInvoice,
  getOrder,
  getQuote,
  inviteAgent,
  listDocuments,
  listEmails,
  listInbox,
  listInvoices,
  listJournal,
  listOrders,
  listOutbox,
  listQuotes,
  listQuoteClients,
  listUsers,
  loadClientPortal,
  markInvoicePaid,
  readDocumentFile,
  readSettings,
  sendInvoiceCopy,
  remindInvoice,
  resetUserPassword,
  saveClientProfile,
  saveEmail,
  saveQualification,
  saveQuote,
  setOrderState,
  setUserActive,
  updateInvoice,
  updateUser,
  verifyUser,
  writeSettings,
} from "@/lib/ops.server";
import { searchCompanies } from "@/lib/companies.server";
import { addCharge, armOpenReminders, billCharges, emitSeriesNow, listCharges, listSeries, runBillingCycle, saveSeries, setSeriesActive } from "@/lib/billing.server";
import { dueAnchor, isInternal, lineAmount, lineKind, packImages, pricedLines, STATE_TREE, stateOf, type OpsCharge, type OpsEmail, type OpsQuote, type OpsSeries, type OpsSettings, type OpsSupplier, type QuoteLine } from "@/lib/ops.shared";

async function actor() {
  assertSameSiteRequest();
  return requireUser();
}

async function staff() {
  const user = await actor();
  if (user.role === "client") throw new Error("Accès refusé.");
  return user;
}

async function admin() {
  const user = await staff();
  if (user.role !== "admin") throw new Error("Réservé à l’administration.");
  return user;
}

async function ownedQuote(id: string) {
  const user = await actor();
  const quote = await getQuote(id);
  if (!quote) return null;
  if (user.role !== "client") return quote;
  const portal = await loadClientPortal(user.id);
  if (!portal.quotes.some((item) => item.id === quote.id)) throw new Error("Accès refusé.");
  return quote;
}

async function ownedInvoice(id: string) {
  const user = await actor();
  const invoice = await getInvoice(id);
  if (!invoice) throw new Error("Facture introuvable.");
  if (user.role !== "client") return invoice;
  const portal = await loadClientPortal(user.id);
  if (!portal.invoices.some((item) => item.id === invoice.id)) throw new Error("Accès refusé.");
  return invoice;
}

export const opsDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  const [orders, settings, invoices, quotes, users] = await Promise.all([listOrders(), readSettings(), listInvoices(), listQuotes(), listUsers()]);
  const pipeline = new Map<string, number>();
  for (const order of orders) pipeline.set(order.state, (pipeline.get(order.state) ?? 0) + 1);
  const now = Date.now();
  const age = (iso: string) => (iso ? (now - new Date(iso).getTime()) / 86400000 : 0);
  const stamp = new Date();
  const monthOf = (offset: number) => {
    const date = new Date(stamp.getFullYear(), stamp.getMonth() + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  const inMonth = (iso: string, month: string) => (iso || "").startsWith(month);
  const collected = (month: string) =>
    invoices.reduce((sum, invoice) => {
      if (invoice.kind === "credit" || invoice.status !== "Payée") return sum;
      if (!inMonth(invoice.receivedOn || invoice.issuedOn, month)) return sum;
      const received = invoice.receivedCents != null && invoice.receivedCents > 0 ? invoice.receivedCents : invoice.amountCents;
      return sum + received;
    }, 0);
  const invoiced = (month: string) =>
    invoices.reduce((sum, invoice) => {
      if (!inMonth(invoice.issuedOn, month) || invoice.status === "Brouillon" || invoice.status === "Annulée") return sum;
      if (invoice.kind === "credit") return sum - Math.abs(invoice.amountCents);
      return sum + invoice.amountCents;
    }, 0);
  const agents = users
    .filter((user) => user.role === "agent" && user.active)
    .map((user) => ({ name: user.name, count: orders.filter((order) => order.agentName === user.name).length }))
    .sort((a, b) => b.count - a.count);
  return {
    settings,
    pipeline: STATE_TREE.map((group) => ({ state: group.state, count: pipeline.get(group.state) ?? 0 })),
    agents,
    waitingQuotes: quotes.filter((quote) => quote.status === "Devis envoyé").length,
    unpaidDeposits: invoices.filter((invoice) => invoice.kind !== "credit" && invoice.status !== "Payée" && invoice.status !== "Annulée" && invoice.status !== "Brouillon" && invoice.amountCents > 0).length,
    collectedMonth: collected(monthOf(0)),
    collectedPrev: collected(monthOf(-1)),
    invoicedMonth: invoiced(monthOf(0)),
    atSea: orders.filter((order) => order.state === "En transit").length,
    stale: [
      ...quotes.filter((quote) => quote.status === "Devis envoyé" && age(quote.issuedOn) > 7).map((quote) => ({ id: quote.id, kind: "devis" as const, label: `${quote.number} · ${quote.clientName || "Client"} · sans signature depuis plus de 7 jours` })),
      ...invoices.filter((invoice) => {
        if (invoice.kind === "credit" || invoice.status === "Payée" || invoice.status === "Annulée" || invoice.status === "Brouillon" || !invoice.amountCents) return false;
        const due = dueAnchor(invoice.dueOn, invoice.issuedOn);
        return Boolean(due) && age(due) > 3;
      }).map((invoice) => ({ id: invoice.id, kind: "facture" as const, label: `${invoice.number} · ${invoice.clientName || invoice.clientCompany || "Client"} · impayée depuis plus de 3 jours après l’échéance` })),
      ...orders.filter((order) => !["Terminé", "Annulé"].includes(order.state) && age(order.updatedAt) > 10).map((order) => ({ id: order.id, kind: "commande" as const, label: `${order.ref} · sans mise à jour depuis plus de 10 jours` })),
    ],
  };
});

export const opsOrders = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listOrders();
});

export const opsOrder = createServerFn({ method: "GET" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Commande manquante.");
    return clean;
  })
  .handler(async ({ data }) => {
    await staff();
    return getOrder(data);
  });

export const opsSetState = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; substate: string; comment: string }) => {
    const id = String(input?.id ?? "").trim();
    const substate = String(input?.substate ?? "").trim();
    if (!id || !substate) throw new Error("État incomplet.");
    return { id, substate, comment: String(input?.comment ?? "").slice(0, 500) };
  })
  .handler(async ({ data }) => {
    const user = await staff();
    await setOrderState(data.id, data.substate, stateOf(data.substate), isInternal(data.substate), user.name, data.comment, user.role);
    return { ok: true };
  });

export const opsSaveQualification = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; note: string; suppliers: OpsSupplier[] }) => {
    const id = String(input?.id ?? "").trim();
    if (!id) throw new Error("Demande manquante.");
    const suppliers = (input?.suppliers ?? []).slice(0, 20).map((row) => ({
      id: String(row.id ?? ""),
      orderId: id,
      name: String(row.name ?? "").slice(0, 160),
      price: String(row.price ?? "").slice(0, 40),
      qty: String(row.qty ?? "").slice(0, 40),
      lead: String(row.lead ?? "").slice(0, 40),
      status: String(row.status ?? "Comparé").slice(0, 40),
    }));
    return { id, note: String(input?.note ?? "").slice(0, 2000), suppliers };
  })
  .handler(async ({ data }) => {
    const user = await staff();
    await saveQualification(data.id, data.note, data.suppliers, user.name);
    return { ok: true };
  });

export const opsAddMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; body: string; internalOnly: boolean }) => {
    const orderId = String(input?.orderId ?? "").trim();
    const body = String(input?.body ?? "").trim().slice(0, 4000);
    if (!orderId || body.length < 1) throw new Error("Message vide.");
    return { orderId, body, internalOnly: Boolean(input?.internalOnly) };
  })
  .handler(async ({ data }) => {
    const user = await staff();
    return addMessage(data.orderId, user.name, data.body, data.internalOnly, user.role);
  });

export const opsInbox = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listInbox();
});

export const opsClaim = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Dossier manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await assignOrder(data, user.name, user.name);
    return { ok: true };
  });

export const opsAssign = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; agentName: string }) => {
    const id = String(input?.id ?? "").trim();
    if (!id) throw new Error("Dossier manquant.");
    return { id, agentName: String(input?.agentName ?? "").trim().slice(0, 80) };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await assignOrder(data.id, data.agentName, user.name);
    return { ok: true };
  });

export const opsOrderTalk = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; allowed: boolean }) => {
    const id = String(input?.id ?? "").trim();
    if (!id) throw new Error("Dossier manquant.");
    return { id, allowed: Boolean(input?.allowed) };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await setOrderTalk(data.id, data.allowed, user.name);
    return { ok: true };
  });

export const opsCatalog = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  const { listCatalog } = await import("@/lib/ops.server");
  return listCatalog();
});

export const opsQuotes = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listQuotes();
});

export const opsDeleteQuote = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Devis manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await deleteQuote(data, user.name);
    return { ok: true };
  });

export const opsDeleteOrder = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Commande manquante.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await deleteOrder(data, user.name);
    return { ok: true };
  });

export const opsQuote = createServerFn({ method: "GET" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Devis manquant.");
    return clean;
  })
  .handler(async ({ data }) => ownedQuote(data));

export const opsCreateInvoice = createServerFn({ method: "POST" }).handler(async () => {
  const user = await admin();
  return createBlankInvoice(user.name);
});

export const opsSaveInvoice = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; clientName: string; orderRef: string; amountCents: number; number?: string; clientUserId?: string; clientEmail?: string; clientCompany?: string; clientAddress?: string; clientVat?: string; clientSiren?: string; clientSiret?: string; clientNaf?: string; lines?: QuoteLine[]; dueOn?: string; remindersOn?: boolean; lang?: string }) => ({
    id: String(input?.id ?? ""),
    number: String(input?.number ?? "").trim().slice(0, 40),
    clientName: String(input?.clientName ?? "").slice(0, 160),
    orderRef: String(input?.orderRef ?? "").slice(0, 40),
    amountCents: Math.round(Number(input?.amountCents) || 0),
    clientUserId: String(input?.clientUserId ?? "").slice(0, 40),
    clientEmail: String(input?.clientEmail ?? "").trim().toLowerCase().slice(0, 160),
    clientCompany: String(input?.clientCompany ?? "").slice(0, 160),
    clientAddress: String(input?.clientAddress ?? "").slice(0, 300),
    clientVat: String(input?.clientVat ?? "").slice(0, 40),
    clientSiren: String(input?.clientSiren ?? "").replace(/\s/g, "").slice(0, 9),
    clientSiret: String(input?.clientSiret ?? "").replace(/\s/g, "").slice(0, 14),
    clientNaf: String(input?.clientNaf ?? "").slice(0, 12),
    dueOn: input?.dueOn == null ? undefined : String(input.dueOn).slice(0, 10),
    remindersOn: input?.remindersOn == null ? undefined : Boolean(input.remindersOn),
    lang: input?.lang === "en" ? "en" : "fr",
    lines: pricedLines((input?.lines ?? []).slice(0, 40).map((line) => ({
      id: String(line.id || crypto.randomUUID()),
      kind: lineKind(line.kind),
      title: String(line.title ?? "").slice(0, 180),
      details: String(line.details ?? "").slice(0, 8000),
      qty: Number.isFinite(Number(line.qty)) ? Number(line.qty) : 0,
      unitCents: Math.round(Number(line.unitCents) || 0),
      rateBps: Math.max(0, Math.round(Number(line.rateBps) || 0)),
      ...packImages(line),
    })) as QuoteLine[], 0),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    if (!data.id) throw new Error("Facture manquante.");
    const amountCents = data.lines.length ? data.lines.reduce((total, line) => total + (line.kind === "freight" && line.rateBps > 0 ? 0 : lineAmount(line)), 0) : data.amountCents;
    await updateInvoice(data.id, { ...data, amountCents }, user.name);
    return { ok: true };
  });

export const opsCreateQuote = createServerFn({ method: "POST" }).handler(async () => {
  const user = await admin();
  return createQuote(user.name);
});

export const opsSaveQuote = createServerFn({ method: "POST" })
  .inputValidator((quote: OpsQuote) => {
    if (!quote?.id) throw new Error("Devis manquant.");
    return {
      ...quote,
      clientName: String(quote.clientName ?? "").slice(0, 160),
      clientEmail: String(quote.clientEmail ?? "").trim().toLowerCase().slice(0, 160),
      clientUserId: String(quote.clientUserId ?? "").slice(0, 40),
      clientCompany: String(quote.clientCompany ?? "").slice(0, 160),
      clientAddress: String(quote.clientAddress ?? "").slice(0, 300),
      clientVat: String(quote.clientVat ?? "").slice(0, 40),
      clientCountry: String(quote.clientCountry ?? "").slice(0, 80),
      clientSiren: String(quote.clientSiren ?? "").replace(/\s/g, "").slice(0, 9),
      clientSiret: String(quote.clientSiret ?? "").replace(/\s/g, "").slice(0, 14),
      clientNaf: String(quote.clientNaf ?? "").slice(0, 12),
      orderRef: String(quote.orderRef ?? "").slice(0, 40),
      validityDays: Math.max(0, Math.round(Number(quote.validityDays) || 0)),
      goodsBps: Math.max(0, Math.round(Number(quote.goodsBps) || 0)),
      freightBps: Math.max(0, Math.round(Number(quote.freightBps) || 0)),
      depositBps: Math.max(0, Math.round(Number(quote.depositBps) || 0)),
      lines: (quote.lines ?? []).slice(0, 40).map((line) => ({
        id: String(line.id || crypto.randomUUID()),
        kind: lineKind(line.kind),
        title: String(line.title ?? "").slice(0, 180),
        details: String(line.details ?? "").slice(0, 8000),
        qty: Number(line.qty) || 0,
        unitCents: Math.round(Number(line.unitCents) || 0),
        rateBps: Math.max(0, Math.round(Number(line.rateBps) || 0)),
        ...packImages(line),
      })),
    } as OpsQuote;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    return saveQuote(data, user.name);
  });

export const opsClients = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listQuoteClients();
});

export const opsSearchCompanies = createServerFn({ method: "POST" })
  .inputValidator((query: string) => {
    const clean = String(query ?? "").trim().slice(0, 80);
    if (clean.length < 2) throw new Error("Saisissez au moins 2 caractères.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await staff();
    rateLimit(`inpi:${user.id}:${clientAddress()}`, 30, 60 * 1000);
    return searchCompanies(data);
  });

export const opsCreateQuoteClient = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; company: string; address: string; vat: string; country: string; siren?: string; siret?: string; naf?: string; kind?: string }) => ({
    name: String(input?.name ?? "").trim().slice(0, 160),
    email: String(input?.email ?? "").trim().toLowerCase().slice(0, 160),
    company: String(input?.company ?? "").trim().slice(0, 160),
    address: String(input?.address ?? "").trim().slice(0, 300),
    vat: String(input?.vat ?? "").trim().slice(0, 40),
    country: String(input?.country ?? "").trim().slice(0, 80),
    siren: String(input?.siren ?? "").replace(/\s/g, "").slice(0, 9),
    siret: String(input?.siret ?? "").replace(/\s/g, "").slice(0, 14),
    naf: String(input?.naf ?? "").slice(0, 12),
    kind: input?.kind === "particulier" ? "particulier" : "pro",
  }))
  .handler(async ({ data }) => {
    const user = await staff();
    return createQuoteClient(data, user.name);
  });

export const opsSendQuote = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; email: string; message: string }) => {
    const id = String(input?.id ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const message = String(input?.message ?? "").slice(0, 4000);
    if (!id) throw new Error("Devis manquant.");
    if (!email.includes("@")) throw new Error("Indiquez l’email du client.");
    if (message.trim().length < 2) throw new Error("Écrivez le message qui accompagnera le devis.");
    return { id, email, message };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    const { dispatchQuote } = await import("@/lib/quote-link.server");
    return dispatchQuote(data.id, user.name, data.email, data.message);
  });

export const opsDepositInvoice = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => {
    const user = await admin();
    return createDepositInvoice(data, user.name);
  });

export const opsQuoteBill = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; mode: string }) => {
    const id = String(input?.id ?? "").trim();
    const raw = input?.mode;
    const mode: "deposit" | "balance" | "full" = raw === "balance" || raw === "full" ? raw : "deposit";
    if (!id) throw new Error("Devis manquant.");
    return { id, mode };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    const { createQuoteBill } = await import("@/lib/ops.server");
    return createQuoteBill(data.id, user.name, data.mode);
  });

export const opsInvoices = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listInvoices();
});

export const opsInvoice = createServerFn({ method: "GET" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => ownedInvoice(data));

export const opsMarkPaid = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; method: string; receivedOn: string; receivedCents: number; feesCents: number }) => ({
    id: String(input?.id ?? ""),
    method: String(input?.method ?? "Virement").slice(0, 40),
    receivedOn: String(input?.receivedOn ?? "").slice(0, 20),
    receivedCents: Math.round(Number(input?.receivedCents) || 0),
    feesCents: Math.round(Number(input?.feesCents) || 0),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    await markInvoicePaid(data.id, data.method, data.receivedOn, data.receivedCents, data.feesCents, user.name);
    return { ok: true };
  });

export const opsDocuments = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listDocuments();
});

export const opsAddDocument = createServerFn({ method: "POST" })
  .inputValidator((input: { clientName: string; category: string; title: string; orderRef: string; fileName?: string; mime?: string; fileBase64?: string }) => {
    const fileBase64 = String(input?.fileBase64 ?? "");
    if (fileBase64.length > 12_000_000) throw new Error("Fichier trop lourd (8 Mo max).");
    return {
      clientName: String(input?.clientName ?? "").slice(0, 160),
      category: String(input?.category ?? "Photos et vidéos").slice(0, 80),
      title: String(input?.title ?? "").slice(0, 180),
      orderRef: String(input?.orderRef ?? "").slice(0, 40),
      issuedOn: new Date().toISOString().slice(0, 10),
      fileName: String(input?.fileName ?? "").slice(0, 180),
      mime: String(input?.mime ?? "").slice(0, 120),
      fileBase64,
    };
  })
  .handler(async ({ data }) => {
    const user = await staff();
    if (data.title.length < 2 && data.fileName.length < 2) throw new Error("Nommez le document.");
    const title = data.title || data.fileName;
    return addDocument({ ...data, title }, user.name);
  });

export const opsDocumentFile = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Document manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    await staff();
    return readDocumentFile(data);
  });

export const opsSendDocumentSign = createServerFn({ method: "POST" })
  .inputValidator((input: { documentId: string; email: string; message: string }) => {
    const documentId = String(input?.documentId ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const message = String(input?.message ?? "").trim().slice(0, 2000);
    if (!/^doc_[a-z0-9]+$/i.test(documentId)) throw new Error("Document invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email du signataire.");
    if (message.length < 2) throw new Error("Écrivez le message qui accompagne le document.");
    return { documentId, email, message };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    const { sendDocumentToSign } = await import("@/lib/doc-sign.server");
    return sendDocumentToSign({ ...data, actor: user.name });
  });

export const opsContract = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!/^doc_[a-z0-9]+$/i.test(clean)) throw new Error("Contrat invalide.");
    return clean;
  })
  .handler(async ({ data }) => {
    await admin();
    const { readContract } = await import("@/lib/doc-sign.server");
    return readContract(data);
  });

export const opsSaveContract = createServerFn({ method: "POST" })
  .inputValidator((input: { id?: string; clientName: string; title: string; body: string }) => {
    const id = String(input?.id ?? "").trim();
    if (id && !/^doc_[a-z0-9]+$/i.test(id)) throw new Error("Contrat invalide.");
    const clientName = String(input?.clientName ?? "").trim().slice(0, 160);
    const title = String(input?.title ?? "").trim().slice(0, 180);
    const body = String(input?.body ?? "").slice(0, 200_000);
    if (title.length < 2) throw new Error("Nommez le contrat.");
    if (clientName.length < 2) throw new Error("Choisissez le client.");
    if (body.trim().length < 20) throw new Error("Le contrat est trop court.");
    return { id, clientName, title, body };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    const { saveContract } = await import("@/lib/doc-sign.server");
    return saveContract({ ...data, actor: user.name });
  });

export const publicDocumentCode = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le document.");
    return { token, email };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`doc-code:${clientAddress()}:${data.email}`, 5, 10 * 60 * 1000);
    const { requestDocumentCode } = await import("@/lib/doc-sign.server");
    return requestDocumentCode(data.token, data.email);
  });

export const publicDocumentOpen = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string; code: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const code = String(input?.code ?? "").replace(/\D/g, "").slice(0, 6);
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le document.");
    if (code.length !== 6) throw new Error("Indiquez le code à 6 chiffres.");
    return { token, email, code };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`doc-open:${clientAddress()}`, 12, 10 * 60 * 1000);
    const { openDocumentToSign } = await import("@/lib/doc-sign.server");
    return openDocumentToSign(data.token, data.email, data.code);
  });

export const publicDocumentSign = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string; code: string; name: string; role: string; company: string; image: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const code = String(input?.code ?? "").replace(/\D/g, "").slice(0, 6);
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const role = String(input?.role ?? "").trim().slice(0, 80);
    const company = String(input?.company ?? "").trim().slice(0, 160);
    const image = String(input?.image ?? "");
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le document.");
    if (code.length !== 6) throw new Error("Indiquez le code à 6 chiffres.");
    if (name.length < 2) throw new Error("Indiquez le nom du signataire.");
    if (!image.startsWith("data:image/png;base64,") || image.length > 180000) throw new Error("Signez dans le cadre.");
    return { token, email, code, name, role, company, image };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`doc-sign:${clientAddress()}`, 8, 10 * 60 * 1000);
    const { signDocument } = await import("@/lib/doc-sign.server");
    return signDocument({ ...data, ip: clientAddress() });
  });

export const opsEmails = createServerFn({ method: "GET" }).handler(async () => {
  const user = await staff();
  const { mailStatus } = await import("@/lib/mail.server");
  const [templates, outbox] = await Promise.all([listEmails(), listOutbox()]);
  if (user.role !== "admin") return { templates, outbox: [], mail: { ready: false, from: "" } };
  return { templates, outbox, mail: mailStatus() };
});

export const opsCreateOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { clientName: string; product: string; note?: string; agentName?: string }) => {
    const clientName = String(input?.clientName ?? "").trim().slice(0, 160);
    const product = String(input?.product ?? "").trim().slice(0, 180);
    if (!clientName || !product) throw new Error("Indiquez le client et ce qu’il commande.");
    return {
      clientName,
      product,
      note: String(input?.note ?? "").slice(0, 500),
      agentName: String(input?.agentName ?? "").slice(0, 80),
    };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    return createManualOrder(data, user.name);
  });

export const opsSendInvoice = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; message?: string; to?: string; subject?: string }) => {
    const id = String(input?.id ?? "").trim();
    if (!id) throw new Error("Facture manquante.");
    return {
      id,
      message: String(input?.message ?? "").slice(0, 8000),
      to: String(input?.to ?? "").slice(0, 400),
      subject: String(input?.subject ?? "").slice(0, 180),
    };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    return sendInvoiceCopy(data.id, user.name, data.message, data.to, data.subject);
  });

export const opsSendMail = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; text: string }) => {
    const to = String(input?.to ?? "").trim().toLowerCase().slice(0, 160);
    const subject = String(input?.subject ?? "").trim().slice(0, 180);
    const text = String(input?.text ?? "").slice(0, 8000);
    if (!to.includes("@")) throw new Error("Indiquez l’email du client.");
    if (subject.length < 2 || text.trim().length < 2) throw new Error("Le message est vide.");
    return { to, subject, text };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    rateLimit(`mail:${user.id}`, 40, 60 * 60 * 1000);
    const { deliverMail, mailError } = await import("@/lib/mail.server");
    const sent = await deliverMail(data.to, data.subject, data.text, {
      ctaLabel: data.subject.toLowerCase().includes("facture") ? "Ouvrir mes factures" : "Ouvrir mon espace",
      ctaHref: data.subject.toLowerCase().includes("facture")
        ? "https://sourcingpick.com/espace/facturation"
        : "https://sourcingpick.com/espace",
    });
    const sql = await (await import("@/lib/db")).getSql();
    await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
      values (${`mail_${crypto.randomUUID().slice(0, 8)}`}, ${""}, ${data.to}, ${data.subject}, ${data.text}, ${sent})`;
    if (!sent) throw new Error(mailError() || "L’email n’est pas parti.");
    void user;
    return { email: data.to };
  });

export const opsSendTest = createServerFn({ method: "POST" })
  .inputValidator((to: string) => {
    const email = String(to ?? "").trim().toLowerCase().slice(0, 160);
    if (!email.includes("@")) throw new Error("Indiquez un email.");
    return email;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    const { deliverMail, mailError, mailStatus } = await import("@/lib/mail.server");
    const { sampleTestMail } = await import("@/lib/mail-letter");
    const status = mailStatus();
    if (!status.ready) throw new Error("La messagerie n’est pas configurée sur le serveur.");
    const sent = await deliverMail(data, "Votre devis est prêt — essai SourcingPick", sampleTestMail(user.name));
    if (!sent) throw new Error(mailError() || "L’envoi a été refusé par le serveur mail.");
    return { ok: true };
  });

export const opsSaveEmail = createServerFn({ method: "POST" })
  .inputValidator((email: OpsEmail) => email)
  .handler(async ({ data }) => {
    const user = await admin();
    await saveEmail(data, user.name);
    return { ok: true };
  });

export const opsJournal = createServerFn({ method: "GET" }).handler(async () => {
  await staff();
  return listJournal();
});

export const opsLogs = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return listErrorLogs();
});

export const opsSettings = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return readSettings();
});

export const opsSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((settings: OpsSettings) => settings)
  .handler(async ({ data }) => {
    const user = await admin();
    await writeSettings(data, user.name);
    return { ok: true };
  });

export const opsUsers = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return listUsers();
});

export const opsInvite = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string }) => {
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    if (name.length < 2 || !email.includes("@")) throw new Error("Nom et email requis.");
    return { name, email };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    return inviteAgent(data.name, data.email, user.name);
  });

export const opsSuspend = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; active: boolean }) => ({
    id: String(input?.id ?? ""),
    active: Boolean(input?.active),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    await setUserActive(data.id, data.active, user.name);
    return { ok: true };
  });

export const opsVerify = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => {
    const user = await admin();
    await verifyUser(data, user.name);
    return { ok: true };
  });

export const opsResetPassword = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => {
    const user = await admin();
    return resetUserPassword(data, user.name);
  });

export const opsUpdateUser = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; name: string; company: string; password?: string }) => {
    const id = String(input?.id ?? "").trim();
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const password = String(input?.password ?? "");
    if (!id || name.length < 2) throw new Error("Nom requis.");
    if (password && password.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");
    return { id, name, company: String(input?.company ?? "").trim().slice(0, 160), password };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await updateUser(data.id, data.name, data.company, user.name, data.password);
    return { ok: true };
  });

export const opsDeleteUser = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Utilisateur manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await admin();
    await deleteUser(data, user.id, user.name);
    return { ok: true };
  });

export const opsNudge = createServerFn({ method: "POST" })
  .inputValidator((input: { kind: string; id: string }) => {
    const kind = input?.kind === "facture" || input?.kind === "commande" ? input.kind : "devis";
    const id = String(input?.id ?? "").trim();
    if (!id) throw new Error("Dossier manquant.");
    return { kind, id };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    if (data.kind === "facture") {
      if (user.role !== "admin") throw new Error("Réservé à l’administration.");
      await remindInvoice(data.id, user.name);
      return { sent: true };
    }
    if (data.kind === "devis") {
      const quote = await getQuote(data.id);
      if (!quote) throw new Error("Devis introuvable.");
      if (!quote.clientEmail.includes("@")) throw new Error("Ce devis n’a pas d’email client.");
      const { dispatchQuote } = await import("@/lib/quote-link.server");
      const result = await dispatchQuote(
        data.id,
        user.name,
        quote.clientEmail,
        `Bonjour,\n\nNous revenons vers vous : le devis ${quote.number} attend toujours votre signature.\n\nL’équipe SourcingPick`,
      );
      if (!result.sent) throw new Error("L’email n’est pas parti.");
      return { sent: true };
    }
    const pack = await getOrder(data.id);
    if (!pack) throw new Error("Commande introuvable.");
    const result = await addMessage(pack.order.id, user.name, `Bonjour, nous n’avons pas eu de nouvelle sur ${pack.order.ref} (${pack.order.product}). Dites-nous où vous en êtes.`, false, user.role);
    if (!result.emailed) throw new Error("Le message est dans le dossier, mais aucun email client n’est lié à cette commande.");
    return { sent: true };
  });

export const opsCreateUser = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; role: string; password: string }) => {
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const password = String(input?.password ?? "");
    if (name.length < 2) throw new Error("Indiquez un nom.");
    if (!email.includes("@")) throw new Error("Email invalide.");
    if (password.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");
    const role = input?.role === "admin" || input?.role === "client" ? input.role : "agent";
    return { name, email, role, password };
  })
  .handler(async ({ data }) => {
    const user = await admin();
    return createPortalUser(data.name, data.email, data.role, data.password, user.name);
  });

export const opsRemind = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => {
    const user = await admin();
    await remindInvoice(data, user.name);
    return { ok: true };
  });

export const opsCredit = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? ""))
  .handler(async ({ data }) => {
    const user = await admin();
    return createCreditNote(data, user.name);
  });

function partyFrom(input: {
  clientUserId?: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  clientAddress?: string;
  clientVat?: string;
  orderRef?: string;
}) {
  return {
    clientUserId: String(input.clientUserId ?? "").slice(0, 40),
    clientName: String(input.clientName ?? "").slice(0, 160),
    clientEmail: String(input.clientEmail ?? "").trim().toLowerCase().slice(0, 160),
    clientCompany: String(input.clientCompany ?? "").slice(0, 160),
    clientAddress: String(input.clientAddress ?? "").slice(0, 300),
    clientVat: String(input.clientVat ?? "").slice(0, 40),
    orderRef: String(input.orderRef ?? "").slice(0, 40),
  };
}

function linesFrom(lines: QuoteLine[] | undefined) {
  return (lines ?? []).slice(0, 40).map((line) => ({
    id: String(line.id || crypto.randomUUID()),
    kind: lineKind(line.kind),
    title: String(line.title ?? "").slice(0, 180),
    details: String(line.details ?? "").slice(0, 8000),
    qty: Number.isFinite(Number(line.qty)) ? Number(line.qty) : 0,
    unitCents: Math.round(Number(line.unitCents) || 0),
    rateBps: Math.max(0, Math.round(Number(line.rateBps) || 0)),
    ...packImages(line),
  })) as QuoteLine[];
}

export const opsSeries = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return listSeries();
});

export const opsSaveSeries = createServerFn({ method: "POST" })
  .inputValidator((input: Partial<OpsSeries>) => ({
    id: String(input?.id ?? "").slice(0, 40),
    label: String(input?.label ?? "").slice(0, 160),
    ...partyFrom(input),
    lines: linesFrom(input?.lines),
    cadence: input?.cadence === "quarter" || input?.cadence === "year" ? input.cadence : "month",
    nextOn: String(input?.nextOn ?? "").slice(0, 10),
    endOn: String(input?.endOn ?? "").slice(0, 10),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    const cadence = data.cadence === "quarter" || data.cadence === "year" ? data.cadence : "month";
    return saveSeries({ ...data, cadence }, user.name);
  });

export const opsToggleSeries = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; active: boolean }) => ({
    id: String(input?.id ?? "").trim(),
    active: Boolean(input?.active),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    if (!data.id) throw new Error("Récurrence manquante.");
    await setSeriesActive(data.id, data.active, user.name);
    return { ok: true };
  });

export const opsEmitSeries = createServerFn({ method: "POST" })
  .inputValidator((id: string) => String(id ?? "").trim())
  .handler(async ({ data }) => {
    const user = await admin();
    if (!data) throw new Error("Récurrence manquante.");
    return emitSeriesNow(data, user.name);
  });

export const opsCharges = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return listCharges();
});

export const opsAddCharge = createServerFn({ method: "POST" })
  .inputValidator((input: Partial<OpsCharge>) => ({
    supplier: String(input?.supplier ?? "").slice(0, 160),
    nature: String(input?.nature ?? "").slice(0, 80),
    description: String(input?.description ?? "").slice(0, 500),
    costCents: Math.round(Number(input?.costCents) || 0),
    markupBps: Math.round(Number(input?.markupBps) || 0),
    ...partyFrom(input),
    incurredOn: String(input?.incurredOn ?? "").slice(0, 10),
  }))
  .handler(async ({ data }) => {
    const user = await admin();
    return addCharge(data, user.name);
  });

export const opsBillCharges = createServerFn({ method: "POST" })
  .inputValidator((ids: string[]) => (Array.isArray(ids) ? ids : []).map((id) => String(id)).slice(0, 40))
  .handler(async ({ data }) => {
    const user = await admin();
    return billCharges(data, user.name);
  });

export const opsRunBilling = createServerFn({ method: "POST" }).handler(async () => {
  const user = await admin();
  return runBillingCycle(user.name);
});

export const opsArmReminders = createServerFn({ method: "POST" }).handler(async () => {
  const user = await admin();
  return armOpenReminders(user.name);
});

async function asClient() {
  const user = await actor();
  if (user.role !== "client") throw new Error("Accès réservé à l’espace client.");
  return user;
}

export const clientPortal = createServerFn({ method: "GET" }).handler(async () => {
  const user = await asClient();
  return loadClientPortal(user.id);
});

export const clientCreate = createServerFn({ method: "POST" })
  .inputValidator((input: {
    need: string;
    product: string;
    qty: string;
    volume: string;
    value: string;
    suppliers: string;
    cities: string;
    country: string;
    port: string;
    address?: string;
    date: string;
    phone?: string;
    products?: Array<{ name: string; qty: string; note: string; compare?: string; target?: string }>;
    files?: Array<{ name: string; mime: string; data: string }>;
  }) => {
    const products = (input?.products ?? [])
      .slice(0, 12)
      .map((row) => ({
        name: String(row?.name ?? "").trim().slice(0, 160),
        qty: String(row?.qty ?? "").trim().slice(0, 60),
        note: String(row?.note ?? "").trim().slice(0, 240),
        compare: String(row?.compare ?? "").trim().slice(0, 500),
        target: String(row?.target ?? "").trim().slice(0, 40),
      }))
      .filter((row) => row.name.length > 1);
    const files = (input?.files ?? []).slice(0, 40).map((file) => ({
      name: String(file?.name ?? "").slice(0, 180),
      mime: String(file?.mime ?? "").slice(0, 120),
      data: String(file?.data ?? ""),
    })).filter((file) => file.name && file.data.length > 20 && file.data.length < 1_900_000);
    return {
      need: String(input?.need ?? "").slice(0, 80),
      product: String(input?.product ?? "").trim().slice(0, 400),
      qty: String(input?.qty ?? "").slice(0, 200),
      volume: String(input?.volume ?? "").slice(0, 80),
      value: String(input?.value ?? "").slice(0, 40),
      suppliers: String(input?.suppliers ?? "").slice(0, 20),
      cities: String(input?.cities ?? "").slice(0, 160),
      country: String(input?.country ?? "").slice(0, 80),
      port: String(input?.port ?? "").slice(0, 120),
      address: String(input?.address ?? "").slice(0, 240),
      date: String(input?.date ?? "").slice(0, 40),
      phone: String(input?.phone ?? "").trim().slice(0, 40),
      products,
      files,
    };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    if (!data.products.length && data.product.length < 2) throw new Error("Indiquez au moins un produit.");
    return createClientOrder(user.id, data);
  });

export const clientAttach = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; name: string; mime: string; data: string }) => {
    const orderId = String(input?.orderId ?? "").trim();
    const name = String(input?.name ?? "").trim().slice(0, 180);
    const mime = String(input?.mime ?? "").slice(0, 120);
    const data = String(input?.data ?? "");
    if (!orderId || name.length < 1 || data.length < 20 || data.length > 1_900_000) throw new Error("Fichier refusé.");
    return { orderId, name, mime, data };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    rateLimit(`files:${user.id}`, 120, 60 * 60 * 1000);
    return clientAttachOrder(user.id, data.orderId, data);
  });

export const clientReply = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; body: string }) => {
    const orderId = String(input?.orderId ?? "").trim();
    const body = String(input?.body ?? "").trim().slice(0, 4000);
    if (!orderId || body.length < 1) throw new Error("Message vide.");
    return { orderId, body };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientPostMessage(user.id, data.orderId, data.body);
  });

export const clientSign = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; signer: string; image?: string; code?: string }) => {
    const id = String(input?.id ?? "").trim();
    const signer = String(input?.signer ?? "").trim().slice(0, 120);
    const image = String(input?.image ?? "");
    const code = String(input?.code ?? "").replace(/\D/g, "").slice(0, 6);
    if (!id || signer.length < 2) throw new Error("Indiquez le nom du signataire.");
    if (image && (!image.startsWith("data:image/png;base64,") || image.length > 180000)) {
      throw new Error("La signature n’a pas pu être enregistrée. Signez à nouveau dans le cadre.");
    }
    return { id, signer, image, code };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientSignQuote(user.id, data.id, data.signer, data.image, data.code);
  });

export const clientRefuse = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Devis manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientRefuseQuote(user.id, data);
  });

export const clientTransfer = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Facture manquante.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientDeclareTransfer(user.id, data);
  });

export const clientConsult = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Devis manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientConsultQuote(user.id, data);
  });

export const clientCancel = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Commande manquante.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientCancelOrder(user.id, data);
  });

export const clientProfile = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; company: string; address?: string; otpSign?: boolean; phone?: string }) => {
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const company = String(input?.company ?? "").trim().slice(0, 160);
    if (name.length < 2) throw new Error("Indiquez votre nom.");
    return {
      name,
      company,
      address: String(input?.address ?? "").trim().slice(0, 240),
      otpSign: Boolean(input?.otpSign),
      phone: String(input?.phone ?? "").trim().slice(0, 40),
    };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return saveClientProfile(user.id, data.name, data.company, data.address, data.otpSign, data.phone);
  });

export const clientPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { current: string; next: string }) => {
    const current = String(input?.current ?? "");
    const next = String(input?.next ?? "");
    if (current.length < 8 || next.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");
    if (next.length > 200) throw new Error("Mot de passe trop long.");
    return { current, next };
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return changeClientPassword(user.id, data.current, data.next);
  });

export const clientSignCode = createServerFn({ method: "POST" }).handler(async () => {
  const user = await asClient();
  rateLimit(`otp:${user.id}`, 5, 10 * 60 * 1000);
  return sendClientSignCode(user.id);
});

export const clientFile = createServerFn({ method: "POST" })
  .inputValidator((id: string) => {
    const clean = String(id ?? "").trim();
    if (!clean) throw new Error("Document manquant.");
    return clean;
  })
  .handler(async ({ data }) => {
    const user = await asClient();
    return clientReadDocument(user.id, data);
  });

export const publicQuote = createServerFn({ method: "GET" })
  .inputValidator((token: string) => {
    const clean = String(token ?? "").trim();
    if (clean.length < 16) throw new Error("Lien invalide.");
    return clean;
  })
  .handler(async () => {
    throw new Error("Le document s’ouvre après l’email et le code. Le premier message ne contient pas le devis.");
  });

export const publicSignCode = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le devis.");
    return { token, email };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`sign-code:${clientAddress()}:${data.email}`, 5, 10 * 60 * 1000);
    const { requestSignCode } = await import("@/lib/quote-link.server");
    return requestSignCode(data.token, data.email);
  });

export const publicUnlock = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string; code: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const code = String(input?.code ?? "").replace(/\D/g, "").slice(0, 6);
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le devis.");
    if (code.length !== 6) throw new Error("Indiquez le code à 6 chiffres.");
    return { token, email, code };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`sign-check:${clientAddress()}`, 12, 10 * 60 * 1000);
    const { confirmSignCode } = await import("@/lib/quote-link.server");
    return confirmSignCode(data.token, data.email, data.code);
  });

export const publicSign = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; email: string; code: string; name: string; role: string; company: string; image: string }) => {
    const token = String(input?.token ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 160);
    const code = String(input?.code ?? "").replace(/\D/g, "").slice(0, 6);
    const name = String(input?.name ?? "").trim().slice(0, 120);
    const role = String(input?.role ?? "").trim().slice(0, 80);
    const company = String(input?.company ?? "").trim().slice(0, 160);
    const image = String(input?.image ?? "");
    if (token.length < 16) throw new Error("Lien invalide.");
    if (!email.includes("@")) throw new Error("Indiquez l’email qui a reçu le devis.");
    if (code.length !== 6) throw new Error("Indiquez le code à 6 chiffres reçu par email.");
    if (name.length < 2) throw new Error("Indiquez le nom du signataire.");
    if (!image.startsWith("data:image/png;base64,") || image.length > 180000) throw new Error("Signez dans le cadre.");
    return { token, email, code, name, role, company, image };
  })
  .handler(async ({ data }) => {
    assertSameSiteRequest();
    rateLimit(`public-sign:${clientAddress()}`, 8, 10 * 60 * 1000);
    const { signPublicQuote } = await import("@/lib/quote-link.server");
    return signPublicQuote(data);
  });
