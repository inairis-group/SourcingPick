"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { sendEmail } from "@/lib/email/send";
import FreightEstimateEmail from "@/lib/email/templates/freight-estimate";
import { freightCopy } from "@/content/freight/simulator";
import { estimateFreight } from "./estimate";
import { formatMoney } from "./format";
import { parseFreightRequest } from "./request";
import { recordFreightLead } from "./record";

/**
 * "Voir le prix" / "Recevoir mon devis" on the freight simulator (/livraisons).
 *
 * The request is priced here, on the server, and e-mailed to the visitor and
 * to the team — or, when the card has no price for it (FOB, to customs…),
 * e-mailed to both as a quote request; either way it is also kept with the
 * public quote requests in the admin. The rates never reach the browser,
 * and the visitor is sent on to create their account (/inscription, the
 * client area the team works in). Every export is an async server action —
 * this file is covered by `scripts/check-use-server.ts`.
 *
 * An unauthenticated path that sends mail, so it is capped per connection and
 * per address (in memory: one process serves the site) and carries a honeypot.
 */

export type FreightEstimateState =
  | { ok: true; email: string; priced: boolean }
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

const field = (form: FormData, name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);

export async function requestFreightEstimate(
  _prev: FreightEstimateState | null,
  form: FormData,
): Promise<FreightEstimateState> {
  // A field people never see: anything in it was filled by a robot.
  if (field(form, "company_website", 200)) return { ok: true, email: "", priced: true };

  const email = field(form, "email", 201).toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "invalid_email" };
  const name = field(form, "name", 120);
  const phone = field(form, "phone", 40);

  const langRaw = field(form, "lang", 5) || "fr";
  const lang: Locale = isLocale(langRaw) ? langRaw : "fr";

  let request = null;
  try {
    request = parseFreightRequest(JSON.parse(String(form.get("request") ?? "null")));
  } catch {
    request = null;
  }
  if (!request) return { ok: false, error: "invalid" };
  const estimate = estimateFreight(request);
  if (!estimate.ok) return { ok: false, error: "invalid" };

  const ipHash = await connectionKey();
  if (!allow(`ip:${ipHash}`) || !allow(`mail:${email}`)) return { ok: false, error: "rate_limited" };

  // Kept with the public quote requests in the admin, whatever the e-mail does.
  await recordFreightLead({ request, estimate, contact: { email, name, phone }, lang, ipHash });

  const copy = freightCopy(lang);
  const team = process.env.FREIGHT_LEADS_EMAIL || "contact@sourcingpick.com";
  const teamCopy = freightCopy("fr");
  const what = `${teamCopy.mode.names[request.mode]}, ${teamCopy.formula.names[request.formula]}`;
  try {
    await sendEmail({
      to: email,
      subject: estimate.priced ? copy.email.subject.replace("{total}", formatMoney(estimate.total, lang)) : copy.email.subjectQuote,
      react: FreightEstimateEmail({ estimate, request, lang }),
    });
    await sendEmail({
      to: team,
      replyTo: email,
      subject: `Simulateur (${what}) : ${email} — ${estimate.priced ? formatMoney(estimate.total, "fr") : "devis à faire"}`,
      react: FreightEstimateEmail({ estimate, request, lang: "fr", lead: { email, name, phone, lang } }),
    });
  } catch (err) {
    console.error("[freight-estimate] e-mail failed", err);
    return { ok: false, error: "failed" };
  }
  return { ok: true, email, priced: estimate.priced };
}
