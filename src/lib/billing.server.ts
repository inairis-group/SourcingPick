import { getSql, type Sql } from "@/lib/db";
import { DUE_ON_RECEIPT, dueAnchor, dueIsReceipt, euros, lineKind, packImages, type OpsCharge, type OpsSeries, type QuoteLine } from "@/lib/ops.shared";

const STEPS = [
  { level: 1, after: 7, label: "Rappel" },
  { level: 2, after: 15, label: "Relance" },
  { level: 3, after: 30, label: "Dernier rappel" },
];

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDays(iso: string, days: number) {
  const date = new Date(`${(iso || todayIso()).slice(0, 10)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftMonths(iso: string, months: number) {
  const [year, month, day] = (iso || todayIso()).slice(0, 10).split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  cursor.setUTCDate(Math.min(day || 1, last));
  return cursor.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from.slice(0, 10)}T12:00:00Z`);
  const end = Date.parse(`${to.slice(0, 10)}T12:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.floor((end - start) / 86400000);
}

function stamp() {
  const date = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(date.getDate())}/${z(date.getMonth() + 1)} ${z(date.getHours())}:${z(date.getMinutes())}`;
}

function cleanLines(lines: QuoteLine[]) {
  return lines.slice(0, 40).map((line) => ({
    id: String(line.id || uid("ln")),
    kind: lineKind(line.kind),
    title: String(line.title ?? "").slice(0, 180),
    details: String(line.details ?? "").slice(0, 8000),
    qty: Number.isFinite(Number(line.qty)) ? Number(line.qty) : 0,
    unitCents: Math.round(Number(line.unitCents) || 0),
    ...packImages(line),
  }));
}

function lineTotal(lines: QuoteLine[]) {
  return lines.reduce((total, line) => total + Math.round(line.qty * line.unitCents), 0);
}

export function billCents(costCents: number, markupBps: number) {
  return Math.round((costCents * (10000 + markupBps)) / 10000);
}

function cadenceOf(value: string): OpsSeries["cadence"] {
  if (value === "quarter" || value === "year") return value;
  return "month";
}

function readLines(raw: string): QuoteLine[] {
  try {
    const parsed = JSON.parse(raw || "[]") as QuoteLine[];
    if (Array.isArray(parsed)) return cleanLines(parsed);
  } catch {
    /* une ancienne ligne vide */
  }
  return [];
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

async function fileDoc(sql: Sql, clientName: string, title: string, orderRef: string) {
  if (!clientName && !orderRef) return;
  await sql`insert into ops_documents (id, client_name, category, title, order_ref, issued_on)
    values (${uid("doc")}, ${clientName}, ${"Devis, factures et avoirs"}, ${title}, ${orderRef}, ${todayIso()})`;
}

async function rememberMail(sql: Sql, to: string, subject: string, body: string, sent: boolean) {
  await sql`insert into ops_outbox (id, quote_id, to_email, subject, body, sent)
    values (${uid("out")}, ${""}, ${to}, ${subject}, ${body}, ${sent})`;
}

export async function ensureBillingSchema(sql: Sql) {
  const statements = [
    `alter table ops_invoices add column if not exists kind text not null default 'standard'`,
    `alter table ops_invoices add column if not exists due_on text not null default ''`,
    `alter table ops_invoices add column if not exists reminders_on boolean not null default false`,
    `alter table ops_invoices add column if not exists reminder_level integer not null default 0`,
    `alter table ops_invoices add column if not exists reminder_on text not null default ''`,
    `alter table ops_invoices add column if not exists series_id text not null default ''`,
    `alter table ops_orders add column if not exists internal_note text not null default ''`,
    `alter table ops_invoices add column if not exists lang text not null default 'fr'`,
    `alter table ops_quotes add column if not exists font text not null default 'onest'`,
    `create table if not exists ops_series (
      id text primary key,
      label text not null default '',
      client_user_id text not null default '',
      client_name text not null default '',
      client_email text not null default '',
      client_company text not null default '',
      client_address text not null default '',
      client_vat text not null default '',
      order_ref text not null default '',
      lines_json text not null default '[]',
      cadence text not null default 'month',
      next_on text not null,
      end_on text not null default '',
      active boolean not null default true,
      last_number text not null default '',
      created_at timestamptz not null default now()
    )`,
    `create table if not exists ops_charges (
      id text primary key,
      supplier text not null default '',
      nature text not null,
      description text not null default '',
      cost_cents integer not null,
      markup_bps integer not null default 0,
      client_user_id text not null default '',
      client_name text not null default '',
      client_email text not null default '',
      client_company text not null default '',
      client_address text not null default '',
      client_vat text not null default '',
      order_ref text not null default '',
      invoice_id text not null default '',
      invoice_number text not null default '',
      status text not null default 'À refacturer',
      incurred_on text not null,
      created_at timestamptz not null default now()
    )`,
  ];
  for (const statement of statements) await sql.query(statement);
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

type Party = {
  clientUserId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  orderRef: string;
};

async function issueInvoice(sql: Sql, party: Party, lines: QuoteLine[], kind: string, seriesId: string, actor: string, action: string) {
  const amount = lineTotal(lines);
  const number = await nextInvoiceNumber(sql);
  const id = uid("inv");
  const issued = todayIso();
  const due = DUE_ON_RECEIPT;
  await sql`insert into ops_invoices (
    id, number, order_ref, client_name, client_user_id, client_email, client_company, client_address, client_vat,
    amount_cents, method, status, lines_json, issued_on, kind, due_on, reminders_on, series_id
  ) values (
    ${id}, ${number}, ${party.orderRef}, ${party.clientName}, ${party.clientUserId}, ${party.clientEmail}, ${party.clientCompany},
    ${party.clientAddress}, ${party.clientVat}, ${amount}, ${"Virement"}, ${"À régler"}, ${JSON.stringify(lines)}, ${issued},
    ${kind}, ${due}, true, ${seriesId}
  )`;
  await log(sql, actor, action, number);
  await fileDoc(sql, party.clientName || party.clientCompany, `Facture ${number}`, party.orderRef);
  if (party.orderRef) {
    await tell(sql, party.orderRef, actor, `La facture ${number} de ${euros(amount)} est dans votre espace. Elle est payable à réception.`);
  }
  return { id, number };
}

type SeriesRow = {
  id: string;
  label: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  client_address: string;
  client_vat: string;
  order_ref: string;
  lines_json: string;
  cadence: string;
  next_on: string;
  end_on: string;
  active: boolean;
  last_number: string;
};

function mapSeries(row: SeriesRow): OpsSeries {
  return {
    id: row.id,
    label: row.label,
    clientUserId: row.client_user_id || "",
    clientName: row.client_name || "",
    clientEmail: row.client_email || "",
    clientCompany: row.client_company || "",
    clientAddress: row.client_address || "",
    clientVat: row.client_vat || "",
    orderRef: row.order_ref || "",
    lines: readLines(row.lines_json),
    cadence: cadenceOf(row.cadence),
    nextOn: row.next_on,
    endOn: row.end_on || "",
    active: row.active !== false,
    lastNumber: row.last_number || "",
  };
}

export async function listSeries() {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const rows = await sql<SeriesRow>`select id, label, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, lines_json, cadence, next_on, end_on, active, last_number
    from ops_series order by next_on`;
  return rows.map(mapSeries);
}

export async function saveSeries(
  input: Omit<OpsSeries, "id" | "lastNumber" | "active"> & { id?: string },
  actor: string,
) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const lines = cleanLines(input.lines).filter((line) => line.title.trim() && line.unitCents);
  if (!lines.length) throw new Error("Ajoutez au moins une ligne avec un montant.");
  if (!input.clientName.trim() && !input.clientCompany.trim()) throw new Error("Choisissez le client à facturer.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.nextOn)) throw new Error("Indiquez la prochaine échéance.");
  const id = input.id || uid("ser");
  const label = input.label.trim() || lines[0].title;
  const cadence = cadenceOf(input.cadence);
  const found = await sql<{ id: string }>`select id from ops_series where id = ${id}`;
  if (found[0]) {
    await sql`update ops_series set
      label = ${label}, client_user_id = ${input.clientUserId}, client_name = ${input.clientName}, client_email = ${input.clientEmail},
      client_company = ${input.clientCompany}, client_address = ${input.clientAddress}, client_vat = ${input.clientVat},
      order_ref = ${input.orderRef}, lines_json = ${JSON.stringify(lines)}, cadence = ${cadence}, next_on = ${input.nextOn}, end_on = ${input.endOn}
      where id = ${id}`;
  } else {
    await sql`insert into ops_series (
      id, label, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, lines_json, cadence, next_on, end_on, active
    ) values (
      ${id}, ${label}, ${input.clientUserId}, ${input.clientName}, ${input.clientEmail}, ${input.clientCompany}, ${input.clientAddress}, ${input.clientVat},
      ${input.orderRef}, ${JSON.stringify(lines)}, ${cadence}, ${input.nextOn}, ${input.endOn}, true
    )`;
  }
  await log(sql, actor, found[0] ? "Récurrence modifiée" : "Récurrence créée", label);
  return id;
}

export async function setSeriesActive(id: string, active: boolean, actor: string) {
  const sql = await getSql();
  const rows = await sql<{ label: string }>`update ops_series set active = ${active} where id = ${id} returning label`;
  if (!rows[0]) throw new Error("Récurrence introuvable.");
  await log(sql, actor, active ? "Récurrence reprise" : "Récurrence en pause", rows[0].label);
}

async function emitSeries(sql: Sql, series: OpsSeries, actor: string) {
  const lines = series.lines.filter((line) => line.title.trim() && line.qty && line.unitCents);
  if (!lines.length) throw new Error("Cette récurrence n’a pas de ligne facturable.");
  const issued = await issueInvoice(
    sql,
    {
      clientUserId: series.clientUserId,
      clientName: series.clientName,
      clientEmail: series.clientEmail,
      clientCompany: series.clientCompany,
      clientAddress: series.clientAddress,
      clientVat: series.clientVat,
      orderRef: series.orderRef,
    },
    lines,
    "recurring",
    series.id,
    actor,
    "Facture récurrente",
  );
  const months = series.cadence === "year" ? 12 : series.cadence === "quarter" ? 3 : 1;
  const next = shiftMonths(series.nextOn, months);
  const active = !(series.endOn && next > series.endOn);
  await sql`update ops_series set next_on = ${next}, active = ${active}, last_number = ${issued.number} where id = ${series.id}`;
  return issued.id;
}

export async function emitSeriesNow(id: string, actor: string) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const rows = await sql<SeriesRow>`select id, label, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, lines_json, cadence, next_on, end_on, active, last_number
    from ops_series where id = ${id}`;
  if (!rows[0]) throw new Error("Récurrence introuvable.");
  return emitSeries(sql, mapSeries(rows[0]), actor);
}

type ChargeRow = {
  id: string;
  supplier: string;
  nature: string;
  description: string;
  cost_cents: number;
  markup_bps: number;
  client_user_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  client_address: string;
  client_vat: string;
  order_ref: string;
  invoice_id: string;
  invoice_number: string;
  status: string;
  incurred_on: string;
};

function mapCharge(row: ChargeRow): OpsCharge {
  const cost = Number(row.cost_cents) || 0;
  const markup = Number(row.markup_bps) || 0;
  return {
    id: row.id,
    supplier: row.supplier || "",
    nature: row.nature,
    description: row.description || "",
    costCents: cost,
    markupBps: markup,
    billCents: billCents(cost, markup),
    clientUserId: row.client_user_id || "",
    clientName: row.client_name || "",
    clientEmail: row.client_email || "",
    clientCompany: row.client_company || "",
    clientAddress: row.client_address || "",
    clientVat: row.client_vat || "",
    orderRef: row.order_ref || "",
    invoiceId: row.invoice_id || "",
    invoiceNumber: row.invoice_number || "",
    status: row.status,
    incurredOn: row.incurred_on,
  };
}

export async function listCharges() {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const rows = await sql<ChargeRow>`select id, supplier, nature, description, cost_cents, markup_bps, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, invoice_id, invoice_number, status, incurred_on
    from ops_charges order by incurred_on desc, created_at desc`;
  return rows.map(mapCharge);
}

export async function addCharge(
  input: Omit<OpsCharge, "id" | "billCents" | "invoiceId" | "invoiceNumber" | "status">,
  actor: string,
) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  if (input.costCents <= 0) throw new Error("Indiquez le montant avancé.");
  if (!input.nature.trim()) throw new Error("Indiquez la nature du frais.");
  if (!input.clientName.trim() && !input.clientCompany.trim()) throw new Error("Choisissez le client à qui refacturer.");
  const id = uid("chg");
  const markup = Math.min(10000, Math.max(0, Math.round(input.markupBps)));
  await sql`insert into ops_charges (
    id, supplier, nature, description, cost_cents, markup_bps, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, status, incurred_on
  ) values (
    ${id}, ${input.supplier}, ${input.nature}, ${input.description}, ${Math.round(input.costCents)}, ${markup}, ${input.clientUserId}, ${input.clientName},
    ${input.clientEmail}, ${input.clientCompany}, ${input.clientAddress}, ${input.clientVat}, ${input.orderRef}, ${"À refacturer"}, ${input.incurredOn || todayIso()}
  )`;
  await log(sql, actor, "Frais à refacturer", input.nature);
  return id;
}

export async function billCharges(ids: string[], actor: string) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (!unique.length) throw new Error("Cochez au moins un frais.");
  const rows = await sql<ChargeRow>`select id, supplier, nature, description, cost_cents, markup_bps, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, invoice_id, invoice_number, status, incurred_on
    from ops_charges where status = ${"À refacturer"}`;
  const charges = rows.map(mapCharge).filter((charge) => unique.includes(charge.id));
  if (charges.length !== unique.length) throw new Error("Un frais sélectionné est introuvable ou déjà refacturé.");
  const key = (charge: OpsCharge) => charge.clientUserId || charge.clientEmail || charge.clientName;
  if (new Set(charges.map(key)).size > 1) throw new Error("Refacturez un seul client à la fois.");
  const first = charges[0];
  const lines: QuoteLine[] = charges.map((charge) => ({
    id: uid("ln"),
    kind: /fret/i.test(charge.nature) ? "freight" : "service",
    title: `Refacturation — ${charge.nature}`,
    details: [charge.supplier && `Fournisseur : ${charge.supplier}`, charge.description, charge.markupBps ? `Frais avancés, majorés de ${(charge.markupBps / 100).toLocaleString("fr-FR")} %.` : "Frais avancés pour votre compte."]
      .filter(Boolean)
      .join("\n"),
    qty: 1,
    unitCents: charge.billCents,
  }));
  const issued = await issueInvoice(
    sql,
    {
      clientUserId: first.clientUserId,
      clientName: first.clientName,
      clientEmail: first.clientEmail,
      clientCompany: first.clientCompany,
      clientAddress: first.clientAddress,
      clientVat: first.clientVat,
      orderRef: first.orderRef,
    },
    lines,
    "recharge",
    "",
    actor,
    "Facture de refacturation",
  );
  for (const chargeId of unique) {
    await sql`update ops_charges set status = ${"Refacturé"}, invoice_id = ${issued.id}, invoice_number = ${issued.number} where id = ${chargeId}`;
  }
  return issued.id;
}

export async function armOpenReminders(actor: string) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const rows = await sql<{ id: string }>`update ops_invoices set
    reminders_on = true,
    due_on = case when due_on = '' then issued_on else due_on end
    where status not in (${"Payée"}, ${"Annulée"}, ${"Brouillon"}) and coalesce(kind, '') <> ${"credit"} and amount_cents > 0 and client_email like ${"%@%"} and reminders_on = false
    returning id`;
  await log(sql, actor, "Relances activées", `${rows.length} facture(s)`);
  return rows.length;
}

async function bankBlock(sql: Sql) {
  const rows = await sql<{ beneficiary: string; iban: string; swift: string; bank: string }>`
    select beneficiary, iban, swift, bank from ops_settings where id = 'main'`;
  const bank = rows[0];
  if (!bank?.iban) return "Merci d’effectuer le virement selon les coordonnées déjà communiquées.";
  return `Coordonnées de virement\n${bank.beneficiary}\nIBAN ${bank.iban}\nBIC ${bank.swift}\n${bank.bank}`;
}

async function sendReminder(
  sql: Sql,
  invoice: { id: string; number: string; clientEmail: string; clientName: string; amountCents: number; dueOn: string; issuedOn: string; orderRef: string; reminderLevel: number },
  actor: string,
) {
  const email = invoice.clientEmail.trim().toLowerCase();
  if (!email.includes("@")) return false;
  if (!invoice.amountCents) return false;
  const next = Math.min(3, invoice.reminderLevel + 1);
  const step = STEPS.find((item) => item.level === next) ?? STEPS[2];
  const due = dueIsReceipt(invoice.dueOn) ? "à réception" : (invoice.dueOn || invoice.issuedOn || "").split("-").reverse().join("/");
  const subject = `${step.label} · facture ${invoice.number}`;
  const text = [
    `Bonjour${invoice.clientName ? ` ${invoice.clientName}` : ""},`,
    "",
    `La facture ${invoice.number} de ${euros(invoice.amountCents)} (échéance ${due}) n’apparaît pas encore comme réglée.`,
    step.level === 1
      ? "Ceci est un simple rappel. Si le virement est déjà parti, vous pouvez ignorer ce message."
      : step.level === 2
        ? "Nous n’avons toujours pas rapproché ce règlement. Merci de nous confirmer la date et la référence du virement."
        : "Dernier rappel avant de suspendre la suite du dossier. Dites-nous si un délai a été convenu.",
    "",
    await bankBlock(sql),
    "",
    "SourcingPick",
    "contact@sourcingpick.com",
  ].join("\n");
  const { deliverMail } = await import("@/lib/mail.server");
  const sent = await deliverMail(email, subject, text, {
    badge: next >= 3 ? "DERNIER JOUR" : next === 2 ? "RAPPEL · J-1" : "RAPPEL · J-3",
    title: subject,
    amount: euros(invoice.amountCents),
    amountLabel: "Montant dû",
    ctaLabel: "Payer maintenant",
    ctaHref: "https://sourcingpick.com/espace/facturation",
  });
  await rememberMail(sql, email, subject, text, sent);
  if (!sent) return false;
  await sql`update ops_invoices set reminder_level = ${next}, reminder_on = ${todayIso()} where id = ${invoice.id}`;
  await log(sql, actor, `${step.label} envoyé`, invoice.number);
  await tell(sql, invoice.orderRef, "SourcingPick", `${step.label} envoyé pour la facture ${invoice.number}.`);
  return true;
}

export async function sendInvoiceReminder(id: string, actor: string) {
  const sql = await getSql();
  await ensureBillingSchema(sql);
  const rows = await sql<{
    id: string;
    number: string;
    client_email: string;
    client_name: string;
    amount_cents: number;
    due_on: string;
    issued_on: string;
    order_ref: string;
    reminder_level: number;
    status: string;
  }>`select id, number, client_email, client_name, amount_cents, due_on, issued_on, order_ref, reminder_level, status from ops_invoices where id = ${id}`;
  const row = rows[0];
  if (!row) throw new Error("Facture introuvable.");
  if (row.status === "Payée") throw new Error("Cette facture est déjà payée.");
  if (!Number(row.amount_cents)) throw new Error("Indiquez un montant avant de relancer.");
  if (!String(row.client_email || "").includes("@")) throw new Error("Cette facture n’a pas d’email client. Choisissez le compte, enregistrez, puis relancez.");
  const sent = await sendReminder(
    sql,
    {
      id: row.id,
      number: row.number,
      clientEmail: row.client_email,
      clientName: row.client_name,
      amountCents: Number(row.amount_cents),
      dueOn: row.due_on || "",
      issuedOn: row.issued_on || "",
      orderRef: row.order_ref || "",
      reminderLevel: Number(row.reminder_level) || 0,
    },
    actor,
  );
  if (!sent) {
    const { mailError } = await import("@/lib/mail.server");
    throw new Error(mailError() || "La messagerie n’a pas accepté l’envoi.");
  }
}

async function generateDue(sql: Sql, actor: string) {
  const today = todayIso();
  const rows = await sql<SeriesRow>`select id, label, client_user_id, client_name, client_email, client_company, client_address, client_vat, order_ref, lines_json, cadence, next_on, end_on, active, last_number
    from ops_series where active = true and next_on <= ${today}`;
  let created = 0;
  for (const row of rows) {
    const series = mapSeries(row);
    if (series.endOn && series.nextOn > series.endOn) {
      await sql`update ops_series set active = false where id = ${series.id}`;
      continue;
    }
    await emitSeries(sql, series, actor);
    created += 1;
  }
  return created;
}

async function remindDue(sql: Sql, actor: string) {
  const today = todayIso();
  const rows = await sql<{
    id: string;
    number: string;
    client_email: string;
    client_name: string;
    amount_cents: number;
    due_on: string;
    issued_on: string;
    order_ref: string;
    reminder_level: number;
    reminder_on: string;
    status: string;
  }>`select id, number, client_email, client_name, amount_cents, due_on, issued_on, order_ref, reminder_level, reminder_on, status
    from ops_invoices
    where reminders_on = true and status not in (${"Payée"}, ${"Brouillon"}, ${"Annulée"}) and coalesce(kind, '') <> ${"credit"} and amount_cents > 0 and client_email like ${"%@%"}`;
  let reminded = 0;
  let failed = 0;
  for (const row of rows) {
    const due = dueAnchor(row.due_on, row.issued_on);
    if (!due) continue;
    const age = daysBetween(due, today);
    const level = Number(row.reminder_level) || 0;
    const wanted = age >= 30 ? 3 : age >= 15 ? 2 : age >= 7 ? 1 : 0;
    if (wanted <= level) continue;
    if (row.reminder_on && daysBetween(row.reminder_on, today) < 7) continue;
    const sent = await sendReminder(
      sql,
      {
        id: row.id,
        number: row.number,
        clientEmail: row.client_email,
        clientName: row.client_name,
        amountCents: Number(row.amount_cents),
        dueOn: row.due_on || "",
        issuedOn: row.issued_on || "",
        orderRef: row.order_ref || "",
        reminderLevel: level,
      },
      actor,
    );
    if (sent) reminded += 1;
    else failed += 1;
  }
  return { reminded, failed };
}

const billingLock = { current: false };

export async function runBillingCycle(actor: string) {
  if (billingLock.current) return { created: 0, reminded: 0, failed: 0 };
  billingLock.current = true;
  try {
    const sql = await getSql();
    await ensureBillingSchema(sql);
    const created = await generateDue(sql, actor);
    const { reminded, failed } = await remindDue(sql, actor);
    if (created || reminded) await log(sql, actor, "Cycle de facturation", `${created} facture(s), ${reminded} relance(s)`);
    return { created, reminded, failed };
  } finally {
    billingLock.current = false;
  }
}

export function armBilling() {
  const slot = globalThis as typeof globalThis & { __spBillingArmed?: boolean };
  if (slot.__spBillingArmed) return;
  slot.__spBillingArmed = true;
  const tick = () => {
    void runBillingCycle("Automatique").catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("billing", message);
      void import("@/lib/error-log.server").then(({ recordError }) => recordError("facturation", message, error instanceof Error ? error.stack || "" : ""));
    });
  };
  setTimeout(tick, 45_000);
  setInterval(tick, 6 * 60 * 60 * 1000);
}
