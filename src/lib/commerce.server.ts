import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

export type MarketItem = {
  id: string;
  title: string;
  summary: string;
  priceCents: number;
  currency: string;
  status: string;
  kind: string;
  endsAt: string;
  bidCents: number;
  createdAt: string;
  sku: string;
  qty: number;
  location: string;
  clientName: string;
  clientEmail: string;
  stage: string;
  minQty: number;
  carrier: string;
  tracking: string;
};

export type ProductEvent = {
  id: string;
  itemId: string;
  at: string;
  author: string;
  note: string;
  stage: string;
};

export type AuctionBid = {
  id: string;
  itemId: string;
  name: string;
  email: string;
  amountCents: number;
  at: string;
};

export type SiteStats = {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  pages: Array<{ label: string; n: number }>;
  sources: Array<{ label: string; n: number }>;
  countries: Array<{ label: string; n: number }>;
  devices: Array<{ label: string; n: number }>;
  recent: Array<{ at: string; path: string; source: string; country: string; device: string }>;
  reading: Array<{ label: string; views: number; half: number; full: number; seconds: number }>;
  sections: Array<{ label: string; n: number }>;
  mails: { sent: number; accepted: number; opened: number; clicked: number; opens: number; clicks: number };
  mailLog: Array<{ id: string; at: string; to: string; subject: string; accepted: boolean; opens: number; clicks: number; opened: string; clicked: string }>;
};

let ready: Promise<void> | null = null;

async function ensureCommerce() {
  ready ??= (async () => {
    const sql = await getSql();
    await sql`create table if not exists site_hits (
      id text primary key,
      at timestamptz not null default now(),
      path text not null,
      referrer text not null default '',
      source text not null default '',
      medium text not null default '',
      campaign text not null default '',
      country text not null default '',
      device text not null default '',
      visitor text not null default ''
    )`;
    await sql`create index if not exists site_hits_at_idx on site_hits (at desc)`;
    await sql`create table if not exists site_events (
      id text primary key,
      at timestamptz not null default now(),
      path text not null,
      visitor text not null default '',
      kind text not null,
      depth integer not null default 0,
      section text not null default '',
      seconds integer not null default 0
    )`;
    await sql`create index if not exists site_events_at_idx on site_events (at desc)`;
    await sql`create table if not exists market_items (
      id text primary key,
      title text not null,
      summary text not null default '',
      price_cents integer not null default 0,
      currency text not null default 'EUR',
      status text not null default 'draft',
      kind text not null default 'sale',
      ends_at timestamptz,
      bid_cents integer not null default 0,
      created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists auction_bids (
      id text primary key,
      item_id text not null,
      name text not null,
      email text not null,
      amount_cents integer not null,
      at timestamptz not null default now()
    )`;
    await sql`alter table market_items add column if not exists sku text not null default ''`;
    await sql`alter table market_items add column if not exists qty integer not null default 1`;
    await sql`alter table market_items add column if not exists location text not null default ''`;
    await sql`alter table market_items add column if not exists client_name text not null default ''`;
    await sql`alter table market_items add column if not exists client_email text not null default ''`;
    await sql`alter table market_items add column if not exists stage text not null default 'Brouillon'`;
    await sql`alter table market_items add column if not exists min_qty integer not null default 1`;
    await sql`alter table market_items add column if not exists carrier text not null default ''`;
    await sql`alter table market_items add column if not exists tracking text not null default ''`;
    await sql`create table if not exists commerce_settings (
      key text primary key,
      value text not null
    )`;
    await sql`create table if not exists product_events (
      id text primary key,
      item_id text not null,
      at timestamptz not null default now(),
      author text not null default '',
      note text not null default '',
      stage text not null default ''
    )`;
  })().catch((error) => {
    ready = null;
    throw error;
  });
  await ready;
}

function clip(value: string, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

const STAFF_PATH = "^/(admin|agent|devis|factures|avoirs|clients|commandes|demandes|documents|emails|statistiques|journal|logs|parametres|utilisateurs|sessions|agents|paiements|contrats|stock|gestion|imprimer|connexion|inscription|acces|verification|api)(/|$)";

async function isStaffVisit() {
  try {
    const { readSession } = await import("@/lib/admin-auth.server");
    const session = await readSession();
    const role = session.user?.role;
    return role === "admin" || role === "agent";
  } catch {
    return false;
  }
}

function hostOf(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function mapItem(row: {
  id: string;
  title: string;
  summary: string;
  price_cents: number;
  currency: string;
  status: string;
  kind: string;
  ends_at: string | null;
  bid_cents: number;
  created_at: string;
  sku?: string;
  qty?: number;
  location?: string;
  client_name?: string;
  client_email?: string;
  stage?: string;
  min_qty?: number;
  carrier?: string;
  tracking?: string;
}): MarketItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    priceCents: Number(row.price_cents) || 0,
    currency: row.currency || "EUR",
    status: row.status,
    kind: row.kind,
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : "",
    bidCents: Number(row.bid_cents) || 0,
    createdAt: row.created_at,
    sku: row.sku || "",
    qty: Number.isFinite(Number(row.qty)) ? Number(row.qty) : 1,
    location: row.location || "",
    clientName: row.client_name || "",
    clientEmail: row.client_email || "",
    stage: row.stage || "Brouillon",
    minQty: Number.isFinite(Number(row.min_qty)) ? Number(row.min_qty) : 1,
    carrier: row.carrier || "",
    tracking: row.tracking || "",
  };
}

export function euros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((Number(cents) || 0) / 100);
}

export async function recordHit(input: {
  path: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  device: string;
  visitor: string;
}) {
  await ensureCommerce();
  if (await isStaffVisit()) return { ok: true };
  const request = getRequest();
  const country =
    request?.headers.get("cf-ipcountry") ||
    request?.headers.get("x-country-code") ||
    "";
  const referrer = clip(input.referrer, 300);
  const source = clip(input.source, 80) || hostOf(referrer) || "direct";
  const sql = await getSql();
  await sql`insert into site_hits (id, path, referrer, source, medium, campaign, country, device, visitor)
    values (
      ${crypto.randomUUID()},
      ${clip(input.path, 180) || "/"},
      ${referrer},
      ${source},
      ${clip(input.medium, 80)},
      ${clip(input.campaign, 80)},
      ${clip(country, 8)},
      ${clip(input.device, 24) || "inconnu"},
      ${clip(input.visitor, 64)}
    )`;
  return { ok: true };
}

export async function recordEvent(input: { path: string; visitor: string; kind: string; depth: number; section: string; seconds: number }) {
  await ensureCommerce();
  if (await isStaffVisit()) return { ok: true };
  const kind = input.kind === "scroll" || input.kind === "leave" ? input.kind : "";
  if (!kind) return { ok: false };
  const sql = await getSql();
  await sql`insert into site_events (id, path, visitor, kind, depth, section, seconds)
    values (
      ${crypto.randomUUID()},
      ${clip(input.path, 180) || "/"},
      ${clip(input.visitor, 64)},
      ${kind},
      ${Math.max(0, Math.min(100, Math.round(Number(input.depth) || 0)))},
      ${clip(input.section, 120)},
      ${Math.max(0, Math.min(3600, Math.round(Number(input.seconds) || 0)))}
    )`;
  return { ok: true };
}

async function windowCount(days: number) {
  const span = days <= 1 ? "1 day" : days <= 7 ? "7 days" : "30 days";
  const sql = await getSql();
  const rows = await sql<{ views: number; visitors: number }>`
    select count(*)::int as views, count(distinct visitor)::int as visitors
    from site_hits
    where at > now() - ${span}::interval and path !~ ${STAFF_PATH}`;
  return { views: Number(rows[0]?.views) || 0, visitors: Number(rows[0]?.visitors) || 0 };
}

export async function readStats(): Promise<SiteStats> {
  await ensureCommerce();
  const sql = await getSql();
  const [today, week, month, pages, sources, countries, devices, recent, reading, sections] = await Promise.all([
    windowCount(1),
    windowCount(7),
    windowCount(30),
    sql<{ label: string; n: number }>`select path as label, count(*)::int as n from site_hits where at > now() - interval '30 days' and path !~ ${STAFF_PATH} group by path order by n desc limit 12`,
    sql<{ label: string; n: number }>`select source as label, count(*)::int as n from site_hits where at > now() - interval '30 days' and path !~ ${STAFF_PATH} group by source order by n desc limit 12`,
    sql<{ label: string; n: number }>`select coalesce(nullif(country, ''), '—') as label, count(*)::int as n from site_hits where at > now() - interval '30 days' and path !~ ${STAFF_PATH} group by 1 order by n desc limit 12`,
    sql<{ label: string; n: number }>`select device as label, count(*)::int as n from site_hits where at > now() - interval '30 days' and path !~ ${STAFF_PATH} group by device order by n desc limit 6`,
    sql<{ at: string; path: string; source: string; country: string; device: string }>`
      select to_char(at, 'DD/MM HH24:MI') as at, path, source, country, device
      from site_hits where path !~ ${STAFF_PATH} order by site_hits.at desc limit 40`,
    sql<{ label: string; views: number; half: number; full: number; seconds: number }>`
      select path as label,
        count(distinct visitor) filter (where kind = 'scroll' or kind = 'leave')::int as views,
        count(distinct visitor) filter (where kind = 'scroll' and depth >= 50)::int as half,
        count(distinct visitor) filter (where kind = 'scroll' and depth >= 100)::int as full,
        coalesce(round(avg(seconds) filter (where kind = 'leave' and seconds > 0)), 0)::int as seconds
      from site_events
      where at > now() - interval '30 days' and path !~ ${STAFF_PATH}
      group by path
      order by views desc
      limit 12`,
    sql<{ label: string; n: number }>`
      select section as label, count(*)::int as n
      from site_events
      where kind = 'scroll' and section <> '' and at > now() - interval '30 days' and path !~ ${STAFF_PATH}
      group by section
      order by n desc
      limit 12`,
  ]);
  const { listMailMessages, mailSummary } = await import("@/lib/mail-track.server");
  const [mails, mailLog] = await Promise.all([mailSummary(), listMailMessages()]);
  const num = (rows: Array<{ label: string; n: number }>) => rows.map((row) => ({ label: row.label || "—", n: Number(row.n) || 0 }));
  return {
    today,
    week,
    month,
    pages: num(pages),
    sources: num(sources),
    countries: num(countries),
    devices: num(devices),
    recent,
    reading: reading.map((row) => ({
      label: row.label || "/",
      views: Number(row.views) || 0,
      half: Number(row.half) || 0,
      full: Number(row.full) || 0,
      seconds: Number(row.seconds) || 0,
    })),
    sections: num(sections),
    mails,
    mailLog,
  };
}

export async function listItems(kind: "sale" | "auction", liveOnly: boolean) {
  await ensureCommerce();
  await closeDueAuctions();
  const sql = await getSql();
  const rows = liveOnly
    ? await sql<Parameters<typeof mapItem>[0]>`select * from market_items where kind = ${kind} and status = 'live' order by created_at desc`
    : await sql<Parameters<typeof mapItem>[0]>`select * from market_items where kind = ${kind} order by created_at desc`;
  return rows.map(mapItem);
}

export async function saveItem(input: {
  id?: string;
  title: string;
  summary: string;
  priceCents: number;
  status: string;
  kind: "sale" | "auction";
  endsAt?: string;
  sku?: string;
  qty?: number;
  location?: string;
  clientName?: string;
  clientEmail?: string;
  stage?: string;
  minQty?: number;
  author?: string;
}) {
  await ensureCommerce();
  const title = clip(input.title, 140);
  if (title.length < 2) throw new Error("Indiquez un titre.");
  const status = input.status === "live" || input.status === "sold" || input.status === "closed" ? input.status : "draft";
  const stage = clip(input.stage || "", 40) || (status === "live" ? "En ligne" : "Brouillon");
  const id = input.id && /^mkt_[a-z0-9-]+$/i.test(input.id) ? input.id : `mkt_${crypto.randomUUID().slice(0, 8)}`;
  const ends = input.endsAt ? new Date(input.endsAt) : null;
  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from market_items where id = ${id}`;
  const price = Math.max(0, Math.round(input.priceCents));
  const qty = Math.max(0, Math.round(Number(input.qty) || 0));
  const minQty = Math.max(0, Math.round(Number(input.minQty ?? 1)));
  const sku = clip(input.sku || "", 40);
  const location = clip(input.location || "", 80);
  const clientName = clip(input.clientName || "", 120);
  const clientEmail = clip(input.clientEmail || "", 160);
  const summary = clip(input.summary, 2000);
  const endsIso = ends && !Number.isNaN(ends.getTime()) ? ends.toISOString() : null;
  if (existing.length) {
    const prev = await sql<{ stage: string }>`select stage from market_items where id = ${id}`;
    await sql`update market_items set
      title = ${title}, summary = ${summary}, price_cents = ${price}, status = ${status},
      ends_at = ${endsIso}, sku = ${sku}, qty = ${qty}, location = ${location},
      client_name = ${clientName}, client_email = ${clientEmail}, stage = ${stage}, min_qty = ${minQty}
      where id = ${id}`;
    if (stage === "Vendu" && prev[0]?.stage !== "Vendu") {
      await sql`insert into product_events (id, item_id, author, note, stage)
        values (${crypto.randomUUID()}, ${id}, ${clip(input.author || "Admin", 80)}, ${"Vendu. Le lot est dans la file d’expédition."}, ${"Vendu"})`;
    }
  } else {
    await sql`insert into market_items (id, title, summary, price_cents, status, kind, ends_at, bid_cents, sku, qty, location, client_name, client_email, stage, min_qty)
      values (${id}, ${title}, ${summary}, ${price}, ${status}, ${input.kind}, ${endsIso}, ${price}, ${sku}, ${qty}, ${location}, ${clientName}, ${clientEmail}, ${stage}, ${minQty})`;
    await sql`insert into product_events (id, item_id, author, note, stage)
      values (${crypto.randomUUID()}, ${id}, ${clip(input.author || "Admin", 80)}, ${"Fiche créée."}, ${stage})`;
  }
  return { ok: true, id };
}

export async function removeItem(id: string) {
  await ensureCommerce();
  if (!/^mkt_[a-z0-9-]+$/i.test(id)) throw new Error("Annonce invalide.");
  const sql = await getSql();
  await sql`delete from auction_bids where item_id = ${id}`;
  await sql`delete from product_events where item_id = ${id}`;
  await sql`delete from market_items where id = ${id}`;
  return { ok: true };
}

async function closeDueAuctions() {
  const prefs = await readPrefs();
  if (!prefs.autoShip) return;
  const sql = await getSql();
  const due = await sql<{ id: string; bid_cents: number; price_cents: number }>`
    select id, bid_cents, price_cents from market_items
    where kind = 'auction' and status = 'live' and ends_at is not null and ends_at < now()`;
  for (const row of due) {
    const won = Number(row.bid_cents) > Number(row.price_cents);
    const stage = won ? "Vendu" : "Brouillon";
    const status = won ? "sold" : "closed";
    const note = won ? "Enchère clôturée. Le lot rejoint la file d’expédition." : "Enchère close sans offre au-dessus de la mise de départ.";
    await sql`update market_items set status = ${status}, stage = ${stage} where id = ${row.id}`;
    await sql`insert into product_events (id, item_id, author, note, stage)
      values (${crypto.randomUUID()}, ${row.id}, ${"Système"}, ${note}, ${stage})`;
  }
}

export async function readPrefs() {
  await ensureCommerce();
  const sql = await getSql();
  const rows = await sql<{ key: string; value: string }>`select key, value from commerce_settings`;
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const minRaw = map.min_qty;
  return {
    minQty: minRaw === undefined ? 1 : Math.max(0, Math.round(Number(minRaw) || 0)),
    autoShip: map.auto_ship !== "0",
  };
}

export async function savePrefs(input: { minQty: number; autoShip: boolean }) {
  await ensureCommerce();
  const sql = await getSql();
  const minQty = String(Math.max(0, Math.round(Number(input.minQty) || 0)));
  const autoShip = input.autoShip ? "1" : "0";
  await sql`insert into commerce_settings (key, value) values ('min_qty', ${minQty})
    on conflict (key) do update set value = excluded.value`;
  await sql`insert into commerce_settings (key, value) values ('auto_ship', ${autoShip})
    on conflict (key) do update set value = excluded.value`;
  return { ok: true, minQty: Number(minQty), autoShip: input.autoShip };
}

export async function shipItem(input: { id: string; carrier: string; tracking: string; author: string }) {
  await ensureCommerce();
  if (!/^mkt_[a-z0-9-]+$/i.test(input.id)) throw new Error("Produit invalide.");
  const carrier = clip(input.carrier, 80);
  const tracking = clip(input.tracking, 80);
  if (carrier.length < 2 && tracking.length < 3) throw new Error("Indiquez un transporteur ou un numéro de suivi.");
  const sql = await getSql();
  const rows = await sql<{ stage: string; title: string }>`select stage, title from market_items where id = ${input.id}`;
  if (!rows[0]) throw new Error("Produit introuvable.");
  if (rows[0].stage !== "Vendu") throw new Error("Seuls les lots vendus partent en expédition.");
  await sql`update market_items set stage = 'Expédié', status = 'sold', carrier = ${carrier}, tracking = ${tracking} where id = ${input.id}`;
  const note = `Expédié${carrier ? ` · ${carrier}` : ""}${tracking ? ` · ${tracking}` : ""}.`;
  await sql`insert into product_events (id, item_id, author, note, stage)
    values (${crypto.randomUUID()}, ${input.id}, ${clip(input.author, 80)}, ${note}, ${"Expédié"})`;
  return { ok: true };
}

export async function placeBid(input: { itemId: string; name: string; email: string; amountCents: number }) {
  await ensureCommerce();
  const name = clip(input.name, 80);
  const email = clip(input.email, 160).toLowerCase();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Nom et email valides requis.");
  const sql = await getSql();
  const rows = await sql<Parameters<typeof mapItem>[0]>`select * from market_items where id = ${input.itemId} and kind = 'auction' and status = 'live'`;
  const item = rows[0];
  if (!item) throw new Error("Cette enchère n’est pas ouverte.");
  if (item.ends_at && new Date(item.ends_at).getTime() < Date.now()) throw new Error("Cette enchère est terminée.");
  const floor = Math.max(Number(item.bid_cents) || 0, Number(item.price_cents) || 0);
  const amount = Math.round(input.amountCents);
  if (amount <= floor) throw new Error(`L’enchère doit dépasser ${euros(floor)}.`);
  await sql`insert into auction_bids (id, item_id, name, email, amount_cents) values (${crypto.randomUUID()}, ${item.id}, ${name}, ${email}, ${amount})`;
  await sql`update market_items set bid_cents = ${amount}, stage = 'Réservé' where id = ${item.id}`;
  await sql`insert into product_events (id, item_id, author, note, stage)
    values (${crypto.randomUUID()}, ${item.id}, ${name}, ${`Enchère ${euros(amount)} · ${email}`}, ${"Réservé"})`;
  return { ok: true };
}

export async function listBids(itemId: string) {
  await ensureCommerce();
  const sql = await getSql();
  const rows = await sql<{ id: string; item_id: string; name: string; email: string; amount_cents: number; at: string }>`
    select id, item_id, name, email, amount_cents, to_char(at, 'DD/MM HH24:MI') as at
    from auction_bids where item_id = ${itemId} order by amount_cents desc limit 30`;
  return rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    name: row.name,
    email: row.email,
    amountCents: Number(row.amount_cents) || 0,
    at: row.at,
  }));
}

export async function listEvents(itemId: string): Promise<ProductEvent[]> {
  await ensureCommerce();
  const sql = await getSql();
  const rows = await sql<{ id: string; item_id: string; at: string; author: string; note: string; stage: string }>`
    select id, item_id, to_char(at, 'DD/MM HH24:MI') as at, author, note, stage
    from product_events where item_id = ${itemId} order by product_events.at desc limit 40`;
  return rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    at: row.at,
    author: row.author,
    note: row.note,
    stage: row.stage,
  }));
}

export async function addFollow(input: { itemId: string; note: string; stage?: string; author: string }) {
  await ensureCommerce();
  const note = clip(input.note, 500);
  if (note.length < 2) throw new Error("Écrivez une note de suivi.");
  if (!/^mkt_[a-z0-9-]+$/i.test(input.itemId)) throw new Error("Produit invalide.");
  const stage = clip(input.stage || "", 40);
  const sql = await getSql();
  if (stage) await sql`update market_items set stage = ${stage} where id = ${input.itemId}`;
  await sql`insert into product_events (id, item_id, author, note, stage)
    values (${crypto.randomUUID()}, ${input.itemId}, ${clip(input.author, 80)}, ${note}, ${stage})`;
  return { ok: true };
}
