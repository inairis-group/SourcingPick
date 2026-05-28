import "server-only";
import { prisma } from "@/lib/db/client";

// Re-export the pure application math so server callers can import it from
// one place. The pure logic lives in ./apply (no server-only) so tests can
// exercise it without pulling the server-only guard.
export {
  computeCreditApplication,
  STRIPE_MIN_CHARGE_CENTS,
} from "./apply";

/**
 * An organisation's platform-credit balance = sum of its CreditTransaction
 * rows (positive grants, negative spends). The ledger is the source of
 * truth; we sum on read rather than maintaining a denormalised column that
 * could drift. Never negative in practice (spends are guarded), but we
 * clamp to 0 defensively.
 */
export async function getOrgCreditBalanceCents(
  orgId: string,
): Promise<number> {
  const agg = await prisma.creditTransaction.aggregate({
    where: { organizationId: orgId },
    _sum: { amountCents: true },
  });
  return Math.max(0, agg._sum.amountCents ?? 0);
}
