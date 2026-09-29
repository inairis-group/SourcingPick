import { getSql } from "@/lib/db";

const ORIGIN = "https://sourcingpick.com";
let ready: Promise<void> | null = null;

async function ensure() {
  ready ??= (async () => {
    const sql = await getSql();
    await sql`create table if not exists mail_messages (
      id text primary key,
      at timestamptz not null default now(),
      to_email text not null default '',
      subject text not null default '',
      accepted boolean not null default false,
      opens integer not null default 0,
      clicks integer not null default 0,
      first_open timestamptz,
      last_open timestamptz,
      first_click timestamptz,
      last_click timestamptz
    )`;
    await sql`create index if not exists mail_messages_at_idx on mail_messages (at desc)`;
    try {
      await sql`insert into mail_messages (id, at, to_email, subject, accepted)
        select id, created_at, to_email, subject, sent
        from ops_outbox
        where not exists (select 1 from mail_messages where mail_messages.id = ops_outbox.id)
        on conflict (id) do nothing`;
    } catch (error) {
      console.error("mail-backfill", error);
    }
  })().catch((error) => {
    ready = null;
    throw error;
  });
  await ready;
}

function clip(value: string, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function trackHtml(html: string, id: string) {
  const next = String(html ?? "").replace(/href=(["'])(https?:\/\/[^"']+)\1/gi, (all, quote, href) => {
    if (href.includes("/api/c/") || href.includes("/api/o/")) return all;
    let host = "";
    try {
      host = new URL(href).hostname;
    } catch {
      return all;
    }
    if (host !== "sourcingpick.com" && host !== "www.sourcingpick.com") return all;
    const dest = `${ORIGIN}/api/c/${id}?u=${encodeURIComponent(href)}`;
    return `href=${quote}${dest}${quote}`;
  });
  const linked = next.replace(/https:\/\/(?:www\.)?sourcingpick\.com\/[^\s"'<]+/g, (href) => {
    if (href.includes("/api/c/") || href.includes("/api/o/")) return href;
    return `${ORIGIN}/api/c/${id}?u=${encodeURIComponent(href)}`;
  });
  const pixel = `<img src="${ORIGIN}/api/o/${id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;overflow:hidden;">`;
  return linked.includes("</body>") ? linked.replace("</body>", `${pixel}</body>`) : `${linked}${pixel}`;
}

export async function openMail(id: string, to: string, subject: string) {
  const mailId = clip(id, 80);
  if (!mailId) return "";
  await ensure();
  const sql = await getSql();
  await sql`insert into mail_messages (id, to_email, subject, accepted)
    values (${mailId}, ${clip(to, 180)}, ${clip(subject, 180)}, false)
    on conflict (id) do nothing`;
  return mailId;
}

export async function acceptMail(id: string, accepted: boolean) {
  if (!id) return;
  await ensure();
  const sql = await getSql();
  await sql`update mail_messages set accepted = ${accepted} where id = ${id}`;
}

export async function recordOpen(id: string) {
  const mailId = clip(id, 80);
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(mailId)) return;
  await ensure();
  const sql = await getSql();
  await sql`update mail_messages
    set opens = opens + 1,
        first_open = coalesce(first_open, now()),
        last_open = now()
    where id = ${mailId}`;
}

export function safeClickTarget(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    if (url.hostname !== "sourcingpick.com" && url.hostname !== "www.sourcingpick.com") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function recordClick(id: string, url: string) {
  const mailId = clip(id, 80);
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(mailId)) return;
  await ensure();
  const sql = await getSql();
  await sql`update mail_messages
    set clicks = clicks + 1,
        first_click = coalesce(first_click, now()),
        last_click = now()
    where id = ${mailId}`;
  void url;
}

export type MailLog = {
  id: string;
  at: string;
  to: string;
  subject: string;
  accepted: boolean;
  opens: number;
  clicks: number;
  opened: string;
  clicked: string;
};

export async function listMailMessages(): Promise<MailLog[]> {
  await ensure();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    at: string;
    to_email: string;
    subject: string;
    accepted: boolean;
    opens: number;
    clicks: number;
    opened: string | null;
    clicked: string | null;
  }>`select id, to_char(at, 'DD/MM HH24:MI') as at, to_email, subject, accepted, opens, clicks,
      to_char(first_open, 'DD/MM HH24:MI') as opened,
      to_char(last_click, 'DD/MM HH24:MI') as clicked
    from mail_messages
    order by mail_messages.at desc limit 40`;
  return rows.map((row) => ({
    id: row.id,
    at: row.at,
    to: row.to_email,
    subject: row.subject,
    accepted: Boolean(row.accepted),
    opens: Number(row.opens) || 0,
    clicks: Number(row.clicks) || 0,
    opened: row.opened || "",
    clicked: row.clicked || "",
  }));
}

export async function mailSummary() {
  await ensure();
  const sql = await getSql();
  const rows = await sql<{ sent: number; accepted: number; opened: number; clicked: number; opens: number; clicks: number }>`
    select count(*)::int as sent,
      count(*) filter (where accepted)::int as accepted,
      count(*) filter (where opens > 0)::int as opened,
      count(*) filter (where clicks > 0)::int as clicked,
      coalesce(sum(opens), 0)::int as opens,
      coalesce(sum(clicks), 0)::int as clicks
    from mail_messages
    where at > now() - interval '30 days'`;
  const row = rows[0];
  return {
    sent: Number(row?.sent) || 0,
    accepted: Number(row?.accepted) || 0,
    opened: Number(row?.opened) || 0,
    clicked: Number(row?.clicked) || 0,
    opens: Number(row?.opens) || 0,
    clicks: Number(row?.clicks) || 0,
  };
}
