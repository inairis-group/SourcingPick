import { sqlDuration, sqlSlow } from "@/lib/metrics.server";

type SlowQuery = { ms: number; op: string; sql: string; at: string };

const slot = globalThis as typeof globalThis & { __spSlowSql?: SlowQuery[] };

function slowList() {
  slot.__spSlowSql ??= [];
  return slot.__spSlowSql;
}

export function sqlOp(text: string) {
  const word = text.trim().slice(0, 16).toLowerCase();
  if (word.startsWith("select") || word.startsWith("with")) return "select";
  if (word.startsWith("insert")) return "insert";
  if (word.startsWith("update")) return "update";
  if (word.startsWith("delete")) return "delete";
  return "other";
}

export function noteQuery(text: string, ms: number) {
  const op = sqlOp(text);
  const seconds = ms / 1000;
  sqlDuration.observe({ op }, seconds);
  if (ms < 50) return;
  sqlSlow.inc({ op });
  const sql = text.replace(/\s+/g, " ").trim().slice(0, 220);
  const list = slowList();
  list.unshift({ ms: Math.round(ms), op, sql, at: new Date().toISOString() });
  if (list.length > 40) list.pop();
  if (ms >= 200) {
    void import("@/lib/log.server").then(({ logger }) => logger.warn("sql lente", { ms: Math.round(ms), op, sql }));
  }
}

export function recentSlowSql() {
  return slowList().slice(0, 20);
}
