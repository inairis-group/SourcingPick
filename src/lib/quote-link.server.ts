import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { deliverMail, mailError } from "@/lib/mail.server";
import { isOldQuoteMail, quoteReceivedBody, refreshQuoteMail } from "@/lib/mail-templates";
import { createDepositInvoice, getInvoice, getQuote } from "@/lib/ops.server";
import { euros, percent, quoteMath } from "@/lib/ops.shared";

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function maskEmail(email: string) {
  const [name, domain] = String(email ?? "").split("@");
  if (!domain) return "";
  return `${name.slice(0, 1)}•••@${domain}`;
}

async function codeKit() {
  const { createHash, randomBytes, randomInt, timingSafeEqual } = await import("node:crypto");
  return { createHash, randomBytes, randomInt, timingSafeEqual };
}

function hashCode(createHash: typeof import("node:crypto").createHash, token: string, code: string) {
  return createHash("sha256").update(`sp-sign:${token}:${code}`).digest("hex");
}

async function remember(quoteId: string, to: string, subject: string, body: string, sent: boolean) {
  const sql = await getSql();
  await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
    values (${uid("mail")}, ${quoteId}, ${to}, ${subject}, ${body}, ${sent})`;
}

export async function dispatchQuote(id: string, actor: string, email: string, message: string) {
  const quote = await getQuote(id);
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status === "Devis signé" || quote.status === "Devis refusé") {
    throw new Error("Ce devis n’est plus modifiable.");
  }
  const to = email.trim().toLowerCase();
  if (!quote.clientName.trim()) throw new Error("Indiquez le nom du client avant d’envoyer le devis.");
  if (!quote.clientUserId) throw new Error("Choisissez un client enregistré et actif avant d’envoyer le devis.");
  if (!to.includes("@")) throw new Error("Indiquez l’email du client avant d’envoyer le devis.");
  if (!quote.lines.some((line) => line.title.trim())) throw new Error("Ajoutez au moins une ligne avant d’envoyer le devis.");
  if (message.trim().length < 2) throw new Error("Écrivez le message qui accompagnera le devis.");
  const sql = await getSql();
  const account = await sql<{ email: string; active: boolean; role: string }>`
    select email, active, role from admin_users where id = ${quote.clientUserId}`;
  const client = account[0];
  if (!client || client.role !== "client" || !client.active) {
    throw new Error("Ce client n’est plus actif. Choisissez un client enregistré.");
  }
  if (client.email.trim().toLowerCase() !== to) {
    throw new Error("L’email ne correspond pas au compte client. Choisissez à nouveau le client, ou enregistrez le brouillon après avoir corrigé l’email.");
  }
  const { randomBytes } = await codeKit();
  const existing = await sql<{ public_token: string }>`select public_token from ops_quotes where id = ${id}`;
  const token = existing[0]?.public_token || randomBytes(18).toString("hex");
  const link = `https://sourcingpick.com/consulter/${token}`;
  const subject = (quote.emailSubject || "").trim();
  if (subject.length < 2) throw new Error("Indiquez l’objet de l’email.");
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  const source = isOldQuoteMail(message) ? quoteReceivedBody() : message.trim();
  const written = refreshQuoteMail(source, quote, link);
  const body = written;
  await sql`update ops_quotes set
    client_email = ${to}, public_token = ${token},
    email_subject = ${subject}, email_body = ${message.trim()},
    otp_hash = ${""}, otp_expires = ${""}
    where id = ${id}`;
  const sent = await deliverMail(to, subject, body, {
    badge: "NOUVEAU DEVIS",
    title: subject,
    amount: euros(math.totalCents),
    amountLabel: "Montant du devis",
    ctaLabel: "Consulter et signer le devis",
    ctaHref: link,
    note: `Valable ${Math.max(0, Math.round(Number(quote.validityDays) || 0))} jours. Sur la page, indiquez l’adresse qui a reçu ce message. Un code vous sera alors envoyé, rien n’est dans cet email.`,
  }, "contact@sourcingpick.com");
  await remember(id, to, subject, body, sent);
  if (sent) {
    await sql`update ops_quotes set status = ${"Devis envoyé"} where id = ${id}`;
    if (quote.orderRef) {
      await sql`update ops_orders set state = ${"Devis envoyé"}, substate = ${"Devis envoyé"}, updated_at = now() where ref = ${quote.orderRef}`;
    }
  }
  await sql`insert into ops_journal (id, at_label, actor, action, object_ref)
    values (${uid("log")}, ${new Date().toLocaleString("fr-FR")}, ${actor}, ${sent ? "Devis envoyé par email" : "Échec d’envoi du devis"}, ${quote.number})`;
  if (!sent) throw new Error(mailError() || "L’email n’est pas parti.");
  return { link, sent: true, email: to, code: "", history: [] as { subject: string; sent: boolean; created_at: string }[] };
}

export async function requestSignCode(token: string, email: string) {
  const quote = await quoteByToken(token.trim());
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status !== "Devis envoyé" && quote.status !== "Devis signé") throw new Error("Ce devis n’est pas ouvert.");
  const sql = await getSql();
  const rows = await sql<{ client_email: string; public_token: string }>`select client_email, public_token from ops_quotes where id = ${quote.id}`;
  const row = rows[0];
  if (!row) throw new Error("Devis introuvable.");
  if (email.trim().toLowerCase() !== row.client_email.trim().toLowerCase()) throw new Error("Cet email ne correspond pas au destinataire du devis.");
  const { createHash, randomInt } = await codeKit();
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await sql`update ops_quotes set otp_hash = ${hashCode(createHash, row.public_token, code)}, otp_expires = ${expires} where id = ${quote.id}`;
  const sent = await deliverMail(row.client_email, `Code pour signer ${quote.number}`, `Voici le code pour signer le devis ${quote.number}. Il est valable 15 minutes.`, {
    badge: "CODE DE SIGNATURE",
    title: "Confirmez que c’est bien vous",
    code,
    note: "Si vous n’êtes pas en train de signer ce devis, ignorez ce message.",
  });
  if (!sent) throw new Error(mailError() || "Le code n’a pas pu être envoyé.");
  return { ok: true as const, emailMasked: maskEmail(row.client_email) };
}

export async function confirmSignCode(token: string, email: string, code: string) {
  const quote = await quoteByToken(token.trim());
  if (!quote) throw new Error("Devis introuvable.");
  const sql = await getSql();
  const rows = await sql<{ client_email: string; otp_hash: string; otp_expires: string; public_token: string }>`
    select client_email, otp_hash, otp_expires, public_token from ops_quotes where id = ${quote.id}`;
  const row = rows[0];
  if (!row) throw new Error("Devis introuvable.");
  if (email.trim().toLowerCase() !== row.client_email.trim().toLowerCase()) throw new Error("Cet email ne correspond pas au destinataire du devis.");
  if (!row.otp_hash || !row.otp_expires || new Date(row.otp_expires).getTime() < Date.now()) throw new Error("Le code a expiré. Demandez-en un nouveau.");
  const { createHash, timingSafeEqual } = await codeKit();
  const expected = Buffer.from(row.otp_hash);
  const actual = Buffer.from(hashCode(createHash, row.public_token, code.trim()));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Code incorrect.");
  return openPublicQuote(token.trim());
}

async function locate(ip: string) {
  if (!ip || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "::1") return "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1600);
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: controller.signal });
    const data = (await response.json()) as { success?: boolean; city?: string; region?: string; country?: string };
    if (!data.success) return "";
    return [data.city, data.region, data.country].filter(Boolean).join(", ");
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function openPublicQuote(token: string) {
  const clean = token.trim();
  if (clean.length < 16) throw new Error("Lien invalide.");
  const quote = await quoteByToken(clean);
  if (!quote) throw new Error("Ce devis n’est plus disponible.");
  const sql = await getSql();
  const extra = await sql<{ deposit_invoice_id: string; client_email: string; email_body: string }>`
    select deposit_invoice_id, client_email, email_body from ops_quotes where public_token = ${clean}`;
  const row = extra[0];
  const invoice = row?.deposit_invoice_id ? await getInvoice(row.deposit_invoice_id) : null;
  return {
    quote,
    message: row?.email_body || quote.emailBody,
    emailMasked: maskEmail(row?.client_email || quote.clientEmail),
    depositLabel: percent(quote.depositBps),
    signed: quote.status === "Devis signé",
    invoice: invoice ? { number: invoice.number, amountCents: invoice.amountCents } : null,
  };
}

async function quoteByToken(token: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`select id from ops_quotes where public_token = ${token}`;
  if (!rows[0]) return null;
  return getQuote(rows[0].id);
}

export async function signPublicQuote(input: {
  token: string;
  email: string;
  code: string;
  name: string;
  role: string;
  company: string;
  image: string;
}) {
  const quote = await quoteByToken(input.token.trim());
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status === "Devis signé") throw new Error("Ce devis est déjà signé.");
  if (quote.status !== "Devis envoyé") throw new Error("Ce devis n’est pas ouvert à la signature.");
  const sql = await getSql();
  const rows = await sql<{ client_email: string; otp_hash: string; otp_expires: string; public_token: string }>`
    select client_email, otp_hash, otp_expires, public_token from ops_quotes where id = ${quote.id}`;
  const row = rows[0];
  if (!row) throw new Error("Devis introuvable.");
  if (input.email.trim().toLowerCase() !== row.client_email.trim().toLowerCase()) throw new Error("Cet email ne correspond pas au destinataire du devis.");
  if (!row.otp_expires || new Date(row.otp_expires).getTime() < Date.now()) throw new Error("Le code a expiré. Demandez un nouveau code.");
  const { createHash, timingSafeEqual } = await codeKit();
  const expected = Buffer.from(row.otp_hash);
  const actual = Buffer.from(hashCode(createHash, row.public_token, input.code.trim()));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Code incorrect.");
  const request = getRequest();
  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || "";
  const ua = (request?.headers.get("user-agent") || "").slice(0, 240);
  const lang = (request?.headers.get("accept-language") || "").slice(0, 80);
  const place = await locate(ip);
  const signedAt = new Date().toISOString();
  const who = [input.name, input.role].filter(Boolean).join(", ");
  const meta = JSON.stringify({
    name: input.name,
    role: input.role,
    company: input.company,
    email: row.client_email,
    ip,
    place,
    ua,
    lang,
    at: signedAt,
    cgv: "2026-09-30",
    cgvAccepted: true,
  });
  await sql`update ops_quotes set status = ${"Devis signé"}, signer_name = ${who}, signed_at = ${signedAt}, signature_image = ${input.image}, sign_meta = ${meta}, otp_hash = ${""}
    where id = ${quote.id}`;
  return announceSignedQuote(quote.id);
}

export async function announceSignedQuote(quoteId: string) {
  const quote = await getQuote(quoteId);
  if (!quote) return { ok: false, sent: false, invoiceId: "", invoiceNumber: "", amountCents: 0, depositLabel: "0" };
  const sql = await getSql();
  let meta: { name?: string; role?: string; company?: string; email?: string; ip?: string; place?: string } = {};
  try {
    meta = JSON.parse(quote.signMeta || "{}") as typeof meta;
  } catch {
    meta = {};
  }
  let to = (quote.clientEmail || meta.email || "").trim().toLowerCase();
  if (!to.includes("@") && quote.clientUserId) {
    const owners = await sql<{ email: string }>`select email from admin_users where id = ${quote.clientUserId}`;
    to = (owners[0]?.email || "").trim().toLowerCase();
  }
  const who = quote.signerName || meta.name || quote.clientName || "Client";
  let finalId = "";
  let depositError = "";
  try {
    finalId = await createDepositInvoice(quote.id, who);
    await sql`update ops_quotes set deposit_invoice_id = ${finalId} where id = ${quote.id}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!/pas d’acompte|pas d'acompte/.test(message)) {
      depositError = message || "La facture d’acompte n’a pas pu être créée.";
      void import("@/lib/error-log.server").then(({ recordError }) => recordError("sign", `Acompte ${quote.number}`, depositError));
    }
  }
  const invoice = finalId ? await getInvoice(finalId) : null;
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  const amount = invoice ? euros(invoice.amountCents) : euros(math.depositCents);
  const tokenRows = await sql<{ public_token: string }>`select public_token from ops_quotes where id = ${quote.id}`;
  const token = tokenRows[0]?.public_token || "";
  const link = token ? `https://sourcingpick.com/consulter/${token}` : "https://sourcingpick.com/espace/facturation";
  const when = new Date(quote.signedAt || Date.now()).toLocaleString("fr-FR");
  const copy = "contact@sourcingpick.com";
  const quoteSent = to.includes("@")
    ? await deliverMail(to, `Devis ${quote.number} signé`, [
        `Bonjour ${meta.name || who},`,
        "",
        `Votre signature du devis ${quote.number} est enregistrée.`,
        "",
        `Signataire : ${who}`,
        `Société : ${meta.company || quote.clientCompany || quote.clientName || "—"}`,
        `Email vérifié : ${to}`,
        `Date : ${when}`,
        ...(meta.place ? [`Lieu : ${meta.place}`] : []),
        ...(meta.ip ? [`Adresse IP : ${meta.ip}`] : []),
        "",
        `Montant accepté : ${euros(math.totalCents)}`,
        math.depositCents > 0 ? `Acompte : ${percent(quote.depositBps)} % soit ${amount}` : "Ce devis n’a pas d’acompte.",
        "",
        "Le bouton ouvre le devis signé. Vous pouvez le télécharger en PDF depuis cette page.",
        ...(invoice ? ["La facture d’acompte part dans un second email."] : []),
      ].join("\n"), {
        badge: "DEVIS ACCEPTÉ",
        title: "Devis accepté !",
        amount: euros(math.totalCents),
        amountLabel: "Montant accepté",
        ctaLabel: "Voir et télécharger le devis signé",
        ctaHref: link,
        reason: "Vous recevez ce message car vous avez signé un devis Sourcing Pick.",
      }, copy)
    : false;
  let invoiceSent = false;
  if (invoice && to.includes("@")) {
    invoiceSent = await deliverMail(to, `Facture d’acompte ${invoice.number}`, [
      `Bonjour ${meta.name || who},`,
      "",
      `La facture d’acompte ${invoice.number} de ${amount} est émise.`,
      `Elle correspond à ${percent(quote.depositBps)} % du devis ${quote.number}, signé le ${when}.`,
      "Échéance : à réception de la facture.",
      "",
      "Le règlement se fait par virement ou par carte, depuis votre espace client.",
      "Le bouton rouvre le document, où le numéro de cette facture est indiqué.",
    ].filter(Boolean).join("\n"), {
      badge: "ACOMPTE",
      title: "Votre facture d’acompte",
      amount,
      amountLabel: "Montant dû",
      ctaLabel: token ? "Voir le devis signé" : "Ouvrir mes factures",
      ctaHref: link,
      note: "Cette facture a été créée automatiquement à la signature. Elle n’attend pas une action de notre part.",
    }, copy);
  }
  const sent = quoteSent && (invoice ? invoiceSent : !depositError);
  if (to.includes("@") && (!quoteSent || (invoice && !invoiceSent))) {
    void import("@/lib/error-log.server").then(({ recordError }) => recordError("sign", `Email après signature ${quote.number}`, mailError() || "envoi incomplet"));
  }
  if (to.includes("@")) await remember(quote.id, to, invoice ? `Devis signé et facture ${invoice.number}` : `Devis ${quote.number} signé`, link, sent);
  await sql`insert into ops_journal (id, at_label, actor, action, object_ref)
    values (${uid("log")}, ${new Date().toLocaleString("fr-FR")}, ${who}, ${"Devis signé"}, ${quote.number})`;
  if (quote.orderRef) {
    const orders = await sql<{ id: string }>`select id from ops_orders where ref = ${quote.orderRef}`;
    if (orders[0]) {
      await sql`insert into ops_messages (id, order_id, author, body, at_label, kind, internal_only)
        values (${uid("msg")}, ${orders[0].id}, ${who}, ${`Devis ${quote.number} signé${invoice ? `. Facture d’acompte ${invoice.number} émise.` : "."}`}, ${new Date().toLocaleString("fr-FR")}, ${"message"}, false)`;
    }
  }
  const office = [
    `${who} vient de signer le devis ${quote.number}.`,
    `Client : ${quote.clientName || "—"} · ${to || "email non renseigné"}`,
    invoice ? `Facture d’acompte ${invoice.number} : ${amount}.` : depositError ? `Acompte non créé : ${depositError}` : "Ce devis n’a pas d’acompte.",
    quoteSent ? "Le devis signé a été envoyé au client." : "L’email du devis signé n’est pas parti.",
    invoice ? (invoiceSent ? "La facture d’acompte a été envoyée au client." : "La facture existe, son email n’est pas parti.") : "",
    `Lien du document : ${link}`,
  ].filter(Boolean).join("\n");
  const desks = await sql<{ email: string }>`select email from admin_users where role = ${"admin"} and active = true`;
  const targets = new Set<string>(["contact@sourcingpick.com"]);
  for (const desk of desks) {
    const email = desk.email.trim().toLowerCase();
    if (email.includes("@")) targets.add(email);
  }
  targets.delete(to);
  for (const desk of targets) {
    await deliverMail(desk, `Devis signé : ${quote.number}`, office, {
      badge: "DEVIS SIGNÉ",
      title: `${quote.number} est signé`,
      amount: invoice ? amount : undefined,
      amountLabel: invoice ? "Acompte émis" : undefined,
      ctaLabel: "Ouvrir le devis",
      ctaHref: `https://sourcingpick.com/devis/${quote.id}`,
    });
  }
  return {
    ok: true,
    sent,
    invoiceId: invoice?.id || "",
    invoiceNumber: invoice?.number || "",
    amountCents: invoice?.amountCents || 0,
    depositLabel: percent(quote.depositBps),
  };
}
