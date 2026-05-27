import "server-only";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Clear `flashSaleEndsAt` and `compareAtCents` on listings whose flash-sale
 * window has closed. The badge already disappears client-side once
 * `flashSaleEndsAt < now`, but the strikethrough (driven by `compareAtCents`)
 * lingers until something clears it — that's the bug this sweep fixes.
 *
 * Pure database work; safe to call from a cron handler or a one-shot CLI
 * script. Returns the number of rows touched plus a sample of references for
 * the audit log payload.
 */
export async function sweepExpiredFlashSales(): Promise<{
  clearedCount: number;
  sampleReferences: string[];
}> {
  const now = new Date();

  // Pull a small sample for the audit log before mutating — useful when
  // chasing "why did this listing's price flip" in support tickets.
  const sample = await prisma.marketplaceProduct.findMany({
    where: {
      flashSaleEndsAt: { lt: now },
      // Either field non-null is enough to be worth touching.
      OR: [
        { compareAtCents: { not: null } },
        { flashSaleEndsAt: { not: null } },
      ],
    },
    select: { reference: true },
    take: 10,
  });

  const result = await prisma.marketplaceProduct.updateMany({
    where: {
      flashSaleEndsAt: { lt: now },
    },
    data: {
      flashSaleEndsAt: null,
      compareAtCents: null,
    },
  });

  if (result.count > 0) {
    await writeAuditLog({
      action: "marketplace.flash_sales_swept",
      payload: {
        clearedCount: result.count,
        sampleReferences: sample.map((s) => s.reference),
      },
    });
  }

  return {
    clearedCount: result.count,
    sampleReferences: sample.map((s) => s.reference),
  };
}
