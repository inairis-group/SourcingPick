import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { renderQuotePdf } from "@/lib/quotes/pdf";

/**
 * Server-side PDF for a quote — partner #22. Access:
 *   - Client on the underlying request
 *   - Agent assigned to the request
 *   - Factory that submitted the quote
 *   - Admin (any scope)
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAuth();
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: {
      id: true,
      unitPriceCentsClient: true,
      totalCentsClient: true,
      quantity: true,
      leadTimeDays: true,
      moq: true,
      incoterm: true,
      depositPercentageBps: true,
      validUntil: true,
      createdAt: true,
      notes: true,
      agentId: true,
      factoryOrgId: true,
      request: {
        select: {
          reference: true,
          title: true,
          agentId: true,
          clientOrgId: true,
          clientOrg: {
            select: { legalName: true, city: true, country: true },
          },
        },
      },
      factoryOrg: {
        select: { displayName: true, country: true },
      },
      agent: {
        select: { firstName: true, lastName: true },
      },
    },
  });
  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  // Authorisation.
  const isClient = user.organizationId === quote.request.clientOrgId;
  const isFactory =
    user.role === Role.FACTORY && user.organizationId === quote.factoryOrgId;
  const isAgent = user.role === Role.AGENT && user.id === quote.request.agentId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isClient && !isFactory && !isAgent && !isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Quote reference convention: we don't store one — use the request
  // reference + a stable suffix derived from the quote id.
  const ref = `${quote.request.reference}-Q-${quote.id.slice(0, 4).toUpperCase()}`;

  const pdf = await renderQuotePdf({
    reference: ref,
    request: { reference: quote.request.reference, title: quote.request.title },
    buyer: {
      legalName: quote.request.clientOrg.legalName,
      city: quote.request.clientOrg.city,
      country: quote.request.clientOrg.country,
    },
    factory: {
      displayName: quote.factoryOrg.displayName,
      country: quote.factoryOrg.country,
    },
    agentName: quote.agent
      ? `${quote.agent.firstName} ${quote.agent.lastName}`
      : null,
    unitPriceCentsClient: quote.unitPriceCentsClient,
    totalCentsClient: quote.totalCentsClient,
    quantity: quote.quantity,
    leadTimeDays: quote.leadTimeDays,
    moq: quote.moq,
    incoterm: quote.incoterm,
    depositPercentageBps: quote.depositPercentageBps,
    validUntil: quote.validUntil,
    issuedAt: quote.createdAt,
    notes: quote.notes,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${ref}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
