import "server-only";
import { NotificationType, QuoteRequestKind, QuoteRequestService, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { formatNumber } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { freightCopy, goodsLabel } from "@/content/freight/simulator";
import type { FreightEstimate, FreightRequest } from "./estimate";
import { formatAmount, formatKg, formatMoney } from "./format";

/**
 * A simulator request, kept where the team already reads the public quote
 * requests (/admin/quote-requests), with everything the visitor entered and
 * the price they were sent — on top of the e-mail, not instead of it.
 *
 * Best effort: the visitor has their e-mail whatever happens here, so a
 * failure is logged and the request goes on.
 */
/** How a simulator request's message starts: the admin lists them by it. */
export const FREIGHT_LEAD_PREFIX = "Simulateur de transport —";

export async function recordFreightLead(args: {
  request: FreightRequest;
  estimate: Extract<FreightEstimate, { ok: true }>;
  contact: { email: string; name: string; phone: string };
  lang: Locale;
  ipHash: string | null;
}): Promise<void> {
  const { request, estimate, contact, lang, ipHash } = args;
  try {
    const c = freightCopy("fr");
    const n = (v: number, digits = 2) => formatNumber(v, "fr", { maximumFractionDigits: digits });
    const m3 = (v: number) => `${n(v)} m³`;
    const names = estimate.products.map((p, i) => p.name || `Produit ${i + 1}`);
    const a = request.address;
    const lines = [
      `${FREIGHT_LEAD_PREFIX} ${c.mode.names[request.mode]}, ${c.formula.names[request.formula]}.`,
      estimate.line ? `Ligne : ${c.lines.names[estimate.line]}${estimate.zone ? `, zone ${estimate.zone}` : ""}.` : "",
      request.container ? `Conteneurs : ${request.container.count} × ${c.container.types[request.container.type]}.` : "",
      `Adresse : ${[a.street, `${a.postcode} ${a.city}`.trim(), a.country].filter(Boolean).join(", ")}`,
      ...estimate.products.map((p, i) => {
        const src = request.products.filter((x) => x.cartons > 0)[i];
        const extras = [
          goodsLabel(c, request.mode, src.goods),
          src.units ? `${src.units} unités` : "",
          src.battery ? "avec batterie" : "",
          src.reinforce ? "à renforcer au bois" : "",
        ].filter(Boolean);
        // A container's cartons may come without their dimensions.
        const measured = src.length && src.width && src.height && src.weight;
        return measured
          ? `· ${names[i]} : ${p.cartons} cartons de ${n(src.length)} × ${n(src.width)} × ${n(src.height)} cm, ${n(src.weight)} kg — ${m3(p.volume)}, ${formatKg(p.chargeable, "fr")} facturables (${extras.join(", ")})`
          : `· ${names[i]} : ${p.cartons} cartons, dimensions non indiquées (${extras.join(", ")})`;
      }),
      `Total : ${estimate.weights.cartons} cartons, ${m3(estimate.weights.volume)}, réel ${formatKg(estimate.weights.real, "fr")}, volumétrique ${formatKg(estimate.weights.volumetric, "fr")}, facturé ${formatKg(estimate.billedKg, "fr")}${estimate.bracket ? ` (tranche ${estimate.bracket} kg)` : ""}.`,
      request.declaration ? "Déclaration d’export séparée demandée." : "",
      estimate.priced
        ? [
            `Prix envoyé : ${formatMoney(estimate.total, "fr")}`,
            ...estimate.items.map((i) => `  ${i.key} : ${formatAmount(i.amount, i.currency, "fr")}`),
            `  commission 3 % : ${formatMoney(estimate.commission, "fr")}`,
          ].join("\n")
        : `Devis à faire : ${c.quote.reasons[estimate.reason]}`,
    ].filter(Boolean);

    const reference = await generateUniqueReference("QRQ");
    const linked = await prisma.user.findFirst({ where: { email: contact.email, deletedAt: null }, select: { id: true } });
    const created = await prisma.quoteRequest.create({
      data: {
        reference,
        service: QuoteRequestService.LOGISTICS,
        products: names.join(", ").slice(0, 500) || "Simulateur de transport",
        quantity: `${estimate.weights.cartons} cartons`,
        volume: m3(estimate.weights.volume),
        destinationCountry: a.country,
        destinationCity: `${a.postcode} ${a.city}`.trim() || null,
        // The simulator does not ask; most of its visitors are businesses.
        kind: QuoteRequestKind.BUSINESS,
        name: contact.name || contact.email,
        email: contact.email,
        phone: contact.phone || null,
        message: lines.join("\n").slice(0, 5000),
        locale: lang,
        linkedUserId: linked?.id ?? null,
        ipHash,
      },
      select: { id: true, reference: true },
    });
    const admins = await prisma.user.findMany({ where: { role: Role.ADMIN, deletedAt: null }, select: { id: true } });
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
    console.error("[freight-estimate] could not record the request", err);
  }
}
