import { getSql } from "@/lib/db";
import { logger } from "@/lib/log.server";

let ready: Promise<void> | null = null;

function table() {
  if (!ready) {
    ready = (async () => {
      const sql = await getSql();
      await sql`create table if not exists ops_logs (
        id text primary key,
        level text not null default 'error',
        source text not null,
        message text not null,
        detail text not null default '',
        at_label text not null default '',
        created_at timestamptz not null default now()
      )`;
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export async function recordError(source: string, message: string, detail = "") {
  logger.error(`${source}: ${message}`, { detail });
  try {
    await table();
    const sql = await getSql();
    const id = `log_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const at = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Europe/Paris",
    }).format(new Date());
    await sql`insert into ops_logs (id, level, source, message, detail, at_label)
      values (${id}, ${"error"}, ${source.slice(0, 80)}, ${message.slice(0, 500)}, ${detail.slice(0, 4000)}, ${at})`;
  } catch (error) {
    console.error("error-log", error instanceof Error ? error.message : error);
  }
}

export async function listErrorLogs() {
  await table();
  const sql = await getSql();
  const rows = await sql<{ id: string; source: string; message: string; detail: string; at_label: string }>`
    select id, source, message, detail, at_label from ops_logs order by created_at desc limit 200`;
  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    message: row.message,
    detail: row.detail || "",
    atLabel: row.at_label || "",
  }));
}

const slot = globalThis as typeof globalThis & { __spErrorHook?: boolean };
if (!slot.__spErrorHook) {
  slot.__spErrorHook = true;
  process.on("unhandledRejection", (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (/aborted|ECONNRESET|EPIPE|socket hang up/i.test(message)) return;
    const detail = reason instanceof Error ? reason.stack || "" : "";
    void recordError("serveur", message, detail);
  });
}
