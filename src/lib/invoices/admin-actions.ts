"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdminScope,
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  OrgType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";

/**
 * Admin-issued invoice CRUD — partner round 4.
 *
 *   `adminCreateInvoiceAction`  — mint a new ad-hoc invoice to a
 *     client / factory / agent org. Used for one-off billing the
 *     order/research/cert paths don't cover.
 *   `adminMarkInvoicePaidAction` — flip ISSUED → PAID after a wire
 *     lands and we've reconciled.
 *   `adminVoidInvoiceAction`    — mistake / superseded. DRAFT or
 *     ISSUED only; PAID rows are immutable.
 *
 * All three gated behind FINANCE admin scope. Every action notifies
 * the recipient org and writes an audit row.
 */

export type AdminInvoiceResult =
  | { ok: true; invoiceId?: string }
  | { ok: false; error: string };

const CreateSchema = z.object({
  recipientOrgId: z.string().min(1),
  amountCents: z.coerce.number().int().positive().max(100_000_000),
  vatRateBps: z.coerce.number().int().min(0).max(3000).default(2000),
  lineDescription: z.string().trim().min(3).max(500),
  /** ISO date or empty for "now". */
  issuedAt: z.coerce.date().optional(),
  /** Days from issuance — default 14. */
  dueInDays: z.coerce.number().int().min(0).max(180).default(14),
  orderId: z.string().min(1).optional(),
});

export async function adminCreateInvoiceAction(
  input: z.input<typeof CreateSchema>,
): Promise<AdminInvoiceResult> {
  const admin = await requireAdminScope(AdminScope.FINANCE);
  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const recipient = await prisma.organization.findUnique({
    where: { id: parsed.data.recipientOrgId },
    select: { id: true, displayName: true, type: true, deletedAt: true },
  });
  if (!recipient || recipient.deletedAt) {
    return { ok: false, error: "Recipient organisation not found." };
  }

  let orderRef: string | null = null;
  if (parsed.data.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      select: { id: true, reference: true },
    });
    if (!order) return { ok: false, error: "Order not found." };
    orderRef = order.reference;
  }

  const reference = await generateUniqueReference("INV");
  const issuedAt = parsed.data.issuedAt ?? new Date();
  const dueAt = new Date(
    issuedAt.getTime() + parsed.data.dueInDays * 24 * 60 * 60 * 1000,
  );

  const invoice = await prisma.invoice.create({
    data: {
      reference,
      organizationId: recipient.id,
      type: InvoiceType.ADMIN_CUSTOM,
      amountCents: parsed.data.amountCents,
      vatRateBps: parsed.data.vatRateBps,
      issuedAt,
      dueAt,
      status: InvoiceStatus.ISSUED,
      lineDescription: parsed.data.lineDescription,
      issuedByUserId: admin.id,
      orderId: parsed.data.orderId ?? null,
    },
    select: { id: true },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "invoice.admin_created",
    targetType: "Invoice",
    targetId: invoice.id,
    payload: {
      reference,
      recipientType: recipient.type,
      amountCents: parsed.data.amountCents,
      orderRef,
    },
    level: "WARN",
  });

  // Notify recipient org users.
  const recipientUsers = await prisma.user.findMany({
    where: {
      organizationId: recipient.id,
      deletedAt: null,
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    recipientUsers.map((u) => u.id),
    {
      type: NotificationType.INVOICE_DUE,
      vars: { reference },
      contextType: "Invoice",
      contextId: invoice.id,
    },
  );

  revalidatePath("/[lang]/admin/invoices", "page");
  revalidatePath("/[lang]/client/invoices", "page");
  revalidatePath("/[lang]/factory/payouts", "page");
  revalidatePath("/[lang]/agent/invoices", "page");
  return { ok: true, invoiceId: invoice.id };
}

export async function adminMarkInvoicePaidAction(
  invoiceId: string,
): Promise<AdminInvoiceResult> {
  const admin = await requireAdminScope(AdminScope.FINANCE);
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, reference: true, status: true, organizationId: true },
  });
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (inv.status === InvoiceStatus.PAID) {
    return { ok: false, error: "Already paid." };
  }
  if (inv.status === InvoiceStatus.VOID) {
    return { ok: false, error: "Cannot mark a voided invoice as paid." };
  }

  await prisma.invoice.update({
    where: { id: inv.id },
    data: { status: InvoiceStatus.PAID, paidAt: new Date() },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "invoice.admin_marked_paid",
    targetType: "Invoice",
    targetId: inv.id,
    payload: { reference: inv.reference },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/invoices", "page");
  return { ok: true };
}

export async function adminVoidInvoiceAction(
  invoiceId: string,
  reason: string,
): Promise<AdminInvoiceResult> {
  const admin = await requireAdminScope(AdminScope.FINANCE);
  const cleanReason = reason.trim();
  if (cleanReason.length < 10) {
    return {
      ok: false,
      error: "Provide a short reason (≥ 10 characters) for the void.",
    };
  }

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, reference: true, status: true },
  });
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (inv.status === InvoiceStatus.PAID) {
    return { ok: false, error: "Cannot void a paid invoice." };
  }
  if (inv.status === InvoiceStatus.VOID) {
    return { ok: false, error: "Already voided." };
  }

  await prisma.invoice.update({
    where: { id: inv.id },
    data: { status: InvoiceStatus.VOID },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "invoice.admin_voided",
    targetType: "Invoice",
    targetId: inv.id,
    payload: { reference: inv.reference, reason: cleanReason },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/invoices", "page");
  return { ok: true };
}

/**
 * Lookup helper for the create-invoice dialog. Returns up to N orgs
 * matching the type + query. Used by the admin's invoice creation
 * form so the client/factory/agent picker shows real choices.
 */
export async function adminOrgSearchAction(args: {
  type: OrgType;
  query?: string;
}): Promise<Array<{ id: string; displayName: string; country: string }>> {
  await requireAdminScope(AdminScope.FINANCE);
  const q = args.query?.trim() ?? "";
  const rows = await prisma.organization.findMany({
    where: {
      type: args.type,
      deletedAt: null,
      ...(q.length > 0
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { legalName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { displayName: "asc" },
    take: 30,
    select: { id: true, displayName: true, country: true },
  });
  return rows;
}

// `Role` import isn't directly used yet — kept for future flows that
// constrain by recipient-role (e.g. agent-only commission invoices).
void Role;
