import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { Role } from "@prisma/client";
import { renderInvoicePdf } from "@/lib/invoices/pdf";
import { hasAdminScope } from "@/lib/permissions/admin-scopes";
import { AdminScope } from "@prisma/client";

/**
 * Serves a compliant invoice PDF — partner #11. Access:
 *   - The buyer (anyone in the invoiced organisation).
 *   - The factory on the underlying order (when applicable).
 *   - Admins with FINANCE scope.
 *
 * Stream-rendered on demand. We don't cache to disk — the row's
 * canonical state lives in Postgres and the PDF is a derived artifact.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAuth();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      type: true,
      amountCents: true,
      vatRateBps: true,
      issuedAt: true,
      dueAt: true,
      organizationId: true,
      organization: {
        select: {
          legalName: true,
          address: true,
          city: true,
          country: true,
          vatNumber: true,
          siren: true,
        },
      },
      order: {
        select: {
          reference: true,
          factoryOrgId: true,
          request: {
            select: {
              deliveryAddress: true,
              deliveryStreet: true,
              deliveryPostalCode: true,
              deliveryCity: true,
              deliveryCountry: true,
            },
          },
        },
      },
    },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  // Authorisation.
  const isBuyer = user.organizationId === invoice.organizationId;
  const isFactory =
    user.role === Role.FACTORY &&
    invoice.order?.factoryOrgId === user.organizationId;
  const isFinanceAdmin =
    user.role === Role.ADMIN && hasAdminScope(user.adminScopes, AdminScope.FINANCE);
  if (!isBuyer && !isFactory && !isFinanceAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const req = invoice.order?.request;
  const delivery =
    req?.deliveryStreet &&
    req.deliveryPostalCode &&
    req.deliveryCity &&
    req.deliveryCountry
      ? {
          street: req.deliveryStreet,
          postalCode: req.deliveryPostalCode,
          city: req.deliveryCity,
          country: req.deliveryCountry,
        }
      : null;

  const pdf = await renderInvoicePdf({
    reference: invoice.reference,
    type: invoice.type,
    issuedAt: invoice.issuedAt,
    dueAt: invoice.dueAt,
    amountCents: invoice.amountCents,
    vatRateBps: invoice.vatRateBps,
    buyer: {
      legalName: invoice.organization.legalName,
      address: invoice.organization.address,
      city: invoice.organization.city,
      country: invoice.organization.country,
      vatNumber: invoice.organization.vatNumber,
      siren: invoice.organization.siren,
    },
    delivery,
    orderReference: invoice.order?.reference ?? null,
    lineDescription:
      invoice.order?.reference
        ? `Order ${invoice.order.reference} — ${invoice.type}`
        : `${invoice.type} ${invoice.reference}`,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
