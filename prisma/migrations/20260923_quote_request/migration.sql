-- CreateEnum
CREATE TYPE "QuoteRequestService" AS ENUM ('LOGISTICS', 'SOURCING_LOGISTICS');

-- CreateEnum
CREATE TYPE "QuoteRequestKind" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'ANSWERED', 'CONVERTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "service" "QuoteRequestService" NOT NULL,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'NEW',
    "products" TEXT NOT NULL,
    "quantity" TEXT,
    "volume" TEXT,
    "goodsValue" TEXT,
    "supplierCount" TEXT,
    "supplierCities" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "destinationCity" TEXT,
    "arrivalDate" TEXT,
    "kind" "QuoteRequestKind" NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'fr',
    "linkedUserId" TEXT,
    "ipHash" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_reference_key" ON "QuoteRequest"("reference");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteRequest_email_idx" ON "QuoteRequest"("email");

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

