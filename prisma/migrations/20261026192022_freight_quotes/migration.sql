-- CreateEnum
CREATE TYPE "FreightQuoteStatus" AS ENUM ('SENT', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "FreightQuote" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdById" TEXT,
    "status" "FreightQuoteStatus" NOT NULL DEFAULT 'SENT',
    "request" JSONB NOT NULL,
    "estimate" JSONB NOT NULL,
    "mode" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "line" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "rmbCents" INTEGER NOT NULL DEFAULT 0,
    "eurPartCents" INTEGER NOT NULL DEFAULT 0,
    "usdCents" INTEGER NOT NULL DEFAULT 0,
    "fxCnyEurMicros" INTEGER,
    "fxUsdEurMicros" INTEGER,
    "amountEurCents" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreightQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreightQuote_reference_key" ON "FreightQuote"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "FreightQuote_invoiceId_key" ON "FreightQuote"("invoiceId");

-- CreateIndex
CREATE INDEX "FreightQuote_organizationId_status_idx" ON "FreightQuote"("organizationId", "status");

-- CreateIndex
CREATE INDEX "FreightQuote_orderId_idx" ON "FreightQuote"("orderId");

-- CreateIndex
CREATE INDEX "FreightQuote_status_createdAt_idx" ON "FreightQuote"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "FreightQuote" ADD CONSTRAINT "FreightQuote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightQuote" ADD CONSTRAINT "FreightQuote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightQuote" ADD CONSTRAINT "FreightQuote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightQuote" ADD CONSTRAINT "FreightQuote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
