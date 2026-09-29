import { mkdirSync } from "node:fs";
import { join } from "node:path";
import winston from "winston";
import { getSql } from "@/lib/db";
import { connect } from "node:net";
import { databaseUp, loopLag, memoryMb, netRtt, redisPing, serverUp, siteRtt } from "@/lib/metrics.server";

const dir = join(process.cwd(), "logs");
mkdirSync(dir, { recursive: true });

const line = winston.format.printf((info) => {
  const stamp = typeof info.timestamp === "string" ? info.timestamp : new Date().toISOString();
  const message = typeof info.message === "string" ? info.message : JSON.stringify(info.message);
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(info)) {
    if (key === "timestamp" || key === "level" || key === "message" || key === "stack") continue;
    extra[key] = value;
  }
  const tail = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : "";
  return `${stamp} ${info.level} ${message}${info.stack ? `\n${info.stack}` : ""}${tail}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), line),
  transports: [
    new winston.transports.File({ filename: join(dir, "error.log"), level: "error", maxsize: 5_000_000, maxFiles: 5 }),
    new winston.transports.File({ filename: join(dir, "app.log"), maxsize: 10_000_000, maxFiles: 7 }),
  ],
});

logger.on("error", () => {});

export type Health = {
  ok: boolean;
  uptimeSec: number;
  memoryMb: number;
  heapMb: number;
  db: "ok" | "down";
  lagMs: number;
  redisMs: number;
  netMs: number;
  siteMs: number;
  checkedAt: string;
  note: string;
};

const empty: Health = {
  ok: false,
  uptimeSec: 0,
  memoryMb: 0,
  heapMb: 0,
  db: "down",
  lagMs: 0,
  redisMs: 0,
  netMs: 0,
  siteMs: 0,
  checkedAt: "",
  note: "pas encore mesuré",
};

let last = empty;
let lastProbe = 0;
let probing: Promise<Health> | null = null;
let wasOk = true;
let lastBeat = 0;

export function readHealth() {
  return last;
}

export async function probeHealth() {
  if (probing) return probing;
  if (lastProbe && Date.now() - lastProbe < 15_000) return last;
  probing = measure().finally(() => {
    probing = null;
  });
  return probing;
}

function timeConnect(host: string, port: number) {
  return new Promise<number>((resolve) => {
    const started = performance.now();
    const socket = connect({ host, port, timeout: 2000 });
    const finish = (ms: number) => {
      socket.destroy();
      resolve(ms);
    };
    socket.once("connect", () => finish(Math.max(0, Math.round(performance.now() - started))));
    socket.once("timeout", () => finish(-1));
    socket.once("error", () => finish(-1));
  });
}

async function timeRedis() {
  try {
    const { redisClient } = await import("@/lib/redis.server");
    const client = await redisClient();
    if (!client) return -1;
    const started = performance.now();
    await client.ping();
    return Math.max(0, Math.round(performance.now() - started));
  } catch {
    return -1;
  }
}

async function timeSite() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  const started = performance.now();
  try {
    await fetch("https://sourcingpick.com/favicon.svg", { signal: controller.signal, redirect: "manual" });
    return Math.max(0, Math.round(performance.now() - started));
  } catch {
    return -1;
  } finally {
    clearTimeout(timer);
  }
}

async function measure() {
  const started = performance.now();
  await new Promise((resolve) => setImmediate(resolve));
  const lagMs = Math.max(0, Math.round(performance.now() - started));
  let db: Health["db"] = "down";
  try {
    const sql = await getSql();
    await sql`select 1 as ok`;
    db = "ok";
  } catch (error) {
    logger.error("base de données injoignable", { stack: error instanceof Error ? error.stack : String(error) });
  }
  const use = process.memoryUsage();
  const memoryMbValue = Math.round(use.rss / 1048576);
  const heapMb = Math.round(use.heapUsed / 1048576);
  const [redisMs, netMs, siteMs] = await Promise.all([timeRedis(), timeConnect("1.1.1.1", 443), timeSite()]);
  redisPing.set(redisMs);
  netRtt.set(netMs);
  siteRtt.set(siteMs);
  const ok = db === "ok" && lagMs < 800 && memoryMbValue < 700;
  const note = ok ? "stable" : db === "down" ? "base de données injoignable" : memoryMbValue >= 700 ? "mémoire trop haute" : "le serveur répond lentement";
  last = {
    ok,
    uptimeSec: Math.round(process.uptime()),
    memoryMb: memoryMbValue,
    heapMb,
    db,
    lagMs,
    redisMs,
    netMs,
    siteMs,
    checkedAt: new Date().toISOString(),
    note,
  };
  lastProbe = Date.now();
  serverUp.set(ok ? 1 : 0);
  databaseUp.set(db === "ok" ? 1 : 0);
  memoryMb.set(memoryMbValue);
  loopLag.set(lagMs);
  const beat = Date.now() - lastBeat > 15 * 60 * 1000;
  if (!ok && wasOk) {
    logger.error(`santé dégradée — ${note}`, last);
    void import("@/lib/error-log.server").then(({ recordError }) =>
      recordError("santé", note, `mémoire ${memoryMbValue} Mo · base ${db} · délai ${lagMs} ms`),
    );
    void alertMail(last);
  } else if (ok && !wasOk) {
    logger.info("santé rétablie", last);
    lastBeat = Date.now();
    void alertMail(last);
  } else if (ok && beat) {
    lastBeat = Date.now();
    logger.info(`santé ${note}`, { memoryMb: memoryMbValue, heapMb, db, lagMs, uptimeSec: last.uptimeSec });
  }
  wasOk = ok;
  return last;
}

const slot = globalThis as typeof globalThis & { __spHealth?: boolean };

async function alertMail(health: Health) {
  try {
    const { deliverMail, mailStatus } = await import("@/lib/mail.server");
    const to = process.env.ALERT_EMAIL || mailStatus().from;
    if (!to) return;
    const down = !health.ok;
    const subject = down ? "SourcingPick — alerte serveur" : "SourcingPick — serveur rétabli";
    const text = down
      ? `Le serveur n’est plus stable.\n\n${health.note}\nMémoire : ${health.memoryMb} Mo\nBase : ${health.db}\nDélai : ${health.lagMs} ms\n\nContrôle : https://sourcingpick.com/sante`
      : `Le serveur est de nouveau stable.\nMémoire : ${health.memoryMb} Mo\nBase : ${health.db}\n\nContrôle : https://sourcingpick.com/sante`;
    const sent = await deliverMail(to, subject, text);
    logger.info(sent ? "alerte email envoyée" : "alerte email refusée", { kind: down ? "down" : "up" });
  } catch (error) {
    logger.error("alerte email impossible", { stack: error instanceof Error ? error.stack : String(error) });
  }
}

export function watchHealth() {
  if (slot.__spHealth) return;
  slot.__spHealth = true;
  const tick = () => {
    void probeHealth().catch((error) => {
      logger.error("mesure de santé impossible", { stack: error instanceof Error ? error.stack : String(error) });
    });
  };
  setTimeout(tick, 8_000).unref();
  setInterval(tick, 60_000).unref();
}
