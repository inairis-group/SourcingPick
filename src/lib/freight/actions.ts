"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { sendEmail } from "@/lib/email/send";
import SeaEstimateEmail from "@/lib/email/templates/sea-estimate";
import { seaCopy } from "@/content/freight/sea-simulator";
import { estimateSea, type SeaRequest } from "./sea-europe";
import { formatPrice } from "./format";

/**
 * "Voir le prix" on the sea simulator (/livraisons).
 *
 * The price is worked out here, on the server, and sent by e-mail to the
 * visitor (and to the team): the rates never reach the browser, and the
 * visitor is sent on to create their account (/inscription, the client area
 * the team works in). Every export is an async server action — this file is
 * covered by `scripts/check-use-server.ts`.
 *
 * An unauthenticated path that sends mail, so it is capped per connection and
 * per address (in memory: one process serves the site) and carries a honeypot.
 */

export type SeaEstimateState =
  | { ok: true; email: string }
  | { ok: false; error: "invalid_email" | "rate_limited" | "failed" | "invalid" };

const MAX_PER_HOUR = 5;
const recent = new Map<string, number[]>();

function allow(key: string): boolean {
  const now = Date.now();
  const kept = (recent.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (kept.length >= MAX_PER_HOUR) {
    recent.set(key, kept);
    return false;
  }
  kept.push(now);
  recent.set(key, kept);
  return true;
}

async function connectionKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? "unsalted"}:${ip}`).digest("hex");
}

const num = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
};

function parseRequest(raw: unknown): SeaRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.regime !== "ddp" && r.regime !== "vat") return null;
  if (typeof r.lineId !== "string") return null;
  const goods = r.goods;
  if (goods !== "ordinary" && goods !== "plus1" && goods !== "plus3" && goods !== "plus4" && goods !== "refused") return null;
  if (!Array.isArray(r.cartons) || r.cartons.length === 0 || r.cartons.length > 30) return null;
  const cartons = r.cartons.map((c) => {
    const x = (c ?? {}) as Record<string, unknown>;
    return {
      quantity: Math.round(num(x.quantity, 10_000)),
      length: num(x.length, 1_000),
      width: num(x.width, 1_000),
      height: num(x.height, 1_000),
      weight: num(x.weight, 1_000),
    };
  });
  if (cartons.some((c) => c.quantity > 0 && (!c.length || !c.width || !c.height || !c.weight))) return null;
  return {
    regime: r.regime,
    lineId: r.lineId,
    nonAmazon: r.nonAmazon === true,
    goods,
    cartons,
    designations: Math.max(1, Math.round(num(r.designations, 1_000))),
    phones: Math.round(num(r.phones, 100_000)),
    scooters: Math.round(num(r.scooters, 100_000)),
    bikes: Math.round(num(r.bikes, 100_000)),
    separateDeclaration: r.separateDeclaration === true,
    signature: r.signature === true,
  };
}

export async function requestSeaEstimate(
  _prev: SeaEstimateState | null,
  form: FormData,
): Promise<SeaEstimateState> {
  // A field people never see: anything in it was filled by a robot.
  if (String(form.get("company_website") ?? "")) return { ok: true, email: "" };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "invalid_email" };

  const langRaw = String(form.get("lang") ?? "fr");
  const lang: Locale = isLocale(langRaw) ? langRaw : "fr";

  let request: SeaRequest | null = null;
  try {
    request = parseRequest(JSON.parse(String(form.get("request") ?? "null")));
  } catch {
    request = null;
  }
  if (!request) return { ok: false, error: "invalid" };
  const estimate = estimateSea(request);
  if (!estimate.ok) return { ok: false, error: "invalid" };

  if (!allow(`ip:${await connectionKey()}`) || !allow(`mail:${email}`)) return { ok: false, error: "rate_limited" };

  const copy = seaCopy(lang);
  const total = formatPrice(estimate.totalRmb, estimate.totalEur, lang);
  try {
    await sendEmail({
      to: email,
      subject: copy.email.subject.replace("{total}", total),
      react: SeaEstimateEmail({ estimate, request, lang }),
    });
    const team = process.env.FREIGHT_LEADS_EMAIL || "contact@sourcingpick.com";
    await sendEmail({
      to: team,
      replyTo: email,
      subject: `Estimation maritime : ${email} — ${formatPrice(estimate.totalRmb, estimate.totalEur, "fr")}`,
      react: SeaEstimateEmail({ estimate, request, lang: "fr", lead: { email, lang } }),
    });
  } catch (err) {
    console.error("[sea-estimate] e-mail failed", err);
    return { ok: false, error: "failed" };
  }
  return { ok: true, email };
}
