import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * GDPR data portability (Art. 20) — lets a signed-in user download the
 * personal data we hold about them as JSON. Scoped strictly to the
 * requester's own data: their profile, their org's public particulars, and
 * the records they authored (notifications, messages, support tickets, bids,
 * sourcing requests, audit trail). Never includes secrets (password hash) or
 * other users' data.
 *
 * Delivered as an attachment so the browser saves a file rather than
 * rendering it. The export is audit-logged.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      locale: true,
      role: true,
      subRole: true,
      twoFactorEnabled: true,
      emailDigestMode: true,
      createdAt: true,
      lastSeenAt: true,
      organization: {
        select: {
          id: true,
          displayName: true,
          legalName: true,
          type: true,
          country: true,
          city: true,
        },
      },
      notifications: {
        select: {
          type: true,
          title: true,
          description: true,
          read: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      authoredMessages: {
        where: { deletedAt: null },
        select: { id: true, threadId: true, body: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      supportTicketsOpened: {
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      placedBids: {
        select: {
          id: true,
          auctionId: true,
          amountCents: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      sourcingRequestsCreated: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      auditLogs: {
        select: {
          action: true,
          targetType: true,
          targetId: true,
          level: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      },
    },
  });

  if (!data) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "account.data_exported",
    targetType: "User",
    targetId: user.id,
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    notice:
      "Personal data export for your SourcingPick account (GDPR Art. 20). Contains the data we hold about you and the records you authored.",
    account: data,
  };

  const filename = `sourcingpick-data-export-${user.id}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
