-- CreateEnum
CREATE TYPE "Vendor1688OrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "Vendor1688Order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientOrgId" TEXT NOT NULL,
    "placedByUserId" TEXT,
    "status" "Vendor1688OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "offerSnapshot" JSONB NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerUrl" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceFen" INTEGER NOT NULL,
    "subtotalFen" INTEGER NOT NULL,
    "markupBps" INTEGER NOT NULL,
    "markupFen" INTEGER NOT NULL,
    "totalFen" INTEGER NOT NULL,
    "vendorOrderId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor1688Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor1688Order_reference_key" ON "Vendor1688Order"("reference");

-- CreateIndex
CREATE INDEX "Vendor1688Order_clientOrgId_status_idx" ON "Vendor1688Order"("clientOrgId", "status");

-- CreateIndex
CREATE INDEX "Vendor1688Order_status_updatedAt_idx" ON "Vendor1688Order"("status", "updatedAt");
