-- CreateEnum
CREATE TYPE "KycDocumentKind" AS ENUM ('REGISTRY', 'TAX', 'FACILITY_PHOTO', 'REFERENCES', 'INSURANCE', 'OTHER');

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" "KycDocumentKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KycDocument_organizationId_kind_idx" ON "KycDocument"("organizationId", "kind");

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

