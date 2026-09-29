import { getSql, type Sql } from "@/lib/db";
import { cachedRead } from "@/lib/read-cache";
import { armBilling, ensureBillingSchema, sendInvoiceReminder } from "@/lib/billing.server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkPassword, hashPassword } from "@/lib/admin-auth.server";
import {
  quoteMath,
  DUE_ON_RECEIPT,
  duePhrase,
  publicSubstate,
  euros,
  percent,
  packImages,
  pricedLines,
  lineKind,
  type OpsDocument,
  type OpsEmail,
  type OpsInvoice,
  type OpsJournal,
  type OpsMessage,
  type OpsOrder,
  type OpsQuote,
  type OpsSettings,
  type OpsSupplier,
  type OpsClient,
  type OpsUser,
  type QuoteLine,
} from "@/lib/ops.shared";

function remembered<T>(key: string, load: () => Promise<T>) {
  return cachedRead(key, 12_000, load);
}

function withoutInlineImages(raw: string) {
  if (!raw || !raw.includes("data:image")) return raw;
  return raw
    .replace(/"image"\s*:\s*"data:image\/[^"]*"/g, '"image":""')
    .replace(/"images"\s*:\s*\[[^\]]*\]/g, '"images":[]');
}

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function stamp() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(d.getDate())}/${z(d.getMonth() + 1)} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

async function uploadRoot() {
  const preferred = process.env.UPLOAD_DIR
    || (process.env.PGLITE_DATA_DIR ? join(process.env.PGLITE_DATA_DIR, "..", "uploads") : "/var/lib/sourcingpick-site/uploads");
  try {
    await mkdir(preferred, { recursive: true });
    return preferred;
  } catch {
    const local = join(process.cwd(), "data", "uploads");
    await mkdir(local, { recursive: true });
    return local;
  }
}

function safeDocId(id: string) {
  if (!/^doc_[a-z0-9]+$/i.test(id)) throw new Error("Document invalide.");
  return id;
}

async function writeUpload(id: string, fileBase64: string) {
  if (fileBase64.length > 12_000_000) throw new Error("Fichier trop lourd (8 Mo max).");
  const bytes = Buffer.from(fileBase64, "base64");
  if (!bytes.length) throw new Error("Fichier vide.");
  if (bytes.length > 8 * 1024 * 1024) throw new Error("Fichier trop lourd (8 Mo max).");
  const root = await uploadRoot();
  await writeFile(join(root, safeDocId(id)), bytes);
  return bytes.length;
}

export async function writeTextDocument(id: string, text: string) {
  const bytes = Buffer.from(text, "utf8");
  if (!bytes.length) throw new Error("Contrat vide.");
  if (bytes.length > 200_000) throw new Error("Contrat trop long.");
  const root = await uploadRoot();
  await writeFile(join(root, safeDocId(id)), bytes);
  return bytes.length;
}

export async function readDocumentFile(id: string) {
  const sql = await getSql();
  const rows = await sql<{ file_name: string; mime: string; byte_size: number }>`
    select file_name, mime, byte_size from ops_documents where id = ${id}`;
  const row = rows[0];
  if (!row || !Number(row.byte_size)) throw new Error("Ce document n’a pas de fichier.");
  const root = await uploadRoot();
  const bytes = await readFile(join(root, safeDocId(id)));
  return { fileName: row.file_name || "piece", mime: row.mime || "application/octet-stream", data: bytes.toString("base64") };
}

async function clientEmailFor(sql: Sql, clientName: string, orderRef: string) {
  if (orderRef) {
    const fromQuote = await sql<{ client_email: string }>`
      select client_email from ops_quotes where order_ref = ${orderRef} and client_email <> '' order by issued_on desc limit 1`;
    if (fromQuote[0]?.client_email) return fromQuote[0].client_email;
  }
  const fromUser = await sql<{ email: string }>`
    select email from admin_users
    where role = ${"client"} and (lower(company) = lower(${clientName}) or lower(name) = lower(${clientName}))
    limit 1`;
  return fromUser[0]?.email || "";
}

async function rememberMail(sql: Sql, to: string, subject: string, body: string, sent: boolean) {
  await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
    values (${uid("out")}, ${""}, ${to}, ${subject}, ${body}, ${sent})`;
}

type OrderRow = {
  id: string;
  ref: string;
  client_name: string;
  product: string;
  agent_name: string;
  state: string;
  substate: string;
  internal_only: boolean;
  note: string;
  internal_note: string;
  client_talk: boolean;
  updated_at: string;
};

function mapOrder(row: OrderRow): OpsOrder {
  return {
    id: row.id,
    ref: row.ref,
    clientName: row.client_name || "",
    product: row.product,
    agentName: row.agent_name,
    state: row.state,
    substate: row.substate,
    internalOnly: Boolean(row.internal_only),
    note: row.note,
    internalNote: row.internal_note || "",
    updatedAt: String(row.updated_at),
    clientEmail: "",
    clientPhone: "",
    clientTalk: Boolean(row.client_talk),
  };
}

async function purgeLooseClients(sql: Sql) {
  const rows = await sql<{ payload: { clients?: Array<Record<string, string>>; docs?: Array<Record<string, string>>; [key: string]: unknown } }>`select payload from atelier_state where id = ${"main"}`;
  const payload = rows[0]?.payload;
  if (!payload || !Array.isArray(payload.clients)) return;
  const users = await sql<{ id: string; name: string; email: string; company: string; address: string; vat: string; siren: string; siret: string; naf: string }>`
    select id, name, email, company, coalesce(address, '') as address, coalesce(vat, '') as vat, coalesce(siren, '') as siren, coalesce(siret, '') as siret, coalesce(naf, '') as naf
    from admin_users where role = ${"client"} and active = true`;
  const norm = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = (client: Record<string, string>) => {
    const email = String(client.email || "").trim().toLowerCase();
    if (email.includes("@")) {
      const found = users.find((user) => user.email.trim().toLowerCase() === email);
      if (found) return found;
    }
    if (users.some((user) => user.id === client.id)) return users.find((user) => user.id === client.id) || null;
    const name = norm(String(client.legalName || client.tradeName || ""));
    if (name.length < 4 || name === "CLIENT") return null;
    return users.find((user) => {
      const company = norm(user.company || "");
      return company.length > 3 && (company.includes(name) || name.includes(company));
    }) || null;
  };
  const links = new Map<string, string>();
  for (const client of payload.clients) links.set(String(client.id || ""), match(client)?.id || "");
  const clients = users.map((user) => ({
    id: user.id,
    legalName: user.company || user.name,
    tradeName: user.name && user.company && user.name !== user.company ? user.name : "",
    address: user.address || "",
    vat: user.vat || "",
    siret: user.siret || "",
    rcs: [user.siren ? `SIREN ${user.siren}` : "", user.naf ? `NAF ${user.naf}` : ""].filter(Boolean).join(" · "),
    siteNote: "",
    email: user.email,
  }));
  const docs = (payload.docs || []).map((doc) => {
    const current = String(doc.clientId || "");
    const next = links.get(current);
    if (next) return { ...doc, clientId: next };
    if (current.startsWith("usr_")) return doc;
    return current ? { ...doc, clientId: "" } : doc;
  });
  const before = JSON.stringify(payload.clients.map((client) => client.id));
  const after = JSON.stringify(clients.map((client) => client.id));
  if (before === after && JSON.stringify(payload.docs || []) === JSON.stringify(docs)) return;
  await sql`update atelier_state set payload = ${JSON.stringify({ ...payload, clients, docs })}::jsonb, updated_at = now() where id = ${"main"}`;
}

async function log(sql: Sql, actor: string, action: string, objectRef: string) {
  await sql`insert into ops_journal (id, at_label, actor, action, object_ref)
    values (${uid("jr")}, ${stamp()}, ${actor}, ${action}, ${objectRef})`;
}

async function tell(sql: Sql, orderRef: string, author: string, body: string) {
  if (!orderRef || !body.trim()) return;
  const rows = await sql<{ id: string }>`select id from ops_orders where ref = ${orderRef}`;
  if (!rows[0]) return;
  await sql`insert into ops_messages (id, order_id, author, body, at_label, kind, internal_only)
    values (${uid("msg")}, ${rows[0].id}, ${author}, ${body}, ${stamp()}, ${"message"}, false)`;
}

async function fileDoc(sql: Sql, clientName: string, category: string, title: string, orderRef: string) {
  if (!orderRef || !title) return;
  await sql`insert into ops_documents (id, client_name, category, title, order_ref, issued_on)
    values (${uid("doc")}, ${clientName}, ${category}, ${title}, ${orderRef}, ${new Date().toISOString().slice(0, 10)})`;
}

const PORTAL_ACCOUNTS: Array<{ name: string; email: string; role: string; company: string; password: string }> = [
  { name: "Xie Wei", email: "xie.wei@sourcingpick.com", role: "agent", company: "Sourcing Pick", password: "XieWei-2026" },
  { name: "Li Jun", email: "li.jun@sourcingpick.com", role: "agent", company: "Sourcing Pick", password: "LiJun-2026" },
  { name: "Chen Hao", email: "chen.hao@sourcingpick.com", role: "agent", company: "Sourcing Pick", password: "ChenHao-2026" },
];

let portalReady: Promise<void> | null = null;

async function ensurePortalAccounts(sql: Sql) {
  if (portalReady) return portalReady;
  portalReady = (async () => {
  for (const person of PORTAL_ACCOUNTS) {
    const found = await sql<{ id: string }>`select id from admin_users where email = ${person.email}`;
    if (found[0]) continue;
    const passwordHash = await hashPassword(person.password);
    await sql`insert into admin_users (id, name, email, password_hash, role, active, company, last_seen, verification, email_verified)
      values (${uid("usr")}, ${person.name}, ${person.email}, ${passwordHash}, ${person.role}, true, ${person.company}, ${"aujourd’hui"}, ${"Vérifié"}, true)`;
  }
  })().catch((err: unknown) => {
    portalReady = null;
    throw err;
  });
  return portalReady;
}

const DEMO_CLIENTS = ["Atelier Nord SARL", "Renard Import", "Maison Delorme", "Nord Import"];
const DEMO_EMAILS = ["marc.dubois@atelier-nord.fr", "sophie@renard-import.fr", "thomas.petit@gmail.com"];

async function purgeDemo(sql: Sql) {
  const orders = await sql<{ id: string; ref: string }>`
    select id, ref from ops_orders
    where product = ${"Assortiment sourcing"}
       or client_name = ${DEMO_CLIENTS[0]}
       or client_name = ${DEMO_CLIENTS[1]}
       or client_name = ${DEMO_CLIENTS[2]}
       or client_name = ${DEMO_CLIENTS[3]}`;
  for (const order of orders) {
    const quotes = await sql<{ number: string }>`delete from ops_quotes where order_ref = ${order.ref} returning number`;
    const invoices = await sql<{ number: string }>`delete from ops_invoices where order_ref = ${order.ref} returning number`;
    await sql`delete from ops_documents where order_ref = ${order.ref}`;
    await sql`delete from ops_journal where object_ref = ${order.ref}`;
    for (const row of [...quotes, ...invoices]) {
      await sql`delete from ops_journal where object_ref = ${row.number}`;
    }
    await sql`delete from ops_orders where id = ${order.id}`;
  }
  for (const name of DEMO_CLIENTS) {
    const quotes = await sql<{ number: string }>`delete from ops_quotes where client_name = ${name} returning number`;
    const invoices = await sql<{ number: string }>`delete from ops_invoices where client_name = ${name} returning number`;
    for (const row of [...quotes, ...invoices]) {
      await sql`delete from ops_journal where object_ref = ${row.number}`;
    }
    await sql`delete from ops_documents where client_name = ${name}`;
    await sql`delete from admin_users where role = ${"client"} and company = ${name}`;
  }
  for (const email of DEMO_EMAILS) {
    await sql`delete from admin_users where email = ${email} and role = ${"client"}`;
  }
}

async function ensureCompany(sql: Sql) {
  const rows = await sql<{ id: string }>`select id from ops_settings where id = ${"main"}`;
  if (rows[0]) return;
  await sql`insert into ops_settings (
    id, legal_name, chinese_name, usci, address, representative, goods_bps, freight_bps, deposit_bps, validity_days,
    beneficiary, iban, swift, bank, month_cents, prev_month_cents
  ) values (
    'main',
    ${"HANGZHOU QIYUAN YING TECHNOLOGY INFORMATION CO., LTD."},
    ${"杭州起源缨科技信息有限公司"},
    ${"91330110MAK784B049"},
    ${"Room 401, Building 3, No. 152 Haoyun Street, Liangzhu, Yuhang, Hangzhou"},
    ${"Matteo Jean Fernandez"},
    200, 300, 4000, 15,
    ${"HANGZHOU QIYUAN YING TECHNOLOGY INFORMATION CO., LTD."},
    ${"BE15 9058 6919 0230"},
    ${"TRWIBEB1XXX"},
    ${"Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium"},
    0, 0
  )`;
}

async function ensureEmailTemplates(sql: Sql) {
  const { DESIGNED_EMAILS, isStubEmail } = await import("@/lib/mail-templates");
  const rows = await sql<{ id: string; name: string; body: string }>`select id, name, body from ops_emails`;
  const byName = new Map(rows.map((row) => [row.name, row]));
  for (const [name, category, trigger, subject, body] of DESIGNED_EMAILS) {
    const current = byName.get(name);
    if (!current) {
      await sql`insert into ops_emails (id, name, category, trigger_label, subject, body)
        values (${uid("em")}, ${name}, ${category}, ${trigger}, ${subject}, ${body})`;
      continue;
    }
    if (isStubEmail(current.body) || (name === "Devis reçu" && /Ouvrez-le pour voir le détail ligne par ligne/.test(current.body))) {
      await sql`update ops_emails set category = ${category}, trigger_label = ${trigger}, subject = ${subject}, body = ${body} where id = ${current.id}`;
    }
  }
}

let opsReady: Promise<void> | null = null;

export function ensureOps() {
  if (!opsReady) {
    opsReady = (async () => {
      const sql = await getSql();
      await ensureBillingSchema(sql);
      const { ensureDocSigns } = await import("@/lib/doc-sign.server");
      await ensureDocSigns();
      await ensurePortalAccounts(sql);
      await purgeDemo(sql);
      await ensureCompany(sql);
      await ensureEmailTemplates(sql);
      await repairQuoteNumbers(sql);
      await purgeLooseClients(sql);
      await catchSignedNotices(sql);
      armBilling();
    })().catch((error) => {
      opsReady = null;
      const message = error instanceof Error ? error.message : String(error);
      void import("@/lib/error-log.server").then(({ recordError }) => recordError("démarrage", message, error instanceof Error ? error.stack || "" : ""));
      throw error;
    });
  }
  return opsReady;
}

export async function claimOrder(id: string, agentName: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ ref: string }>`update ops_orders set
      agent_name = ${agentName},
      state = case when state = ${"Demande reçue"} then ${"Agent assigné"} else state end,
      substate = case when state = ${"Demande reçue"} then ${"Agent assigné"} else substate end,
      updated_at = now()
    where id = ${id} or ref = ${id} returning ref`;
  if (!rows[0]) throw new Error("Dossier introuvable.");
  await log(sql, agentName, "Dossier attribué", rows[0].ref);
}

export function listInbox() {
  return remembered("inbox", listInboxNow);
}

async function listInboxNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    order_id: string;
    author: string;
    body: string;
    at_label: string;
    kind: string;
    internal_only: boolean;
    ref: string;
    product: string;
    client_name: string;
    agent_name: string;
  }>`select m.id, m.order_id, m.author, m.body, m.at_label, m.kind, m.internal_only,
      o.ref, o.product, o.client_name, o.agent_name
    from ops_messages m
    join ops_orders o on o.id = m.order_id or o.ref = m.order_id
    order by m.created_at asc`;
  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    author: row.author,
    body: row.body,
    atLabel: row.at_label,
    kind: row.kind,
    internalOnly: Boolean(row.internal_only),
    ref: row.ref,
    product: row.product,
    clientName: row.client_name || "",
    agentName: row.agent_name,
  }));
}

export function listOrders() {
  return remembered("orders", listOrdersNow);
}

async function clientDirectory(sql: Sql) {
  return sql<{ name: string; email: string; company: string; phone: string }>`
    select name, email, company, coalesce(phone, '') as phone from admin_users where role = ${"client"}`;
}

function noteContact(note: string) {
  const email = note.match(/Email\s*:\s*(\S+@\S+)/i)?.[1] ?? "";
  const phone = note.match(/Téléphone\s*:\s*([^\n]+)/i)?.[1]?.trim() ?? "";
  return { email, phone };
}

function withContacts(
  orders: OpsOrder[],
  people: Array<{ name: string; email: string; company: string; phone: string }>,
) {
  return orders.map((order) => {
    const person = people.find((row) => sameParty(row.company, row.name, order.clientName));
    const written = noteContact(order.note || "");
    return {
      ...order,
      clientEmail: person?.email || written.email,
      clientPhone: person?.phone || written.phone,
    };
  });
}

async function listOrdersNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<OrderRow>`select id, ref, client_name, product, agent_name, state, substate, internal_only, note, internal_note, client_talk, updated_at::text as updated_at
    from ops_orders order by ref desc`;
  return withContacts(rows.map(mapOrder), await clientDirectory(sql));
}

export async function getOrder(id: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<OrderRow>`select id, ref, client_name, product, agent_name, state, substate, internal_only, note, internal_note, client_talk, updated_at::text as updated_at
    from ops_orders where id = ${id} or ref = ${id}`;
  const order = rows[0] ? withContacts([mapOrder(rows[0])], await clientDirectory(sql))[0] : null;
  if (!order) return null;
  const suppliers = await sql<{ id: string; order_id: string; name: string; price: string; qty: string; lead: string; status: string }>`
    select id, order_id, name, price, qty, lead, status from ops_suppliers where order_id = ${order.id}`;
  const messages = await sql<{
    id: string;
    order_id: string;
    author: string;
    body: string;
    at_label: string;
    kind: string;
    internal_only: boolean;
  }>`select id, order_id, author, body, at_label, kind, internal_only from ops_messages where order_id = ${order.id} order by created_at`;
  const journal = await sql<{ id: string; at_label: string; actor: string; action: string; object_ref: string }>`
    select id, at_label, actor, action, object_ref from ops_journal where object_ref = ${order.ref} order by created_at desc`;
  return {
    order,
    suppliers: suppliers.map(
      (row): OpsSupplier => ({
        id: row.id,
        orderId: row.order_id,
        name: row.name,
        price: row.price,
        qty: row.qty,
        lead: row.lead,
        status: row.status,
      }),
    ),
    messages: messages.map(
      (row): OpsMessage => ({
        id: row.id,
        orderId: row.order_id,
        author: row.author,
        body: row.body,
        atLabel: row.at_label,
        kind: row.kind,
        internalOnly: Boolean(row.internal_only),
      }),
    ),
    journal: journal.map(
      (row): OpsJournal => ({
        id: row.id,
        atLabel: row.at_label,
        actor: row.actor,
        action: row.action,
        objectRef: row.object_ref,
      }),
    ),
  };
}

export async function assignOrder(id: string, agentName: string, actor: string) {
  const sql = await getSql();
  const name = agentName.trim() || "Équipe Hangzhou";
  const rows = await sql<{ ref: string }>`update ops_orders set agent_name = ${name}, updated_at = now()
    where id = ${id} or ref = ${id} returning ref`;
  if (!rows[0]) throw new Error("Dossier introuvable.");
  await log(sql, actor, name === "Équipe Hangzhou" ? "Agent retiré" : `Agent : ${name}`, rows[0].ref);
}

export async function setOrderTalk(id: string, allowed: boolean, actor: string) {
  const sql = await getSql();
  const rows = await sql<{ ref: string }>`update ops_orders set client_talk = ${allowed}, updated_at = now()
    where id = ${id} returning ref`;
  if (!rows[0]) throw new Error("Dossier introuvable.");
  await log(sql, actor, allowed ? "Agent autorisé à écrire au client" : "Agent retiré de la conversation client", rows[0].ref);
}

export async function setOrderState(id: string, substate: string, state: string, internalOnly: boolean, actor: string, comment: string, role = "admin") {
  const sql = await getSql();
  const rows = await sql<{ ref: string }>`update ops_orders set substate = ${substate}, state = ${state}, internal_only = ${internalOnly}, updated_at = now()
    where id = ${id} returning ref`;
  const ref = rows[0]?.ref ?? id;
  await log(sql, actor, comment.trim() ? `${substate} — ${comment.trim()}` : substate, ref);
  let talk = true;
  if (role === "agent") {
    const flags = await sql<{ client_talk: boolean }>`select client_talk from ops_orders where id = ${id}`;
    talk = Boolean(flags[0]?.client_talk);
  }
  if (!internalOnly && ref && (role !== "agent" || talk)) {
    await tell(sql, ref, actor, `Votre commande ${ref} est maintenant : ${state} — ${substate}.`);
  }
}

export async function saveQualification(
  id: string,
  note: string,
  suppliers: OpsSupplier[],
  actor: string,
) {
  const sql = await getSql();
  await sql`update ops_orders set internal_note = ${note}, updated_at = now() where id = ${id}`;
  await sql`delete from ops_suppliers where order_id = ${id}`;
  for (const supplier of suppliers) {
    if (!supplier.name.trim()) continue;
    await sql`insert into ops_suppliers (id, order_id, name, price, qty, lead, status)
      values (${supplier.id || uid("sup")}, ${id}, ${supplier.name}, ${supplier.price}, ${supplier.qty}, ${supplier.lead}, ${supplier.status || "Comparé"})`;
  }
  const rows = await sql<{ ref: string }>`select ref from ops_orders where id = ${id}`;
  await log(sql, actor, "Qualification enregistrée", rows[0]?.ref ?? id);
}

export async function addMessage(orderId: string, author: string, body: string, internalOnly: boolean, role = "admin") {
  const sql = await getSql();
  const found = await sql<{ id: string; ref: string; client_name: string; client_talk: boolean }>`select id, ref, client_name, client_talk from ops_orders where id = ${orderId} or ref = ${orderId} limit 1`;
  if (!found[0]) throw new Error("Dossier introuvable.");
  if (!internalOnly && role === "agent" && !found[0].client_talk) {
    throw new Error("Vous ne pouvez pas écrire au client. L’administration ne vous y a pas autorisé. Laissez une note interne.");
  }
  const realId = found[0].id;
  const id = uid("msg");
  await sql`insert into ops_messages (id, order_id, author, body, at_label, kind, internal_only)
    values (${id}, ${realId}, ${author}, ${body}, ${stamp()}, ${internalOnly ? "note" : "message"}, ${internalOnly})`;
  await log(sql, author, internalOnly ? "Note interne" : "Message client", found[0].ref);
  let emailed = false;
  if (!internalOnly) {
    const email = await clientEmailFor(sql, found[0].client_name, found[0].ref);
    if (email.includes("@")) {
      const { deliverMail } = await import("@/lib/mail.server");
      const subject = `Message · ${found[0].ref}`;
      const text = `Bonjour,\n\n${author} vous écrit au sujet de ${found[0].ref} :\n\n${body}\n\nVous pouvez répondre dans votre espace.`;
      emailed = await deliverMail(email, subject, text, {
        badge: "MESSAGE",
        title: `Message sur ${found[0].ref}`,
        ctaLabel: "Ouvrir mon espace",
        ctaHref: "https://sourcingpick.com/espace",
      });
      await rememberMail(sql, email, subject, text, emailed);
    }
  }
  return { emailed };
}

function mapQuote(row: {
  id: string;
  number: string;
  order_ref: string;
  client_name: string;
  amount_cents: number;
  issued_on: string;
  status: string;
  lang: string;
  currency: string;
  incoterm: string;
  port: string;
  validity_days: number;
  deposit_bps: number;
  goods_bps: number;
  freight_bps: number;
  lines_json: string;
  email_subject: string;
  email_body: string;
  client_email?: string;
  client_user_id?: string;
  client_company?: string;
  client_address?: string;
  client_vat?: string;
  client_country?: string;
  client_siren?: string;
  client_siret?: string;
  client_naf?: string;
  signer_name?: string;
  signed_at?: string;
  signature_image?: string;
  sign_meta?: string;
  font?: string;
}): OpsQuote {
  let lines: QuoteLine[] = [];
  try {
    const parsed = JSON.parse(row.lines_json) as QuoteLine[];
    if (Array.isArray(parsed)) {
      lines = parsed.map((item) => ({ ...item, details: String(item.details ?? "") }));
    }
  } catch {
    lines = [];
  }
  return {
    id: row.id,
    number: row.number,
    orderRef: row.order_ref,
    clientName: row.client_name || "",
    amountCents: Number(row.amount_cents),
    issuedOn: row.issued_on || "",
    status: row.status,
    lang: row.lang,
    currency: row.currency,
    incoterm: row.incoterm,
    port: row.port,
    validityDays: Number(row.validity_days),
    depositBps: Number(row.deposit_bps),
    goodsBps: Number(row.goods_bps),
    freightBps: Number(row.freight_bps),
    font: row.font || "onest",
    lines,
    emailSubject: row.email_subject,
    emailBody: row.email_body,
    clientEmail: row.client_email || "",
    clientUserId: row.client_user_id || "",
    clientCompany: row.client_company || "",
    clientAddress: row.client_address || "",
    clientVat: row.client_vat || "",
    clientCountry: row.client_country || "",
    clientSiren: row.client_siren || "",
    clientSiret: row.client_siret || "",
    clientNaf: row.client_naf || "",
    signerName: row.signer_name || "",
    signedAt: row.signed_at || "",
    signatureImage: row.signature_image || "",
    signMeta: row.sign_meta || "",
  };
}

async function writeClientAccount(sql: Sql, quote: OpsQuote) {
  const id = quote.clientUserId;
  if (!id) return;
  const rows = await sql<{ id: string; role: string }>`select id, role from admin_users where id = ${id}`;
  if (!rows[0] || rows[0].role !== "client") throw new Error("Le compte rattaché n’est pas un client.");
  const email = quote.clientEmail.trim().toLowerCase();
  if (!email.includes("@")) return;
  const clash = await sql<{ id: string }>`select id from admin_users where email = ${email} and id <> ${id}`;
  if (clash[0]) throw new Error("Cet email est déjà utilisé par un autre compte.");
  await sql`update admin_users set
    name = ${quote.clientName}, email = ${email},
    company = case when ${quote.clientCompany || ""} <> '' then ${quote.clientCompany} else company end,
    vat = case when ${quote.clientVat || ""} <> '' then ${quote.clientVat} else vat end,
    country = case when ${quote.clientCountry || ""} <> '' then ${quote.clientCountry} else country end,
    address = case when ${quote.clientAddress || ""} <> '' then ${quote.clientAddress} else address end,
    siren = case when ${quote.clientSiren || ""} <> '' then ${quote.clientSiren} else siren end,
    siret = case when ${quote.clientSiret || ""} <> '' then ${quote.clientSiret} else siret end,
    naf = case when ${quote.clientNaf || ""} <> '' then ${quote.clientNaf} else naf end
    where id = ${id}`;
}

export function listQuoteClients() {
  return remembered("quote-clients", listQuoteClientsNow);
}

async function listQuoteClientsNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; email: string; company: string; vat: string; country: string; address: string; siren: string; siret: string; naf: string; kind: string }>`
    select id, name, email, company, vat, country, address, siren, siret, naf, kind from admin_users where role = ${"client"} order by company, name`;
  const byEmail = new Map<string, OpsClient>();
  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase();
    const client: OpsClient = {
      id: row.id,
      name: row.name,
      email,
      company: row.company || "",
      vat: row.vat || "",
      country: row.country || "",
      address: row.address || "",
      siren: row.siren || "",
      siret: row.siret || "",
      naf: row.naf || "",
      kind: row.kind === "particulier" ? "particulier" : "pro",
    };
    const key = email.includes("@") ? email : row.id;
    const previous = byEmail.get(key);
    const weight = (item: OpsClient) => (item.company ? 4 : 0) + (item.siret ? 2 : 0) + (item.address ? 1 : 0);
    if (!previous || weight(client) > weight(previous)) byEmail.set(key, client);
  }
  return [...byEmail.values()];
}

export async function createQuoteClient(
  input: { name: string; email: string; company: string; address: string; vat: string; country: string; siren?: string; siret?: string; naf?: string; kind?: string },
  actor: string,
) {
  await ensureOps();
  const sql = await getSql();
  const email = input.email.trim().toLowerCase();
  const kind = input.kind === "particulier" ? "particulier" : "pro";
  if (!input.name.trim() || !email.includes("@")) throw new Error("Le nom et l’email du client sont obligatoires.");
  if (kind === "pro" && !input.company.trim() && !input.siret && !input.siren) {
    throw new Error("Pour un professionnel, indiquez la dénomination ou le SIRET.");
  }
  const company = kind === "particulier" ? "" : input.company;
  const vat = kind === "particulier" ? "" : input.vat;
  const siren = kind === "particulier" ? "" : input.siren || "";
  const siret = kind === "particulier" ? "" : input.siret || "";
  const naf = kind === "particulier" ? "" : input.naf || "";
  const found = await sql<{ id: string; role: string }>`select id, role from admin_users where email = ${email}`;
  if (found[0] && found[0].role !== "client") throw new Error("Cet email appartient déjà à un compte interne.");
  if (found[0]) {
    await sql`update admin_users set
      name = ${input.name.trim()}, company = ${company}, address = ${input.address}, vat = ${vat},
      country = ${input.country || "France"}, siren = ${siren}, siret = ${siret}, naf = ${naf}, kind = ${kind}
      where id = ${found[0].id}`;
    await log(sql, actor, kind === "particulier" ? "Particulier mis à jour" : "Entreprise liée au client", email);
    return { id: found[0].id, temporary: "" };
  }
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const temporary = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const id = uid("usr");
  await sql`insert into admin_users (id, name, email, password_hash, role, active, company, vat, country, address, siren, siret, naf, last_seen, verification, email_verified, kind)
    values (${id}, ${input.name.trim()}, ${email}, ${await hashPassword(temporary)}, ${"client"}, true, ${company}, ${vat}, ${input.country || "France"}, ${input.address}, ${siren}, ${siret}, ${naf}, ${"jamais"}, ${"Vérifié"}, true, ${kind})`;
  await log(sql, actor, kind === "particulier" ? "Particulier créé" : "Compte client créé", email);
  return { id, temporary };
}

export async function deleteQuote(id: string, actor: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ number: string; status: string }>`select number, status from ops_quotes where id = ${id}`;
  if (!rows[0]) throw new Error("Devis introuvable.");
  if (rows[0].status === "Devis signé") throw new Error("Un devis signé ne se supprime pas.");
  await sql`delete from ops_quotes where id = ${id}`;
  await log(sql, actor, "Devis supprimé", rows[0].number);
}

export async function deleteOrder(id: string, actor: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ id: string; ref: string }>`select id, ref from ops_orders where id = ${id} or ref = ${id}`;
  const order = rows[0];
  if (!order) throw new Error("Commande introuvable.");
  const quotes = await sql<{ status: string }>`select status from ops_quotes where order_ref = ${order.ref}`;
  if (quotes.some((quote) => quote.status === "Devis signé")) {
    throw new Error("Un devis signé est lié à cette commande. Il ne se supprime pas avec elle.");
  }
  const bills = await sql<{ status: string; kind: string }>`select status, kind from ops_invoices where order_ref = ${order.ref}`;
  if (bills.some((bill) => bill.status !== "Brouillon" || bill.kind === "credit")) {
    throw new Error("Cette commande a une facture ou un avoir finalisé. Annulez la facture par un avoir, ne l’effacez pas avec la commande.");
  }
  await sql`delete from ops_quotes where order_ref = ${order.ref}`;
  await sql`delete from ops_invoices where order_ref = ${order.ref} and status = ${"Brouillon"}`;
  await sql`delete from ops_documents where order_ref = ${order.ref}`;
  await sql`delete from ops_orders where id = ${order.id}`;
  await log(sql, actor, "Commande supprimée", order.ref);
}

export function listCatalog() {
  return remembered("catalog", listCatalogNow);
}

async function listCatalogNow() {
  await ensureOps();
  const sql = await getSql();
  const quotes = await sql<{ id: string; number: string; label: string }>`
    select id, number, coalesce(nullif(client_company, ''), client_name, '') as label from ops_quotes`;
  const invoices = await sql<{ id: string; number: string; label: string; kind: string }>`
    select id, number, coalesce(nullif(client_company, ''), client_name, '') as label, kind from ops_invoices`;
  return [
    ...quotes.map((row) => ({ id: row.id, kind: "devis" as const, number: row.number, label: row.label || "" })),
    ...invoices.map((row) => ({
      id: row.id,
      kind: (row.kind === "credit" ? "avoir" : "facture") as "avoir" | "facture",
      number: row.number,
      label: row.label || "",
    })),
  ];
}

export function listQuotes() {
  return remembered("quotes", listQuotesNow);
}

async function listQuotesNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<Parameters<typeof mapQuote>[0]>`select id, number, order_ref, client_name, amount_cents, issued_on, status, lang, currency, incoterm, port, validity_days, deposit_bps, goods_bps, freight_bps, font, lines_json, email_subject, email_body, client_email, client_user_id, client_company, client_address, client_vat, client_country, client_siren, client_siret, client_naf, signer_name, signed_at, sign_meta from ops_quotes order by issued_on desc`;
  return rows.map((row) => {
    const quote = mapQuote({ ...row, lines_json: withoutInlineImages(row.lines_json) });
    return {
      ...quote,
      signatureImage: "",
      lines: quote.lines.map((line) => (line.image || line.images?.length ? { ...line, image: "", images: [] } : line)),
    };
  });
}

export async function getQuote(id: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<Parameters<typeof mapQuote>[0]>`select id, number, order_ref, client_name, amount_cents, issued_on, status, lang, currency, incoterm, port, validity_days, deposit_bps, goods_bps, freight_bps, font, lines_json, email_subject, email_body, client_email, client_user_id, client_company, client_address, client_vat, client_country, client_siren, client_siret, client_naf, signer_name, signed_at, signature_image, sign_meta from ops_quotes where id = ${id} or number = ${id} order by (id = ${id}) desc limit 1`;
  return rows[0] ? mapQuote(rows[0]) : null;
}

export async function saveQuote(quote: OpsQuote, actor: string) {
  const sql = await getSql();
  const current = await sql<{ status: string }>`select status from ops_quotes where id = ${quote.id}`;
  if (!current[0]) throw new Error("Devis introuvable.");
  const locked = current[0].status === "Devis signé" || current[0].status === "Devis refusé";
  if (locked) throw new Error("Ce devis est finalisé. Il ne se modifie plus.");
  const status = quote.status;
  const lines = pricedLines(quote.lines, quote.goodsBps);
  const math = quoteMath(lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  await sql`update ops_quotes set
    order_ref = ${quote.orderRef}, client_name = ${quote.clientName}, amount_cents = ${math.totalCents},
    status = ${status}, lang = ${quote.lang}, currency = ${quote.currency}, incoterm = ${quote.incoterm},
    port = ${quote.port}, validity_days = ${quote.validityDays}, deposit_bps = ${quote.depositBps},
    goods_bps = ${quote.goodsBps}, freight_bps = ${quote.freightBps}, font = ${quote.font || "onest"}, lines_json = ${JSON.stringify(lines)},
    email_subject = ${quote.emailSubject}, email_body = ${quote.emailBody}, client_email = ${quote.clientEmail || ""},
    client_user_id = ${quote.clientUserId || ""}, client_company = ${quote.clientCompany || ""},
    client_address = ${quote.clientAddress || ""}, client_vat = ${quote.clientVat || ""}, client_country = ${quote.clientCountry || ""},
    client_siren = ${quote.clientSiren || ""}, client_siret = ${quote.clientSiret || ""}, client_naf = ${quote.clientNaf || ""}
    where id = ${quote.id}`;
  if (quote.clientUserId) {
    try {
      await writeClientAccount(sql, quote);
    } catch (error) {
      console.error("quote-client", error);
    }
  }
  await log(sql, actor, status === "Brouillon" ? "Brouillon de devis enregistré" : "Devis enregistré", quote.number);
  return {
    ...quote,
    lines,
    status,
    font: quote.font || "onest",
    amountCents: math.totalCents,
    validityDays: Math.max(0, Math.round(Number(quote.validityDays) || 0)),
    goodsBps: Math.max(0, Math.round(Number(quote.goodsBps) || 0)),
    freightBps: Math.max(0, Math.round(Number(quote.freightBps) || 0)),
    depositBps: Math.max(0, Math.round(Number(quote.depositBps) || 0)),
  };
}

async function catchSignedNotices(sql: Sql) {
  const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await sql<{ id: string; number: string; signer_name: string; client_email: string; client_name: string }>`
    select id, number, signer_name, client_email, client_name from ops_quotes
    where status = ${"Devis signé"} and signed_at >= ${since}
      and not exists (
        select 1 from ops_outbox
        where subject = ${"Devis signé : "} || ops_quotes.number
          and to_email = ${"contact@sourcingpick.com"}
          and sent = true
      )`;
  if (!rows.length) return;
  const desks = await sql<{ email: string }>`select email from admin_users where role = ${"admin"} and active = true`;
  const targets = new Set<string>(["contact@sourcingpick.com"]);
  for (const desk of desks) {
    const email = desk.email.trim().toLowerCase();
    if (email.includes("@")) targets.add(email);
  }
  const { deliverMail } = await import("@/lib/mail.server");
  for (const row of rows) {
    const known = await sql<{ id: string }>`select id from ops_journal where object_ref = ${row.number} and action = ${"Devis signé"} limit 1`;
    if (!known[0]) await log(sql, row.signer_name || "Client", "Devis signé", row.number);
    const text = [
      `${row.signer_name || "Le client"} a signé le devis ${row.number}.`,
      `Client : ${row.client_name || "—"} · ${row.client_email || "email non renseigné"}`,
    ].join("\n");
    let officeSent = false;
    for (const to of targets) {
      const sent = await deliverMail(to, `Devis signé : ${row.number}`, text, {
        badge: "DEVIS SIGNÉ",
        title: `${row.number} est signé`,
        ctaLabel: "Ouvrir les devis",
        ctaHref: "https://sourcingpick.com/devis",
      });
      if (to === "contact@sourcingpick.com") officeSent = sent;
    }
    await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
      values (${uid("mail")}, ${row.id}, ${"contact@sourcingpick.com"}, ${"Devis signé : " + row.number}, ${text}, ${officeSent})`;
  }
}

async function repairQuoteNumbers(sql: Sql) {
  const rows = await sql<{ id: string; number: string }>`select id, number from ops_quotes`;
  const year = new Date().getFullYear();
  const parsed = rows.flatMap((row) => {
    const match = String(row.number).match(/(20\d{2})-(\d+)$/);
    if (!match || Number(match[1]) !== year) return [];
    return [{ id: row.id, number: row.number, seq: Number(match[2]) }];
  });
  const low = parsed.filter((row) => row.seq < 100);
  const high = parsed.filter((row) => row.seq >= 100).sort((a, b) => a.seq - b.seq);
  let next = low.reduce((max, row) => Math.max(max, row.seq), 0);
  for (const row of high) {
    next += 1;
    const number = `DV-${year}-${String(next).padStart(4, "0")}`;
    if (number === row.number) continue;
    await sql`update ops_quotes set number = ${number} where id = ${row.id}`;
    await sql`update ops_invoices set lines_json = replace(lines_json, ${row.number}, ${number}) where lines_json like ${"%" + row.number + "%"}`;
    await sql`update ops_journal set object_ref = ${number} where object_ref = ${row.number}`;
  }
}

async function nextQuoteNumber(sql: Sql) {
  const rows = await sql<{ number: string }>`select number from ops_quotes`;
  const year = new Date().getFullYear();
  let max = 0;
  for (const row of rows) {
    const match = String(row.number).match(/(20\d{2})-(\d+)$/);
    if (match && Number(match[1]) === year) max = Math.max(max, Number(match[2]));
  }
  return `DV-${year}-${String(max + 1).padStart(4, "0")}`;
}

export async function createQuote(actor: string) {
  await ensureOps();
  const sql = await getSql();
  const settings = await readSettings();
  const id = uid("q");
  const number = await nextQuoteNumber(sql);
  const today = new Date().toISOString().slice(0, 10);
  await sql`insert into ops_quotes (
    id, number, client_name, amount_cents, issued_on, status, validity_days, deposit_bps, goods_bps, freight_bps,
    email_subject, email_body
  ) values (
    ${id}, ${number}, ${""}, 0, ${today}, ${"Brouillon"}, ${settings.validityDays}, ${settings.depositBps},
    ${settings.goodsBps}, ${settings.freightBps}, ${""}, ${""}
  )`;
  await log(sql, actor, "Nouveau devis", number);
  return getQuote(id);
}

export async function sendQuote(id: string, actor: string) {
  const sql = await getSql();
  const quote = await getQuote(id);
  if (!quote) throw new Error("Devis introuvable.");
  await sql`update ops_quotes set status = ${"Devis envoyé"} where id = ${id}`;
  if (quote.orderRef) {
    await sql`update ops_orders set state = ${"Devis envoyé"}, substate = ${"Devis envoyé"}, updated_at = now() where ref = ${quote.orderRef}`;
  }
  await log(sql, actor, "Devis envoyé", quote.number);
  if (quote.orderRef) {
    await fileDoc(sql, quote.clientName, "Devis, factures et avoirs", `Devis ${quote.number}`, quote.orderRef);
    await tell(sql, quote.orderRef, actor, `Le devis ${quote.number} est disponible. Vous pouvez le signer dans Facturation.`);
  }
}

async function nextInvoiceNumber(sql: Sql) {
  const rows = await sql<{ number: string }>`select number from ops_invoices where number like ${"SP-FA-%"}`;
  const year = new Date().getFullYear();
  let max = 0;
  for (const row of rows) {
    const match = String(row.number).match(/(\d{4})-(\d+)$/);
    if (match && Number(match[1]) === year) max = Math.max(max, Number(match[2]));
  }
  return `SP-FA-${year}-${String(max + 1).padStart(3, "0")}`;
}

export async function createDepositInvoice(id: string, actor: string) {
  const sql = await getSql();
  const quote = await getQuote(id);
  if (!quote) throw new Error("Devis introuvable.");
  const linked = await sql<{ deposit_invoice_id: string }>`select deposit_invoice_id from ops_quotes where id = ${id}`;
  if (linked[0]?.deposit_invoice_id) {
    const alive = await sql<{ id: string }>`select id from ops_invoices where id = ${linked[0].deposit_invoice_id} and status <> ${"Annulée"}`;
    if (alive[0]) return alive[0].id;
  }
  if (quote.orderRef) {
    const existing = await sql<{ id: string }>`select id from ops_invoices where order_ref = ${quote.orderRef} and kind = ${"deposit"} and status <> ${"Annulée"} order by number desc limit 1`;
    if (existing[0]) {
      await sql`update ops_quotes set deposit_invoice_id = ${existing[0].id} where id = ${id} and (deposit_invoice_id is null or deposit_invoice_id = ${""})`;
      return existing[0].id;
    }
  }
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  if (math.depositCents <= 0) throw new Error("Ce devis n’a pas d’acompte. Le pourcentage d’acompte est à zéro, la facture d’acompte ne reprend pas le montant total.");
  const number = await nextInvoiceNumber(sql);
  const invoiceId = uid("inv");
  const issued = new Date().toISOString().slice(0, 10);
  const due = DUE_ON_RECEIPT;
  const lines = JSON.stringify([
    { id: uid("ln"), kind: "service", title: `Acompte du devis ${quote.number}`, details: quote.number, qty: 1, unitCents: math.depositCents },
  ]);
  await sql`insert into ops_invoices (id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat, client_siren, client_siret, client_naf, amount_cents, method, status, lines_json, issued_on, kind, due_on, reminders_on, lang)
    values (${invoiceId}, ${number}, ${quote.orderRef}, ${quote.clientName}, ${quote.clientUserId || ""}, ${quote.clientEmail || ""}, ${quote.clientCompany || ""}, ${quote.clientAddress || ""}, ${quote.clientVat || ""}, ${quote.clientSiren || ""}, ${quote.clientSiret || ""}, ${quote.clientNaf || ""}, ${math.depositCents}, ${"Wise"}, ${"À régler"}, ${lines}, ${issued}, ${"deposit"}, ${due}, true, ${quote.lang === "en" ? "en" : "fr"})`;
  if (quote.orderRef) {
    await sql`update ops_orders set state = ${"Paiement en attente"}, substate = ${"Facture d’acompte émise"}, updated_at = now() where ref = ${quote.orderRef}`;
  }
  try {
    await log(sql, actor, "Facture d’acompte", number);
    await fileDoc(sql, quote.clientName, "Devis, factures et avoirs", `Facture d’acompte ${number}`, quote.orderRef);
    await tell(sql, quote.orderRef, actor, `La facture d’acompte ${number} est dans votre espace. Elle est payable à réception.`);
  } catch (error) {
    console.error("deposit-side", error instanceof Error ? error.message : error);
  }
  return invoiceId;
}

export async function createQuoteBill(id: string, actor: string, mode: "deposit" | "balance" | "full") {
  const quote = await getQuote(id);
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status !== "Devis signé") {
    throw new Error("Finalisez le devis d’abord. Envoyez-le : le client confirme son email, reçoit un code, puis signe. La facture se crée après la signature.");
  }
  if (mode === "deposit") {
    const created = await createDepositInvoice(id, actor);
    const sql = await getSql();
    await sql`update ops_quotes set deposit_invoice_id = ${created} where id = ${id}`;
    return created;
  }
  const sql = await getSql();
  if (mode === "balance") {
    const linked = await sql<{ deposit_invoice_id: string }>`select deposit_invoice_id from ops_quotes where id = ${id}`;
    const deposits = await sql<{ id: string }>`
      select id from ops_invoices
      where kind = ${"deposit"} and status <> ${"Annulée"}
        and (
          id = ${linked[0]?.deposit_invoice_id || ""}
          or (${quote.orderRef} <> '' and order_ref = ${quote.orderRef})
          or lines_json like ${"%" + quote.number + "%"}
        )
      limit 1`;
    if (!deposits[0]) throw new Error("La facture de solde n’est disponible qu’après une facture d’acompte.");
  }
  const kind = mode === "balance" ? "balance" : "standard";
  const prior = await sql<{ id: string; lines_json: string; order_ref: string; client_user_id: string }>`
    select id, lines_json, order_ref, client_user_id from ops_invoices where kind = ${kind} and status <> ${"Annulée"}`;
  const already = prior.find((row) => {
    const sameOrder = Boolean(quote.orderRef) && row.order_ref === quote.orderRef;
    const sameClient = !quote.orderRef && Boolean(quote.clientUserId) && row.client_user_id === quote.clientUserId;
    return (sameOrder || sameClient) && String(row.lines_json).includes(quote.number);
  });
  if (already) return already.id;
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  const amount = mode === "balance" ? math.balanceCents : math.totalCents;
  if (amount <= 0) throw new Error(mode === "balance" ? "Il n’y a pas de solde à facturer." : "Le devis n’a pas de montant.");
  const number = await nextInvoiceNumber(sql);
  const invoiceId = uid("inv");
  const issued = new Date().toISOString().slice(0, 10);
  const title = mode === "balance" ? `Solde du devis ${quote.number}` : `Facture intégrale ${quote.number}`;
  const lines = JSON.stringify([{ id: uid("ln"), kind: "service", title, details: "", qty: 1, unitCents: amount }]);
  await sql`insert into ops_invoices (id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat, client_siren, client_siret, client_naf, amount_cents, method, status, lines_json, issued_on, kind, due_on, reminders_on, lang)
    values (${invoiceId}, ${number}, ${quote.orderRef}, ${quote.clientName}, ${quote.clientUserId || ""}, ${quote.clientEmail || ""}, ${quote.clientCompany || ""}, ${quote.clientAddress || ""}, ${quote.clientVat || ""}, ${quote.clientSiren || ""}, ${quote.clientSiret || ""}, ${quote.clientNaf || ""}, ${amount}, ${"Virement"}, ${"Brouillon"}, ${lines}, ${issued}, ${mode === "balance" ? "balance" : "standard"}, ${DUE_ON_RECEIPT}, true, ${quote.lang === "en" ? "en" : "fr"})`;
  await log(sql, actor, mode === "balance" ? "Facture de solde" : "Facture intégrale", number);
  await fileDoc(sql, quote.clientName, "Devis, factures et avoirs", `${title} ${number}`, quote.orderRef || quote.number);
  return invoiceId;
}

type InvoiceRow = {
  id: string;
  number: string;
  order_ref: string;
  client_name: string;
  client_user_id: string;
  client_email: string;
  client_company: string;
  client_address: string;
  client_vat: string;
  client_siren: string;
  client_siret: string;
  client_naf: string;
  amount_cents: number;
  method: string;
  received_on: string;
  issued_on: string;
  status: string;
  received_cents: number | null;
  fees_cents: number;
  lines_json: string;
  kind: string;
  due_on: string;
  reminders_on: boolean;
  reminder_level: number;
  reminder_on: string;
  series_id: string;
  lang: string;
};

function mapInvoice(row: InvoiceRow): OpsInvoice {
  return {
    id: row.id,
    number: row.number,
    orderRef: row.order_ref,
    clientName: row.client_name || "",
    clientUserId: row.client_user_id || "",
    clientEmail: row.client_email || "",
    clientCompany: row.client_company || "",
    clientAddress: row.client_address || "",
    clientVat: row.client_vat || "",
    clientSiren: row.client_siren || "",
    clientSiret: row.client_siret || "",
    clientNaf: row.client_naf || "",
    lines: readInvoiceLines(row.lines_json, Number(row.amount_cents)),
    amountCents: Number(row.amount_cents),
    method: row.method,
    issuedOn: row.issued_on || "",
    receivedOn: row.received_on,
    status: row.status,
    receivedCents: row.received_cents == null ? null : Number(row.received_cents),
    feesCents: Number(row.fees_cents),
    kind: row.kind || "standard",
    dueOn: row.due_on || "",
    remindersOn: Boolean(row.reminders_on),
    reminderLevel: Number(row.reminder_level) || 0,
    reminderOn: row.reminder_on || "",
    seriesId: row.series_id || "",
    lang: row.lang === "en" ? "en" : "fr",
  };
}

export function listInvoices() {
  return remembered("invoices", listInvoicesNow);
}

async function listInvoicesNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<InvoiceRow>`select id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat, client_siren, client_siret, client_naf, amount_cents, method, received_on, issued_on, status, received_cents, fees_cents, lines_json, kind, due_on, reminders_on, reminder_level, reminder_on, series_id, lang from ops_invoices order by number desc`;
  return rows.map((row) => {
    const invoice = mapInvoice({ ...row, lines_json: withoutInlineImages(row.lines_json) });
    return { ...invoice, lines: invoice.lines.map((line) => (line.image || line.images?.length ? { ...line, image: "", images: [] } : line)) };
  });
}

export async function getInvoice(id: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<InvoiceRow>`select id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat, client_siren, client_siret, client_naf, amount_cents, method, received_on, issued_on, status, received_cents, fees_cents, lines_json, kind, due_on, reminders_on, reminder_level, reminder_on, series_id, lang from ops_invoices where id = ${id} or number = ${id} order by (id = ${id}) desc limit 1`;
  return rows[0] ? mapInvoice(rows[0]) : null;
}

function readInvoiceLines(raw: string, fallbackCents: number): QuoteLine[] {
  try {
    const parsed = JSON.parse(raw || "[]") as QuoteLine[];
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((item) => ({
        id: String(item.id || uid("ln")),
        kind: lineKind(item.kind),
        title: String(item.title ?? ""),
        details: String(item.details ?? ""),
        qty: Number(item.qty) || 0,
        unitCents: Math.round(Number(item.unitCents) || 0),
        rateBps: Math.max(0, Math.round(Number(item.rateBps) || 0)),
        ...packImages(item),
      }));
    }
  } catch {
    /* une ancienne facture n’a pas encore de lignes */
  }
  if (!fallbackCents) return [];
  return [{ id: "ln_acompte", kind: "service", title: "Acompte à la commande", details: "", qty: 1, unitCents: fallbackCents }];
}

export async function sendInvoiceCopy(id: string, actor: string, message: string, to = "", subject = "") {
  await ensureOps();
  const invoice = await getInvoice(id);
  if (!invoice) throw new Error("Facture introuvable.");
  const recipients = String(to || invoice.clientEmail || "")
    .split(/[,\s;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item, index, all) => item.includes("@") && all.indexOf(item) === index);
  if (!recipients.length) throw new Error("Indiquez au moins un email de destinataire.");
  const sql = await getSql();
  const bankRows = await sql<{ beneficiary: string; iban: string; swift: string; bank: string }>`
    select beneficiary, iban, swift, bank from ops_settings where id = 'main'`;
  const bank = bankRows[0];
  const money = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const due = duePhrase(invoice.dueOn, invoice.lang === "en");
  const who = invoice.clientCompany || invoice.clientName;
  const letterSubject = (subject || `Votre facture ${invoice.number}`).slice(0, 180);
  const facts = [
    message.trim() || `Bonjour,\n\nVeuillez trouver votre facture ${invoice.number}.`,
    "",
    `${who || ""}${invoice.clientAddress ? `\n${invoice.clientAddress}` : ""}${invoice.clientSiret ? `\nSIRET ${invoice.clientSiret}` : ""}`,
    due ? `Échéance ${due}` : "Échéance à réception",
    invoice.lines
      .filter((line) => line.title.trim())
      .map((line) => `• ${line.title} — ${line.qty} × ${money(line.unitCents)}`)
      .join("\n"),
    bank?.iban ? `Virement\n${bank.beneficiary}\nIBAN ${bank.iban}\nBIC ${bank.swift}\n${bank.bank}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const { deliverMail, mailError } = await import("@/lib/mail.server");
  let sent = false;
  let failure = "";
  for (const email of recipients) {
    const ok = await deliverMail(email, letterSubject, facts, {
      badge: /acompte/i.test(letterSubject) ? "ACOMPTE" : "FACTURE",
      title: letterSubject,
      amount: money(invoice.amountCents),
      amountLabel: "Montant",
      ctaLabel: "Ouvrir mes factures",
      ctaHref: "https://sourcingpick.com/espace/facturation",
    });
    sent = sent || ok;
    if (!ok) failure = mailError();
    await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
      values (${uid("mail")}, ${invoice.id}, ${email}, ${letterSubject}, ${facts}, ${ok})`;
  }
  if (sent && invoice.status === "Brouillon") {
    await sql`update ops_invoices set status = ${"À régler"}, client_email = ${recipients[0]} where id = ${invoice.id}`;
  }
  await log(sql, actor, sent ? "Facture envoyée par email" : "Échec d’envoi de facture", invoice.number);
  if (!sent) throw new Error(failure || "L’email n’est pas parti.");
  return { email: recipients.join(", ") };
}

export async function markInvoicePaid(id: string, method: string, receivedOn: string, receivedCents: number, feesCents: number, actor: string) {
  const sql = await getSql();
  const current = await sql<{ status: string; kind: string; amount_cents: number; received_cents: number | null }>`select status, kind, amount_cents, received_cents from ops_invoices where id = ${id}`;
  if (!current[0]) throw new Error("Facture introuvable.");
  if (current[0].status === "Brouillon") throw new Error("Envoyez d’abord la facture. On n’encaisse pas un brouillon.");
  if (current[0].status === "Payée") throw new Error("Cette facture est déjà payée.");
  if (current[0].status === "Annulée" || current[0].kind === "credit") throw new Error("Cette pièce est annulée ou c’est un avoir. On ne l’encaisse pas.");
  if (receivedCents <= 0) throw new Error("Indiquez le montant reçu.");
  const settled = receivedCents >= Number(current[0].amount_cents);
  const nextStatus = settled ? "Payée" : current[0].status;
  const rows = await sql<{ number: string; order_ref: string; kind: string; amount_cents: number }>`update ops_invoices set
    status = ${nextStatus}, method = ${method}, received_on = ${receivedOn}, received_cents = ${receivedCents}, fees_cents = ${feesCents}
    where id = ${id} returning number, order_ref, kind, amount_cents`;
  const invoice = rows[0];
  if (!invoice) throw new Error("Facture introuvable.");
  if (invoice.order_ref && invoice.kind === "deposit" && settled) {
    await sql`update ops_orders set state = ${"Paiement reçu"}, substate = ${"Acompte encaissé"}, updated_at = now() where ref = ${invoice.order_ref} and state in (${"Paiement en attente"}, ${"Devis envoyé"})`;
  }
  const delta = receivedCents - (Number(current[0].received_cents) || 0);
  if (delta !== 0) await sql`update ops_settings set month_cents = month_cents + ${delta} where id = 'main'`;
  await log(sql, actor, receivedCents < Number(invoice.amount_cents) ? "Paiement partiel encaissé" : "Paiement encaissé", invoice.number);
  await tell(sql, invoice.order_ref, actor, `Nous avons reçu ${receivedCents / 100} € pour ${invoice.number}.`);
}

export function listDocuments() {
  return remembered("documents", listDocumentsNow);
}

async function listDocumentsNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    client_name: string;
    category: string;
    title: string;
    order_ref: string;
    issued_on: string;
    file_name: string;
    mime: string;
    byte_size: number;
    sign_status: string;
    sign_email: string;
    signer_name: string;
  }>`select d.id, d.client_name, d.category, d.title, d.order_ref, d.issued_on, d.file_name, d.mime, d.byte_size,
      coalesce(s.status, '') as sign_status, coalesce(s.email, '') as sign_email, coalesce(s.signer_name, '') as signer_name
    from ops_documents d
    left join ops_doc_signs s on s.document_id = d.id
    order by d.issued_on desc`;
  return rows.map(
    (row): OpsDocument => ({
      id: row.id,
      clientName: row.client_name || "",
      category: row.category,
      title: row.title,
      orderRef: row.order_ref,
      issuedOn: row.issued_on || "",
      fileName: row.file_name || "",
      mime: row.mime || "",
      byteSize: Number(row.byte_size) || 0,
      signStatus: row.sign_status || "",
      signEmail: row.sign_email || "",
      signerName: row.signer_name || "",
    }),
  );
}

export async function addDocument(doc: Omit<OpsDocument, "id" | "byteSize" | "signStatus" | "signEmail" | "signerName"> & { fileBase64?: string }, actor: string) {
  const sql = await getSql();
  const id = uid("doc");
  const byteSize = doc.fileBase64 ? await writeUpload(id, doc.fileBase64) : 0;
  await sql`insert into ops_documents (id, client_name, category, title, order_ref, issued_on, file_name, mime, byte_size)
    values (${id}, ${doc.clientName}, ${doc.category}, ${doc.title}, ${doc.orderRef}, ${doc.issuedOn}, ${doc.fileName || ""}, ${doc.mime || ""}, ${byteSize})`;
  await log(sql, actor, doc.orderRef ? `Document ajouté — ${doc.title}` : "Document ajouté", doc.orderRef || doc.title);
  if (doc.orderRef) {
    const photo = /photo|vidéo|video/i.test(`${doc.category} ${doc.title}`);
    await tell(
      sql,
      doc.orderRef,
      actor,
      photo ? `${doc.title} est visible dans les photos de votre commande.` : `Nouveau document : ${doc.title}.`,
    );
  }
  return id;
}

export async function listEmails() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; category: string; trigger_label: string; subject: string; body: string }>`
    select id, name, category, trigger_label, subject, body from ops_emails order by name`;
  const { DESIGNED_EMAILS } = await import("@/lib/mail-templates");
  const rank = new Map(DESIGNED_EMAILS.map((item, index) => [item[0], index]));
  return rows
    .map(
      (row): OpsEmail => ({
        id: row.id,
        name: row.name,
        category: row.category,
        triggerLabel: row.trigger_label,
        subject: row.subject,
        body: row.body,
      }),
    )
    .sort((a, b) => (rank.get(a.name) ?? 99) - (rank.get(b.name) ?? 99) || a.name.localeCompare(b.name, "fr"));
}

export async function saveEmail(email: OpsEmail, actor: string) {
  const sql = await getSql();
  await sql`update ops_emails set subject = ${email.subject}, body = ${email.body} where id = ${email.id}`;
  await log(sql, actor, "Gabarit modifié", email.name);
}

export function listJournal() {
  return remembered("journal", listJournalNow);
}

async function listJournalNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ id: string; at_label: string; actor: string; action: string; object_ref: string }>`
    select id, at_label, actor, action, object_ref from ops_journal order by created_at desc limit 200`;
  return rows.map(
    (row): OpsJournal => ({
      id: row.id,
      atLabel: row.at_label,
      actor: row.actor,
      action: row.action,
      objectRef: row.object_ref,
    }),
  );
}

export function readSettings(): Promise<OpsSettings> {
  return remembered("settings", readSettingsNow);
}

async function readSettingsNow(): Promise<OpsSettings> {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{
    legal_name: string;
    chinese_name: string;
    usci: string;
    address: string;
    representative: string;
    goods_bps: number;
    freight_bps: number;
    deposit_bps: number;
    validity_days: number;
    beneficiary: string;
    iban: string;
    swift: string;
    bank: string;
    month_cents: number;
    prev_month_cents: number;
  }>`select legal_name, chinese_name, usci, address, representative, goods_bps, freight_bps, deposit_bps, validity_days, beneficiary, iban, swift, bank, month_cents, prev_month_cents from ops_settings where id = 'main'`;
  const row = rows[0];
  if (!row) throw new Error("Paramètres absents.");
  return {
    legalName: row.legal_name,
    chineseName: row.chinese_name,
    usci: row.usci,
    address: row.address,
    representative: row.representative,
    goodsBps: Number(row.goods_bps),
    freightBps: Number(row.freight_bps),
    depositBps: Number(row.deposit_bps),
    validityDays: Number(row.validity_days),
    beneficiary: row.beneficiary,
    iban: row.iban,
    swift: row.swift,
    bank: row.bank,
    monthCents: Number(row.month_cents),
    prevMonthCents: Number(row.prev_month_cents),
  };
}

export async function writeSettings(settings: OpsSettings, actor: string) {
  const sql = await getSql();
  await sql`update ops_settings set
    legal_name = ${settings.legalName}, chinese_name = ${settings.chineseName}, usci = ${settings.usci},
    address = ${settings.address}, representative = ${settings.representative}, goods_bps = ${settings.goodsBps},
    freight_bps = ${settings.freightBps}, deposit_bps = ${settings.depositBps}, validity_days = ${settings.validityDays},
    beneficiary = ${settings.beneficiary}, iban = ${settings.iban}, swift = ${settings.swift}, bank = ${settings.bank}
    where id = 'main'`;
  await log(sql, actor, "Paramètres enregistrés", "Société");
}

export function listUsers() {
  return remembered("users", listUsersNow);
}

async function listUsersNow() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
    last_seen: string;
    verification: string;
    active: boolean;
  }>`select id, name, email, role, company, last_seen, verification, active from admin_users order by name`;
  return rows.map(
    (row): OpsUser => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      company: row.company,
      lastSeen: row.last_seen,
      verification: row.verification,
      active: row.active !== false,
    }),
  );
}

export async function inviteAgent(name: string, email: string, actor: string) {
  const sql = await getSql();
  const found = await sql<{ id: string }>`select id from admin_users where email = ${email}`;
  if (found[0]) throw new Error("Cet email a déjà un accès.");
  const password = await hashPassword(crypto.randomUUID());
  const id = uid("usr");
  await sql`insert into admin_users (id, name, email, password_hash, role, active, company, last_seen, verification)
    values (${id}, ${name}, ${email}, ${password}, ${"agent"}, true, ${"Sourcing Pick"}, ${"jamais"}, ${"En attente"})`;
  await log(sql, actor, "Inviter un agent", email);
  return id;
}

export async function setUserActive(id: string, active: boolean, actor: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`update admin_users set active = ${active} where id = ${id} returning email`;
  await log(sql, actor, active ? "Accès rétabli" : "Accès suspendu", rows[0]?.email ?? id);
}

export async function verifyUser(id: string, actor: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`update admin_users set verification = ${"Vérifié"} where id = ${id} returning email`;
  await log(sql, actor, "Vérification validée", rows[0]?.email ?? id);
}

export async function resetUserPassword(id: string, actor: string) {
  const sql = await getSql();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const temporary = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const password = await hashPassword(temporary);
  const rows = await sql<{ email: string }>`update admin_users set password_hash = ${password}, email_verified = true, active = true where id = ${id} returning email`;
  await log(sql, actor, "Mot de passe réinitialisé", rows[0]?.email ?? id);
  return temporary;
}

export async function createBlankInvoice(actor: string) {
  await ensureOps();
  const sql = await getSql();
  const number = await nextInvoiceNumber(sql);
  const invoiceId = uid("inv");
  const today = new Date().toISOString().slice(0, 10);
  const lines = JSON.stringify([{ id: uid("ln"), kind: "service", title: "", details: "", qty: 1, unitCents: 0 }]);
  await sql`insert into ops_invoices (id, number, order_ref, client_name, amount_cents, method, status, received_on, issued_on, lines_json, kind, due_on, reminders_on)
    values (${invoiceId}, ${number}, ${""}, ${""}, 0, ${"Virement"}, ${"Brouillon"}, ${""}, ${today}, ${lines}, ${"standard"}, ${DUE_ON_RECEIPT}, true)`;
  await log(sql, actor, "Facture créée", number);
  return invoiceId;
}

export async function updateInvoice(
  id: string,
  patch: { clientName: string; orderRef: string; amountCents: number; number?: string; clientUserId?: string; clientEmail?: string; clientCompany?: string; clientAddress?: string; clientVat?: string; clientSiren?: string; clientSiret?: string; clientNaf?: string; lines?: QuoteLine[]; dueOn?: string; remindersOn?: boolean; lang?: string },
  actor: string,
) {
  const sql = await getSql();
  const current = await sql<{ status: string; kind: string }>`select status, kind from ops_invoices where id = ${id}`;
  if (!current[0]) throw new Error("Facture introuvable.");
  if (current[0].kind === "credit" || current[0].status === "Annulée") {
    throw new Error("Cette pièce est finalisée. Un avoir ou une facture annulée ne se réécrit pas.");
  }
  if (current[0].status === "Payée") throw new Error("Cette facture est payée. Elle ne se réécrit pas : passez par un avoir.");
  const number = (patch.number || "").trim();
  if (number) {
    const clash = await sql<{ id: string }>`select id from ops_invoices where number = ${number} and id <> ${id}`;
    if (clash[0]) throw new Error("Ce numéro de facture est déjà utilisé.");
  }
  const rows = await sql<{ number: string }>`update ops_invoices set
    number = case when ${number} = '' then number else ${number} end,
    client_name = ${patch.clientName}, order_ref = ${patch.orderRef}, amount_cents = ${patch.amountCents},
    client_user_id = ${patch.clientUserId || ""}, client_email = ${patch.clientEmail || ""},
    client_company = ${patch.clientCompany || ""}, client_address = ${patch.clientAddress || ""}, client_vat = ${patch.clientVat || ""},
    client_siren = ${patch.clientSiren || ""}, client_siret = ${patch.clientSiret || ""}, client_naf = ${patch.clientNaf || ""},
    lines_json = ${JSON.stringify(patch.lines ?? [])},
    lang = ${patch.lang === "en" ? "en" : "fr"},
    due_on = case when ${patch.dueOn == null} then due_on else ${patch.dueOn || ""} end,
    reminders_on = case when ${patch.remindersOn == null} then reminders_on else ${Boolean(patch.remindersOn)} end
    where id = ${id} returning number`;
  if (!rows[0]) throw new Error("Facture introuvable.");
  if (patch.clientUserId) {
    await sql`update admin_users set
      name = case when ${patch.clientName || ""} <> '' then ${patch.clientName} else name end,
      company = case when ${patch.clientCompany || ""} <> '' then ${patch.clientCompany} else company end,
      address = case when ${patch.clientAddress || ""} <> '' then ${patch.clientAddress} else address end,
      vat = case when ${patch.clientVat || ""} <> '' then ${patch.clientVat} else vat end,
      siren = case when ${patch.clientSiren || ""} <> '' then ${patch.clientSiren} else siren end,
      siret = case when ${patch.clientSiret || ""} <> '' then ${patch.clientSiret} else siret end,
      naf = case when ${patch.clientNaf || ""} <> '' then ${patch.clientNaf} else naf end
      where id = ${patch.clientUserId} and role = ${"client"}`;
  }
  await log(sql, actor, "Facture modifiée", rows[0].number);
}

export async function updateUser(id: string, name: string, company: string, actor: string, password?: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`update admin_users set name = ${name}, company = ${company} where id = ${id} returning email`;
  if (!rows[0]) throw new Error("Utilisateur introuvable.");
  if (password && password.length >= 8) {
    const passwordHash = await hashPassword(password);
    await sql`update admin_users set password_hash = ${passwordHash}, email_verified = true, verification = ${"Vérifié"}, active = true where id = ${id}`;
    await log(sql, actor, "Mot de passe modifié", rows[0].email);
  }
  await log(sql, actor, "Fiche modifiée", rows[0].email);
}

export async function createPortalUser(name: string, email: string, role: string, password: string, actor: string) {
  const sql = await getSql();
  const found = await sql<{ id: string }>`select id from admin_users where email = ${email}`;
  if (found[0]) throw new Error("Cet email a déjà un accès.");
  const safeRole = role === "admin" || role === "client" ? role : "agent";
  const passwordHash = await hashPassword(password);
  const id = uid("usr");
  await sql`insert into admin_users (id, name, email, password_hash, role, active, company, last_seen, verification, email_verified)
    values (${id}, ${name}, ${email}, ${passwordHash}, ${safeRole}, true, ${safeRole === "client" ? "" : "Sourcing Pick"}, ${"jamais"}, ${"Vérifié"}, true)`;
  await log(sql, actor, "Compte créé", email);
  return id;
}

export async function remindInvoice(id: string, actor: string) {
  await sendInvoiceReminder(id, actor);
}

export async function listOutbox() {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ id: string; to_email: string; subject: string; sent: boolean; created_at: string }>`
    select id, to_email, subject, sent, created_at::text as created_at from ops_outbox order by created_at desc limit 40`;
  return rows.map((row) => ({
    id: row.id,
    to: row.to_email,
    subject: row.subject,
    sent: Boolean(row.sent),
    at: row.created_at,
  }));
}

export async function deleteUser(id: string, actorId: string, actor: string) {
  if (id === actorId) throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  const sql = await getSql();
  const rows = await sql<{ email: string }>`select email from admin_users where id = ${id}`;
  if (!rows[0]) throw new Error("Utilisateur introuvable.");
  await sql`delete from admin_users where id = ${id}`;
  await log(sql, actor, "Compte supprimé", rows[0].email);
}

export async function createCreditNote(invoiceId: string, actor: string) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice) throw new Error("Facture introuvable.");
  if (invoice.kind === "credit") throw new Error("Un avoir est déjà une écriture. Il ne se supprime pas.");
  const sql = await getSql();
  const link = `Annule ${invoice.number}`;
  const existing = await sql<{ id: string; number: string; amount_cents: number; client_name: string; order_ref: string }>`
    select id, number, amount_cents, client_name, order_ref from ops_invoices where kind = ${"credit"} and method = ${link} limit 1`;
  if (existing[0]) {
    await sql`update ops_invoices set status = ${"Annulée"}, reminders_on = false where id = ${invoice.id} and status <> ${"Annulée"}`;
    return {
      id: existing[0].id,
      number: existing[0].number,
      amountCents: Number(existing[0].amount_cents),
      clientName: existing[0].client_name,
      sourceNumber: invoice.number,
      orderRef: existing[0].order_ref,
    };
  }
  const year = new Date().getFullYear();
  const taken = await sql<{ number: string }>`select number from ops_invoices where number like ${"SP-AV-%"}`;
  let max = 0;
  for (const row of taken) {
    const match = String(row.number).match(/(\d{4})-(\d+)$/);
    if (match && Number(match[1]) === year) max = Math.max(max, Number(match[2]));
  }
  const number = `SP-AV-${year}-${String(max + 1).padStart(3, "0")}`;
  const id = uid("inv");
  const issued = new Date().toISOString().slice(0, 10);
  const lines = JSON.stringify(
    (invoice.lines.length ? invoice.lines : [{ id: "ln_avoir", kind: "service", title: `Avoir sur ${invoice.number}`, details: "", qty: 1, unitCents: invoice.amountCents }]).map((line) => ({
      id: uid("ln"),
      kind: line.kind === "freight" || line.kind === "goods" ? line.kind : "service",
      title: line.title || `Avoir sur ${invoice.number}`,
      details: line.details || `Annule la facture ${invoice.number}`,
      qty: line.qty,
      unitCents: line.unitCents,
    })),
  );
  await sql`insert into ops_invoices (
      id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat,
      client_siren, client_siret, client_naf, amount_cents, method, status, lines_json, issued_on, kind, due_on, reminders_on
    ) values (
      ${id}, ${number}, ${invoice.orderRef}, ${invoice.clientName}, ${invoice.clientUserId || ""}, ${invoice.clientEmail || ""},
      ${invoice.clientCompany || ""}, ${invoice.clientAddress || ""}, ${invoice.clientVat || ""}, ${invoice.clientSiren || ""},
      ${invoice.clientSiret || ""}, ${invoice.clientNaf || ""}, ${invoice.amountCents}, ${link}, ${"Émis"}, ${lines}, ${issued},
      ${"credit"}, ${""}, false
    )`;
  const collected = invoice.receivedCents && invoice.receivedCents > 0
    ? invoice.receivedCents
    : invoice.status === "Payée"
      ? invoice.amountCents
      : 0;
  if (collected > 0) await sql`update ops_settings set month_cents = month_cents - ${collected} where id = 'main'`;
  await sql`update ops_invoices set status = ${"Annulée"}, reminders_on = false where id = ${invoice.id}`;
  await fileDoc(sql, invoice.clientName, "Devis, factures et avoirs", `Avoir ${number}`, invoice.orderRef || invoice.number);
  await log(sql, actor, "Avoir finalisé", `${number} annule ${invoice.number}`);
  if (invoice.orderRef) {
    await tell(sql, invoice.orderRef, actor, `La facture ${invoice.number} est annulée par l’avoir ${number}.`);
  }
  return {
    id,
    number,
    amountCents: invoice.amountCents,
    clientName: invoice.clientName,
    sourceNumber: invoice.number,
    orderRef: invoice.orderRef,
    issuedOn: issued,
    reason: `Annulation de la facture ${invoice.number}.`,
  };
}

function sameParty(company: string, name: string, clientName: string) {
  const target = String(clientName ?? "").trim().toLowerCase();
  const keys = [company, name].map((value) => String(value ?? "").trim().toLowerCase()).filter((value) => value.length > 1);
  return keys.some((key) => {
    if (target === key) return true;
    if (Math.min(key.length, target.length) < 6) return false;
    return target.includes(key) || key.includes(target);
  });
}

async function clientIdentity(userId: string) {
  await ensureOps();
  const sql = await getSql();
  const rows = await sql<{ name: string; email: string; company: string; role: string; address: string; phone: string; otp_sign: boolean }>`
    select name, email, company, role, address, coalesce(phone, '') as phone, otp_sign from admin_users where id = ${userId}`;
  const row = rows[0];
  if (!row || row.role !== "client") throw new Error("Accès refusé.");
  return { name: row.name, email: row.email, company: row.company || "", address: row.address || "", phone: row.phone || "", otpSign: Boolean(row.otp_sign) };
}

export function loadClientPortal(userId: string) {
  return remembered(`portal:${userId}`, () => loadClientPortalNow(userId));
}

async function loadClientPortalNow(userId: string) {
  const identity = await clientIdentity(userId);
  const owns = (clientName: string) => sameParty(identity.company, identity.name, clientName);
  const [orders, quotes, invoices, documents, messages, settings, journal] = await Promise.all([
    listOrders(),
    listQuotes(),
    listInvoices(),
    listDocuments(),
    listInbox(),
    readSettings(),
    listJournal(),
  ]);
  const mine = orders.filter((order) => owns(order.clientName));
  const email = identity.email.toLowerCase();
  const refs = new Set(mine.map((order) => order.ref));
  const visibleQuotes = quotes.filter((quote) => quote.clientUserId === userId || owns(quote.clientName) || owns(quote.clientCompany) || (email && (quote.clientEmail || "").toLowerCase() === email) || refs.has(quote.orderRef));
  for (const quote of visibleQuotes) if (quote.orderRef) refs.add(quote.orderRef);
  const visibleInvoices = invoices.filter((invoice) => invoice.status !== "Brouillon" && (invoice.clientUserId === userId || owns(invoice.clientName) || owns(invoice.clientCompany) || (email && (invoice.clientEmail || "").toLowerCase() === email) || refs.has(invoice.orderRef)));
  for (const invoice of visibleInvoices) if (invoice.orderRef) refs.add(invoice.orderRef);
  const visibleOrders = orders.filter((order) => mine.some((item) => item.id === order.id) || refs.has(order.ref));
  const visibleDocuments = documents.filter((doc) => owns(doc.clientName) || refs.has(doc.orderRef));
  const marks = new Set<string>(refs);
  for (const quote of visibleQuotes) if (quote.number) marks.add(quote.number);
  for (const invoice of visibleInvoices) if (invoice.number) marks.add(invoice.number);
  for (const doc of visibleDocuments) if (doc.title) marks.add(doc.title);
  return {
    name: identity.name,
    email: identity.email,
    phone: identity.phone,
    company: identity.company,
    address: identity.address,
    otpSign: identity.otpSign,
    orders: visibleOrders.map((order) => ({
      ...order,
      internalNote: "",
      substate: publicSubstate(order.state, order.substate, order.internalOnly),
      note: order.note || "",
      internalOnly: false,
    })),
    quotes: visibleQuotes,
    invoices: visibleInvoices,
    documents: visibleDocuments,
    messages: messages.filter((message) => !message.internalOnly && (owns(message.clientName) || refs.has(message.ref))),
    journal: journal.filter((entry) => {
      if (/note interne|qualification enregistrée/i.test(entry.action)) return false;
      return marks.has(entry.objectRef) || [...marks].some((mark) => mark.length > 5 && entry.objectRef.includes(mark));
    }),
    bank: {
      beneficiary: settings.chineseName || settings.beneficiary,
      iban: settings.iban,
      swift: settings.swift,
      bank: settings.bank,
    },
  };
}

async function ownedOrder(userId: string, id: string) {
  const portal = await loadClientPortal(userId);
  const order = portal.orders.find((item) => item.id === id || item.ref === id);
  if (!order) throw new Error("Commande introuvable.");
  return { portal, order };
}

export async function createClientOrder(
  userId: string,
  input: {
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
  },
) {
  const identity = await clientIdentity(userId);
  const sql = await getSql();
  const refs = await sql<{ ref: string }>`select ref from ops_orders`;
  let next = 148;
  for (const row of refs) {
    const match = row.ref.match(/(\d+)$/);
    if (match) next = Math.max(next, Number(match[1]));
  }
  next += 1;
  const year = new Date().getFullYear();
  const ref = `SP-${year}-${String(next).padStart(4, "0")}`;
  const id = uid("ord");
  const clientName = identity.company || identity.name;
  const products = input.products?.length ? input.products : [{ name: input.product, qty: input.qty, note: "" }];
  const product = products.map((row) => row.name).filter(Boolean).join(", ").slice(0, 400) || "Nouvelle demande";
  const phone = (input.phone || identity.phone || "").trim();
  if (phone.replace(/\D/g, "").length < 8) throw new Error("Indiquez un numéro de téléphone.");
  if (phone !== identity.phone) {
    await sql`update admin_users set phone = ${phone} where id = ${userId}`;
  }
  const note = [
    `Email : ${identity.email}`,
    `Téléphone : ${phone}`,
    input.need,
    ...products.map((row) =>
      [
        row.name,
        row.qty,
        row.note,
        row.compare ? `Comparatif : ${row.compare}` : "",
        row.target ? `Prix cible : ${row.target}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    ),
    input.volume,
    input.value,
    input.suppliers && `${input.suppliers} fournisseurs`,
    input.cities,
    input.country,
    input.port,
    input.address,
    input.date,
  ]
    .filter(Boolean)
    .join("\n");
  await sql`insert into ops_orders (id, ref, client_name, product, agent_name, state, substate, note, updated_at)
    values (${id}, ${ref}, ${clientName}, ${product}, ${"Équipe Hangzhou"}, ${"Demande reçue"}, ${"Reçue"}, ${note}, now())`;
  await log(sql, identity.name, "Demande reçue", ref);
  await tell(sql, ref, "Sourcing Pick", `Votre demande ${ref} est bien arrivée. Elle n’est pas encore une commande : elle le devient quand le devis est signé et l’acompte reçu.`);
  for (const file of input.files ?? []) {
    const comma = file.data.indexOf(",");
    const raw = comma >= 0 ? file.data.slice(comma + 1) : file.data;
    const photo = file.mime.startsWith("image/");
    await addDocument(
      {
        clientName,
        category: photo ? "Photos et vidéos" : "Pièces de la demande",
        title: file.name,
        orderRef: ref,
        issuedOn: new Date().toISOString().slice(0, 10),
        fileName: file.name,
        mime: file.mime,
        fileBase64: raw,
      },
      identity.name,
    );
  }
  return { id, ref };
}

export async function clientAttachOrder(
  userId: string,
  orderId: string,
  file: { name: string; mime: string; data: string },
) {
  const { order } = await ownedOrder(userId, orderId);
  const identity = await clientIdentity(userId);
  const comma = file.data.indexOf(",");
  const raw = comma >= 0 ? file.data.slice(comma + 1) : file.data;
  const photo = file.mime.startsWith("image/");
  await addDocument(
    {
      clientName: order.clientName,
      category: photo ? "Photos et vidéos" : "Pièces de la demande",
      title: file.name,
      orderRef: order.ref,
      issuedOn: new Date().toISOString().slice(0, 10),
      fileName: file.name,
      mime: file.mime || "application/octet-stream",
      fileBase64: raw,
    },
    identity.name,
  );
  return { ok: true };
}

export async function createManualOrder(
  input: { clientName: string; product: string; note?: string; agentName?: string },
  actor: string,
) {
  await ensureOps();
  const clientName = input.clientName.trim();
  const product = input.product.trim();
  if (!clientName || !product) throw new Error("Indiquez le client et ce qu’il commande.");
  const sql = await getSql();
  const refs = await sql<{ ref: string }>`select ref from ops_orders`;
  let next = 148;
  for (const row of refs) {
    const match = row.ref.match(/(\d+)$/);
    if (match) next = Math.max(next, Number(match[1]));
  }
  const year = new Date().getFullYear();
  const ref = `SP-${year}-${String(next + 1).padStart(4, "0")}`;
  const id = uid("ord");
  await sql`insert into ops_orders (id, ref, client_name, product, agent_name, state, substate, note, updated_at)
    values (${id}, ${ref}, ${clientName}, ${product}, ${input.agentName?.trim() || "Équipe Hangzhou"}, ${"Demande reçue"}, ${"Reçue"}, ${input.note?.trim() || ""}, now())`;
  await log(sql, actor, "Commande créée", ref);
  return { id, ref };
}

export async function clientPostMessage(userId: string, orderId: string, body: string) {
  const { order } = await ownedOrder(userId, orderId);
  const identity = await clientIdentity(userId);
  await addMessage(order.id, identity.name, body, false, "client");
  return { ok: true };
}

export async function clientSignQuote(userId: string, quoteId: string, signer: string, image = "", code = "") {
  const portal = await loadClientPortal(userId);
  const quote = portal.quotes.find((item) => item.id === quoteId || item.number === quoteId);
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status !== "Devis envoyé") throw new Error("Ce devis n’est plus à signer.");
  const sql = await getSql();
  if (portal.otpSign) {
    const clean = code.replace(/\D/g, "");
    const rows = await sql<{ sign_otp_hash: string; sign_otp_expires: string }>`select sign_otp_hash, sign_otp_expires from admin_users where id = ${userId}`;
    const row = rows[0];
    if (!row?.sign_otp_expires || new Date(row.sign_otp_expires).getTime() < Date.now()) throw new Error("Demandez un nouveau code email.");
    const { createHash, timingSafeEqual } = await import("node:crypto");
    const hash = createHash("sha256").update(`sp-client:${userId}:${clean}`).digest("hex");
    const left = Buffer.from(hash);
    const right = Buffer.from(row.sign_otp_hash);
    if (left.length !== right.length || !timingSafeEqual(left, right)) throw new Error("Code incorrect.");
    await sql`update admin_users set sign_otp_hash = ${""}, sign_otp_expires = ${""} where id = ${userId}`;
  }
  const who = signer || portal.name;
  const signedAt = new Date().toISOString();
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || "";
  const ua = (request?.headers.get("user-agent") || "").slice(0, 240);
  const lang = (request?.headers.get("accept-language") || "").slice(0, 80);
  const place = await placeOf(ip);
  const meta = JSON.stringify({ name: who, email: quote.clientEmail || "", ip, place, ua, lang, at: signedAt });
  await sql`update ops_quotes set status = ${"Devis signé"}, signer_name = ${who}, signed_at = ${signedAt}, signature_image = ${image}, sign_meta = ${meta} where id = ${quote.id}`;
  const { announceSignedQuote } = await import("@/lib/quote-link.server");
  const pack = await announceSignedQuote(quote.id);
  return { ok: true, invoiceId: pack.invoiceId };
}

async function placeOf(ip: string) {
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

export async function clientRefuseQuote(userId: string, quoteId: string) {
  const portal = await loadClientPortal(userId);
  const quote = portal.quotes.find((item) => item.id === quoteId || item.number === quoteId);
  if (!quote) throw new Error("Devis introuvable.");
  if (quote.status !== "Devis envoyé") throw new Error("Ce devis n’est plus à refuser.");
  const sql = await getSql();
  await sql`update ops_quotes set status = ${"Devis refusé"} where id = ${quote.id}`;
  let cancelled = false;
  if (quote.orderRef) {
    const signed = await sql<{ id: string }>`select id from ops_quotes where order_ref = ${quote.orderRef} and status = ${"Devis signé"} limit 1`;
    const paid = await sql<{ id: string }>`select id from ops_invoices where order_ref = ${quote.orderRef} and kind <> ${"credit"} and status = ${"Payée"} limit 1`;
    if (!signed[0] && !paid[0]) {
      const rows = await sql<{ ref: string }>`update ops_orders set state = ${"Annulé"}, substate = ${"Annulé par le client"}, internal_only = false, updated_at = now()
        where ref = ${quote.orderRef} and state not in (${"Expédié"}, ${"En transit"}, ${"Terminé"}) returning ref`;
      cancelled = Boolean(rows[0]);
    }
  }
  await log(sql, portal.name, "Devis refusé", quote.number);
  await tell(
    sql,
    quote.orderRef,
    portal.name,
    cancelled
      ? `Le devis ${quote.number} est refusé. La demande est annulée ; un nouveau devis peut être établi.`
      : `Le devis ${quote.number} est refusé.`,
  );
  return { ok: true };
}

export async function clientDeclareTransfer(userId: string, invoiceId: string) {
  const portal = await loadClientPortal(userId);
  const invoice = portal.invoices.find((item) => item.id === invoiceId || item.number === invoiceId);
  if (!invoice) throw new Error("Facture introuvable.");
  if (invoice.kind === "credit") throw new Error("Un avoir ne se règle pas.");
  if (invoice.status === "Payée") throw new Error("Cette facture est déjà payée.");
  if (invoice.status === "Annulée" || invoice.status === "Brouillon" || invoice.status === "Émis") throw new Error("Cette pièce n’est pas à régler.");
  if (invoice.status === "Virement annoncé") return { ok: true };
  if (invoice.status !== "À régler" && invoice.status !== "En retard") throw new Error("Cette facture n’est pas ouverte au virement.");
  const sql = await getSql();
  await sql`update ops_invoices set status = ${"Virement annoncé"}, method = ${"Virement"} where id = ${invoice.id} and status <> ${"Payée"}`;
  if (invoice.orderRef) {
    await sql`update ops_orders set state = ${"Paiement en attente"}, substate = ${"Virement annoncé"}, internal_only = false, updated_at = now()
      where ref = ${invoice.orderRef} and state in (${"Paiement en attente"}, ${"Devis envoyé"})`;
  }
  await log(sql, portal.name, "Virement annoncé", invoice.number);
  await tell(sql, invoice.orderRef, portal.name, `Virement annoncé pour ${invoice.number}. L’administration le rapproche dès réception.`);
  return { ok: true };
}

export async function clientConsultQuote(userId: string, quoteId: string) {
  const portal = await loadClientPortal(userId);
  const quote = portal.quotes.find((item) => item.id === quoteId || item.number === quoteId);
  if (!quote?.orderRef || quote.status !== "Devis envoyé") return { ok: true };
  const sql = await getSql();
  const rows = await sql<{ ref: string }>`update ops_orders set substate = ${"Devis consulté"}, updated_at = now()
    where ref = ${quote.orderRef} and substate = ${"Devis envoyé"} returning ref`;
  if (rows[0]) await log(sql, portal.name, "Devis consulté", quote.number);
  return { ok: true };
}

export async function clientCancelOrder(userId: string, orderId: string) {
  const { order } = await ownedOrder(userId, orderId);
  if (["Expédié", "En transit", "Terminé", "Annulé"].includes(order.state)) {
    throw new Error("Cette commande ne peut plus être annulée en ligne.");
  }
  const identity = await clientIdentity(userId);
  const sql = await getSql();
  await sql`update ops_orders set state = ${"Annulé"}, substate = ${"Annulé par le client"}, internal_only = false, updated_at = now() where id = ${order.id}`;
  await log(sql, identity.name, "Annulé par le client", order.ref);
  await tell(sql, order.ref, identity.name, `La commande ${order.ref} est annulée. La préparation s’arrête.`);
  return { ok: true };
}

export async function saveClientProfile(userId: string, name: string, company: string, address = "", otpSign = false, phone = "") {
  await clientIdentity(userId);
  const sql = await getSql();
  await sql`update admin_users set name = ${name}, company = ${company}, address = ${address}, otp_sign = ${otpSign}, phone = ${phone.trim().slice(0, 40)} where id = ${userId} and role = 'client'`;
  return { ok: true };
}

export async function changeClientPassword(userId: string, current: string, next: string) {
  const sql = await getSql();
  const rows = await sql<{ password_hash: string }>`select password_hash from admin_users where id = ${userId} and role = 'client'`;
  if (!rows[0] || !(await checkPassword(current, rows[0].password_hash))) throw new Error("Mot de passe actuel incorrect.");
  await sql`update admin_users set password_hash = ${await hashPassword(next)} where id = ${userId}`;
  return { ok: true };
}

export async function sendClientSignCode(userId: string) {
  const identity = await clientIdentity(userId);
  if (!identity.otpSign) return { ok: true, sent: false };
  const { createHash, randomInt } = await import("node:crypto");
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const hash = createHash("sha256").update(`sp-client:${userId}:${code}`).digest("hex");
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const sql = await getSql();
  await sql`update admin_users set sign_otp_hash = ${hash}, sign_otp_expires = ${expires} where id = ${userId}`;
  const { deliverMail, mailError } = await import("@/lib/mail.server");
  const sent = await deliverMail(identity.email, "Votre code Sourcing Pick", `Bonjour,\n\nSaisissez ce code pour confirmer votre signature.`, {
    badge: "CODE DE VÉRIFICATION",
    title: "Votre code de vérification",
    code,
    note: "Ce code expire dans 10 minutes. Ne le communiquez à personne.",
  });
  if (!sent) throw new Error(mailError() || "Le code n’a pas pu être envoyé.");
  return { ok: true, sent: true };
}

export async function clientReadDocument(userId: string, id: string) {
  const portal = await loadClientPortal(userId);
  if (!portal.documents.some((doc) => doc.id === id)) throw new Error("Document introuvable.");
  return readDocumentFile(id);
}

void import("node:fs").then((fs) => {
  if (fs.existsSync("/var/www/sourcingpick-site/mail.env")) {
    void ensureOps().catch((error) => console.error("ops", error));
  }
});
