
-- CreateEnum
CREATE TYPE "PayoutKind" AS ENUM ('ESCROW_RELEASE', 'FREIGHT');

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "kind" "PayoutKind" NOT NULL DEFAULT 'ESCROW_RELEASE',
ADD COLUMN     "payeeOrgId" TEXT,
ADD COLUMN     "shipmentId" TEXT,
ALTER COLUMN "escrowId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payout_shipmentId_key" ON "Payout"("shipmentId");

-- CreateIndex
CREATE INDEX "Payout_payeeOrgId_status_idx" ON "Payout"("payeeOrgId", "status");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_payeeOrgId_fkey" FOREIGN KEY ("payeeOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill: every existing payout was a factory escrow release, so the payee
-- is the factory. Done here rather than left null so `payeeOrg` is safe to
-- read on historical rows and finance reports need no fallback.
UPDATE "Payout" SET "payeeOrgId" = "factoryOrgId" WHERE "payeeOrgId" IS NULL;
