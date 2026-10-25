"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NotificationType, QuoteRequestKind, QuoteRequestService, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { sendEmail } from "@/lib/email/send";
import WarehouseAddressEmail from "@/lib/email/templates/warehouse-address";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { addressGateCopy } from "@/content/site/address-gate";

/**
 * "Recevoir l'adresse par e-mail", where the public pages used to print the
 * warehouse address (address-gate.tsx). The sign-up the site links to is the
 * other application's, which this one cannot hook into, so the visitor leaves
 * their details here and gets the address by e-mail; the team gets the same
 * e-mail with who asked, and the request is kept with the public quote
 * requests. Every export is an async server action — this file is covered by
 * `scripts/check-use-server.ts`.
 *
 * An unauthenticated path that sends mail, so it is capped per connection and
 * per address (in memory: one process serves the site) and carries a honeypot.
 */

export type AddressRequestState =
  | { ok: true; email: string }
  | { ok: false; error: "invalid_email" | "rate_limited" | "failed" };

/** How such a request's message starts, so the team can find them. */
const PREFIX = "Demande d’adresse de l’entrepôt —";
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
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "unsalted"}:${ip}`)
    .digest("hex");
}

const field = (form: FormData, name: string, max: number) =>
  String(form.get(name) ?? "")
    .trim()
    .slice(0, max);

export async function requestWarehouseAddress(
  _prev: AddressRequestState | null,
  form: FormData,
): Promise<AddressRequestState> {
  // A field people never see: anything in it was filled by a robot.
  if (field(form, "company_website", 200)) return { ok: true, email: "" };

  const email = field(form, "email", 201).toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return { ok: false, error: "invalid_email" };
  const name = field(form, "name", 120);
  const phone = field(form, "phone", 40);
  const langRaw = field(form, "lang", 5) || "fr";
  const lang: Locale = isLocale(langRaw) ? langRaw : "fr";

  const ipHash = await connectionKey();
  if (!allow(`ip:${ipHash}`) || !allow(`mail:${email}`))
    return { ok: false, error: "rate_limited" };

  await recordAddressRequest({ email, name, phone, lang, ipHash });

  try {
    await sendEmail({
      to: email,
      subject: addressGateCopy[lang].mail.subject,
      react: WarehouseAddressEmail({ lang }),
    });
    await sendEmail({
      to: process.env.FREIGHT_LEADS_EMAIL || "contact@sourcingpick.com",
      replyTo: email,
      subject: `Demande d’adresse de l’entrepôt : ${email}`,
      react: WarehouseAddressEmail({ lang: "fr", lead: { email, name, phone, lang } }),
    });
  } catch (err) {
    console.error("[address-request] e-mail failed", err);
    return { ok: false, error: "failed" };
  }
  return { ok: true, email };
}

/** Kept with the public quote requests, and the admins notified. Best effort. */
async function recordAddressRequest(args: {
  email: string;
  name: string;
  phone: string;
  lang: Locale;
  ipHash: string;
}) {
  const { email, name, phone, lang, ipHash } = args;
  try {
    const reference = await generateUniqueReference("QRQ");
    const linked = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });
    const created = await prisma.quoteRequest.create({
      data: {
        reference,
        service: QuoteRequestService.LOGISTICS,
        products: "Adresse de l’entrepôt",
        // Not asked: the visitor only wants the address.
        destinationCountry: "",
        kind: QuoteRequestKind.BUSINESS,
        name: name || email,
        email,
        phone: phone || null,
        message: `${PREFIX} envoyée par e-mail à ${email} (langue du site : ${lang}).`,
        locale: lang,
        linkedUserId: linked?.id ?? null,
        ipHash,
      },
      select: { id: true, reference: true },
    });
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    });
    if (admins.length > 0) {
      await emitNotificationToMany(
        admins.map((u) => u.id),
        {
          type: NotificationType.SYSTEM,
          vars: { systemKey: "quote_request_received", reference: created.reference },
          contextType: "QuoteRequest",
          contextId: created.id,
        },
      );
    }
  } catch (err) {
    console.error("[address-request] could not record the request", err);
  }
}
