import "server-only";
import { PayoutStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";

/**
 * What an organisation has been paid, and what it is still owed.
 *
 * One query for factories, agents and shippers because the question is
 * identical — "where is my money?" — and three near-copies of it would drift.
 * They differ only in what generates the rows, which is `Payout.kind`.
 *
 * Reads `payeeOrgId`, falling back to `factoryOrgId` for rows written before
 * the payee column existed. The migration backfilled those, so the fallback is
 * belt-and-braces rather than load-bearing.
 *
 * Deliberately reports what is *recorded*, not what a provider says. A payout
 * marked SENT is money we dispatched; whether it has cleared the receiving
 * bank is the rail's business and would need a reconciliation feed we don't
 * have. The labels say "sent", never "received", so nobody reads a settled
 * balance as cleared funds.
 */

export type PayoutBalance = {
  /// Dispatched to the provider.
  sentCents: number;
  /// Owed and recorded, not yet dispatched — usually awaiting payout setup.
  pendingCents: number;
  /// Attempted and refused. Needs a human.
  failedCents: number;
  /// Non-null when something is blocking payment, so the UI can say what.
  blockedReason: string | null;
  payoutAccountReady: boolean;
  recent: {
    id: string;
    reference: string;
    kind: string;
    amountCents: number;
    supplierFeeCents: number;
    status: PayoutStatus;
    createdAt: Date;
    sentAt: Date | null;
    failureReason: string | null;
    orderReference: string | null;
    shipmentReference: string | null;
  }[];
};

const EARNING_ROLES: ReadonlySet<Role> = new Set([
  Role.FACTORY,
  Role.AGENT,
  Role.SHIPPER,
]);

export async function getPayoutBalance(): Promise<PayoutBalance | null> {
  const user = await requireAuth();
  if (!EARNING_ROLES.has(user.role)) return null;

  const orgId = user.organizationId;

  const [org, grouped, recent] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { payoutProvider: true, payoutAccountId: true, payoutStatus: true },
    }),
    prisma.payout.groupBy({
      by: ["status"],
      where: { OR: [{ payeeOrgId: orgId }, { factoryOrgId: orgId }] },
      _sum: { amountCents: true },
    }),
    prisma.payout.findMany({
      where: { OR: [{ payeeOrgId: orgId }, { factoryOrgId: orgId }] },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        reference: true,
        kind: true,
        amountCents: true,
        supplierFeeCents: true,
        status: true,
        createdAt: true,
        sentAt: true,
        failureReason: true,
        escrow: { select: { order: { select: { reference: true } } } },
        shipment: { select: { reference: true } },
      },
    }),
  ]);

  const sumFor = (s: PayoutStatus) =>
    grouped.find((g) => g.status === s)?._sum.amountCents ?? 0;

  const payoutAccountReady = Boolean(
    org?.payoutProvider && org.payoutAccountId,
  );
  const pendingCents = sumFor(PayoutStatus.PENDING);

  return {
    sentCents: sumFor(PayoutStatus.SENT),
    pendingCents,
    failedCents: sumFor(PayoutStatus.FAILED),
    // Only claim a blocker when there is actually money waiting on it —
    // nagging someone with no earnings to configure a payout account is noise.
    blockedReason:
      pendingCents > 0 && !payoutAccountReady ? "payout_account_missing" : null,
    payoutAccountReady,
    recent: recent.map((p) => ({
      id: p.id,
      reference: p.reference,
      kind: p.kind,
      amountCents: p.amountCents,
      supplierFeeCents: p.supplierFeeCents,
      status: p.status,
      createdAt: p.createdAt,
      sentAt: p.sentAt,
      failureReason: p.failureReason,
      orderReference: p.escrow?.order?.reference ?? null,
      shipmentReference: p.shipment?.reference ?? null,
    })),
  };
}
