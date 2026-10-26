"use server";

import { revalidatePath } from "next/cache";
import {
  FreightQuoteStatus,
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  OrgType,
  Prisma,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { sendEmail } from "@/lib/email/send";
import FreightQuoteEmail from "@/lib/email/templates/freight-quote";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo/site";
import { freightCopy } from "@/content/freight/simulator";
import { estimateFreight } from "@/lib/freight/estimate";
import { parseFreightRequest } from "@/lib/freight/request";
import { partsFromTotal, rateIsSane, toMicros } from "./convert";
import { dailyRates, type DailyRates } from "./rates";
import { describeTransport } from "./describe";

/**
 * Freight quotes made with the freight calculator (/admin/freight-calculator).
 *
 * The team prices a shipment in the calculator, picks the client (and the
 * order, when the freight is an order's), checks the euro amount — the
 * calculator's price converted at the day's rate, which they can adjust — and
 * sends it. The client accepts it in their space, which issues the SHIPPING
 * invoice for exactly that amount, or declines it with a reason. Nothing is
 * invoiced before the client has agreed to the figure.
 *
 * Every export is an async server action — this file is covered by
 * `scripts/check-use-server.ts`.
 */

export type ClientOrgHit = { id: string; name: string; clientCode: string | null; email: string | null; country: string };
export type ClientOrderHit = { id: string; reference: string; status: string; freightBilled: boolean };

/** Client organisations matching a name, an e-mail or a client code. */
export async function searchFreightQuoteClients(query: string): Promise<ClientOrgHit[]> {
  await requireRole(Role.ADMIN);
  const q = String(query ?? "").trim().slice(0, 100);
  if (q.length < 2) return [];
  const orgs = await prisma.organization.findMany({
    where: {
      type: OrgType.CLIENT,
      deletedAt: null,
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { legalName: { contains: q, mode: "insensitive" } },
        { clientCode: { contains: q, mode: "insensitive" } },
        { users: { some: { email: { contains: q, mode: "insensitive" }, deletedAt: null } } },
      ],
    },
    orderBy: { displayName: "asc" },
    take: 10,
    select: {
      id: true,
      displayName: true,
      clientCode: true,
      country: true,
      users: { where: { deletedAt: null }, orderBy: { createdAt: "asc" }, take: 1, select: { email: true } },
    },
  });
  return orgs.map((o) => ({ id: o.id, name: o.displayName, clientCode: o.clientCode, email: o.users[0]?.email ?? null, country: o.country }));
}

/** A client's orders, newest first, and whether their freight is already invoiced. */
export async function freightQuoteClientOrders(orgId: string): Promise<ClientOrderHit[]> {
  await requireRole(Role.ADMIN);
  const orders = await prisma.order.findMany({
    where: { clientOrgId: String(orgId ?? ""), deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reference: true,
      status: true,
      invoices: { where: { type: InvoiceType.SHIPPING, status: { not: InvoiceStatus.VOID } }, select: { id: true } },
    },
  });
  return orders.map((o) => ({ id: o.id, reference: o.reference, status: o.status, freightBilled: o.invoices.length > 0 }));
}

/** The day's rates the form starts from. */
export async function freightQuoteRates(): Promise<DailyRates> {
  await requireRole(Role.ADMIN);
  return dailyRates();
}

export type CreateFreightQuoteResult =
  | { ok: true; id: string; reference: string; client: string }
  | {
      ok: false;
      error:
        | "invalid_request"
        | "client_not_found"
        | "order_not_found"
        | "order_freight_billed"
        | "invalid_amount"
        | "invalid_rate"
        | "invalid_validity"
        | "generic";
    };

/** Whether an order's freight is already invoiced (on a SHIPPING invoice that is not void). */
async function orderFreightBilled(db: Prisma.TransactionClient | typeof prisma, orderId: string): Promise<boolean> {
  const n = await db.invoice.count({
    where: { orderId, type: InvoiceType.SHIPPING, status: { not: InvoiceStatus.VOID } },
  });
  return n > 0;
}

export async function createFreightQuote(input: {
  request: unknown;
  organizationId: string;
  orderId?: string | null;
  /** The amount the client is to accept, euros. */
  amountEur: number;
  fxCnyEur?: number | null;
  fxUsdEur?: number | null;
  /** YYYY-MM-DD. */
  validUntil: string;
  notes?: string;
}): Promise<CreateFreightQuoteResult> {
  const admin = await requireRole(Role.ADMIN);

  // Priced again here, from what the form describes: the figures the form
  // shows are a preview, never the source.
  const request = parseFreightRequest(input.request);
  if (!request) return { ok: false, error: "invalid_request" };
  const estimate = estimateFreight(request);
  if (!estimate.ok) return { ok: false, error: "invalid_request" };

  const org = await prisma.organization.findFirst({
    where: { id: String(input.organizationId ?? ""), type: OrgType.CLIENT, deletedAt: null },
    select: { id: true, displayName: true },
  });
  if (!org) return { ok: false, error: "client_not_found" };

  let order: { id: string; reference: string } | null = null;
  if (input.orderId) {
    order = await prisma.order.findFirst({
      where: { id: String(input.orderId), clientOrgId: org.id, deletedAt: null },
      select: { id: true, reference: true },
    });
    if (!order) return { ok: false, error: "order_not_found" };
    if (await orderFreightBilled(prisma, order.id)) return { ok: false, error: "order_freight_billed" };
  }

  const amountEurCents = Math.round(Number(input.amountEur) * 100);
  if (!Number.isFinite(amountEurCents) || amountEurCents <= 0 || amountEurCents > 1_000_000_000) {
    return { ok: false, error: "invalid_amount" };
  }

  // The price's parts by currency, and the rates that converted them: a part
  // in yuan or dollars needs its rate, and the rate is stored with it.
  const parts = estimate.priced ? partsFromTotal(estimate.total) : { rmbCents: 0, eurCents: 0, usdCents: 0 };
  const cny = input.fxCnyEur ?? null;
  const usd = input.fxUsdEur ?? null;
  if ((parts.rmbCents > 0 || cny !== null) && !rateIsSane("cnyEur", cny)) return { ok: false, error: "invalid_rate" };
  if ((parts.usdCents > 0 || usd !== null) && !rateIsSane("usdEur", usd)) return { ok: false, error: "invalid_rate" };

  const validUntil = new Date(`${String(input.validUntil ?? "")}T23:59:59Z`);
  const now = Date.now();
  if (Number.isNaN(validUntil.getTime()) || validUntil.getTime() < now || validUntil.getTime() > now + 366 * 24 * 3600 * 1000) {
    return { ok: false, error: "invalid_validity" };
  }
  const notes = String(input.notes ?? "").trim().slice(0, 2000) || null;

  const reference = await generateUniqueReference("DTR");
  let quoteId: string;
  try {
    const created = await prisma.freightQuote.create({
      data: {
        reference,
        organizationId: org.id,
        orderId: order?.id ?? null,
        createdById: admin.id,
        request: request as unknown as Prisma.InputJsonValue,
        estimate: estimate as unknown as Prisma.InputJsonValue,
        mode: request.mode,
        formula: request.formula,
        line: estimate.line,
        destinationCountry: request.address.country,
        rmbCents: parts.rmbCents,
        eurPartCents: parts.eurCents,
        usdCents: parts.usdCents,
        fxCnyEurMicros: rateIsSane("cnyEur", cny) ? toMicros(cny) : null,
        fxUsdEurMicros: rateIsSane("usdEur", usd) ? toMicros(usd) : null,
        amountEurCents,
        validUntil,
        notes,
      },
      select: { id: true },
    });
    quoteId = created.id;
  } catch (err) {
    console.error("[freight-quote] could not create the quote", err);
    return { ok: false, error: "generic" };
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "freight_quote.sent",
    targetType: "FreightQuote",
    targetId: quoteId,
    payload: { reference, organizationId: org.id, orderRef: order?.reference ?? null, amountEurCents, ...parts },
  });

  // The client's users: an in-app notice, and the quote by e-mail in their language.
  const users = await prisma.user.findMany({
    where: { organizationId: org.id, role: Role.CLIENT, deletedAt: null },
    select: { id: true, email: true, locale: true },
  });
  if (users.length > 0) {
    await emitNotificationToMany(
      users.map((u) => u.id),
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "freight_quote_received", reference },
        contextType: "FreightQuote",
        contextId: quoteId,
      },
    );
  }
  for (const u of users) {
    const lang: Locale = isLocale(u.locale) ? u.locale : "fr";
    try {
      const t = (await getDictionary(lang)).client.freightQuote;
      const c = freightCopy(lang);
      const amount = formatEUR(amountEurCents / 100, lang);
      await sendEmail({
        to: u.email,
        subject: t.email.subject.replace("{reference}", reference).replace("{amount}", amount),
        react: FreightQuoteEmail({
          lang,
          copy: t.email,
          amount,
          rows: [
            [t.reference, reference],
            [t.validUntil, formatDate(validUntil, lang)],
            ...(order ? [[t.order, order.reference] as [string, string]] : []),
            [t.mode, describeTransport(c, { mode: request.mode, line: estimate.line, container: request.container })],
            [t.formula, c.formula.names[request.formula]],
            [t.destination, [request.address.postcode, request.address.city, countryName(request.address.country, lang)].filter(Boolean).join(" ")],
          ],
          notes,
          ctaUrl: `${getSiteUrl()}/${lang}/client/freight-quotes/${quoteId}`,
        }),
      });
    } catch (err) {
      // The quote and the in-app notice stand; the e-mail is best effort.
      console.error("[freight-quote] e-mail failed", err);
    }
  }

  revalidatePath("/[lang]/admin/freight-calculator", "page");
  revalidatePath("/[lang]/client/dashboard", "page");
  return { ok: true, id: quoteId, reference, client: org.displayName };
}

/** Withdraw a quote the client has not answered yet. */
export async function cancelFreightQuote(id: string): Promise<{ ok: boolean }> {
  const admin = await requireRole(Role.ADMIN);
  const { count } = await prisma.freightQuote.updateMany({
    where: { id: String(id ?? ""), status: FreightQuoteStatus.SENT },
    data: { status: FreightQuoteStatus.CANCELLED, cancelledAt: new Date() },
  });
  if (count === 0) return { ok: false };
  await writeAuditLog({ actorUserId: admin.id, action: "freight_quote.cancelled", targetType: "FreightQuote", targetId: String(id) });
  revalidatePath("/[lang]/admin/freight-calculator", "page");
  return { ok: true };
}

export type FreightQuoteAnswerState =
  | { ok: true; invoiceReference?: string }
  | { ok: false; error: "not_found" | "not_open" | "expired" | "order_freight_billed" | "reason_required" | "generic" };

/**
 * The client agrees to the price: the quote is claimed (only once, whoever
 * clicks twice), the SHIPPING invoice issued for its euro amount, and the
 * other quotes still open for the same order withdrawn — an order's freight
 * is billed once.
 */
export async function acceptFreightQuote(
  _prev: FreightQuoteAnswerState | null,
  form: FormData,
): Promise<FreightQuoteAnswerState> {
  const user = await requireRole(Role.CLIENT);
  const id = String(form.get("quoteId") ?? "");
  const quote = await prisma.freightQuote.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { id: true, reference: true, status: true, validUntil: true, orderId: true, amountEurCents: true, mode: true, line: true },
  });
  if (!quote) return { ok: false, error: "not_found" };
  if (quote.status !== FreightQuoteStatus.SENT) return { ok: false, error: "not_open" };
  if (quote.validUntil.getTime() < Date.now()) return { ok: false, error: "expired" };

  const frenchCopy = freightCopy("fr");
  const invoiceReference = await generateUniqueReference("INV");
  let invoiceId: string;
  try {
    invoiceId = await prisma.$transaction(async (tx) => {
      if (quote.orderId) {
        // Two open quotes of one order accepted at the same moment must not
        // both bill it: the order's row is held until this one is through.
        await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${quote.orderId} FOR UPDATE`;
        if (await orderFreightBilled(tx, quote.orderId)) throw new FreightBilled();
      }
      const claimed = await tx.freightQuote.updateMany({
        where: { id: quote.id, status: FreightQuoteStatus.SENT },
        data: { status: FreightQuoteStatus.ACCEPTED, acceptedAt: new Date(), acceptedById: user.id },
      });
      if (claimed.count === 0) throw new NotOpen();
      const now = new Date();
      const invoice = await tx.invoice.create({
        data: {
          reference: invoiceReference,
          orderId: quote.orderId,
          organizationId: user.organizationId,
          type: InvoiceType.SHIPPING,
          amountCents: quote.amountEurCents,
          issuedAt: now,
          // Freight is due before the goods move, as on the order's own freight.
          dueAt: now,
          status: InvoiceStatus.ISSUED,
          lineDescription: `Transport — ${quote.reference} (${describeTransport(frenchCopy, { mode: quote.mode, line: quote.line })})`,
        },
        select: { id: true },
      });
      await tx.freightQuote.update({ where: { id: quote.id }, data: { invoiceId: invoice.id } });
      if (quote.orderId) {
        await tx.freightQuote.updateMany({
          where: { orderId: quote.orderId, status: FreightQuoteStatus.SENT, id: { not: quote.id } },
          data: { status: FreightQuoteStatus.CANCELLED, cancelledAt: now },
        });
      }
      return invoice.id;
    });
  } catch (err) {
    if (err instanceof FreightBilled) return { ok: false, error: "order_freight_billed" };
    if (err instanceof NotOpen) return { ok: false, error: "not_open" };
    console.error("[freight-quote] acceptance failed", err);
    return { ok: false, error: "generic" };
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "freight_quote.accepted",
    targetType: "FreightQuote",
    targetId: quote.id,
    payload: { reference: quote.reference, invoiceReference, amountEurCents: quote.amountEurCents },
  });
  const admins = await prisma.user.findMany({ where: { role: Role.ADMIN, deletedAt: null }, select: { id: true } });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      { type: NotificationType.SYSTEM, vars: { systemKey: "freight_quote_accepted", reference: quote.reference }, contextType: "FreightQuote", contextId: quote.id },
    );
  }
  const clients = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: Role.CLIENT, deletedAt: null },
    select: { id: true },
  });
  await emitNotificationToMany(
    clients.map((u) => u.id),
    quote.orderId
      ? { type: NotificationType.INVOICE_DUE, vars: { reference: invoiceReference }, contextType: "Order", contextId: quote.orderId }
      : { type: NotificationType.INVOICE_DUE, vars: { reference: invoiceReference }, contextType: "Invoice", contextId: invoiceId },
  );

  revalidatePath("/[lang]/client/freight-quotes/[id]", "page");
  revalidatePath("/[lang]/client/invoices", "page");
  revalidatePath("/[lang]/client/dashboard", "page");
  revalidatePath("/[lang]/admin/freight-calculator", "page");
  return { ok: true, invoiceReference };
}

/** The client says no, with a reason the team can price again from. */
export async function declineFreightQuote(
  _prev: FreightQuoteAnswerState | null,
  form: FormData,
): Promise<FreightQuoteAnswerState> {
  const user = await requireRole(Role.CLIENT);
  const id = String(form.get("quoteId") ?? "");
  const reason = String(form.get("reason") ?? "").trim().slice(0, 1000);
  if (reason.length < 5) return { ok: false, error: "reason_required" };
  const quote = await prisma.freightQuote.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { id: true, reference: true, status: true },
  });
  if (!quote) return { ok: false, error: "not_found" };
  const { count } = await prisma.freightQuote.updateMany({
    where: { id: quote.id, status: FreightQuoteStatus.SENT },
    data: { status: FreightQuoteStatus.DECLINED, declinedAt: new Date(), declineReason: reason },
  });
  if (count === 0) return { ok: false, error: "not_open" };

  await writeAuditLog({
    actorUserId: user.id,
    action: "freight_quote.declined",
    targetType: "FreightQuote",
    targetId: quote.id,
    payload: { reference: quote.reference, reason },
  });
  const admins = await prisma.user.findMany({ where: { role: Role.ADMIN, deletedAt: null }, select: { id: true } });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      { type: NotificationType.SYSTEM, vars: { systemKey: "freight_quote_declined", reference: quote.reference }, contextType: "FreightQuote", contextId: quote.id },
    );
  }
  revalidatePath("/[lang]/client/freight-quotes/[id]", "page");
  revalidatePath("/[lang]/admin/freight-calculator", "page");
  return { ok: true };
}

function countryName(iso: string, lang: Locale): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

class FreightBilled extends Error {}
class NotOpen extends Error {}
