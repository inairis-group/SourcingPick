-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESPONDED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DisputeOutcome" AS ENUM ('STANDARD', 'CUSTOM', 'REJECT');

-- AlterEnum
ALTER TYPE "AttachmentContext" ADD VALUE 'DISPUTE_EVIDENCE';

-- DropIndex
DROP INDEX "SourcingRequest_preTenderApprovedAt_idx";

-- AlterTable
ALTER TABLE "Auction" ALTER COLUMN "images" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "primaryEscrowId" TEXT,
    "openedByUserId" TEXT NOT NULL,
    "buyerStatement" TEXT NOT NULL,
    "factoryStatement" TEXT,
    "adminDecision" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "outcome" "DisputeOutcome",
    "refundCents" INTEGER,
    "retainedCents" INTEGER,
    "platformShareCents" INTEGER,
    "supplierShareCents" INTEGER,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_reference_key" ON "Dispute"("reference");

-- CreateIndex
CREATE INDEX "Dispute_orderId_status_idx" ON "Dispute"("orderId", "status");

-- CreateIndex
CREATE INDEX "Dispute_status_openedAt_idx" ON "Dispute"("status", "openedAt");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_primaryEscrowId_fkey" FOREIGN KEY ("primaryEscrowId") REFERENCES "EscrowTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
