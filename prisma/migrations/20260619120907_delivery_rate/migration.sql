-- CreateTable
CREATE TABLE "DeliveryRate" (
    "id" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "incoterm" "Incoterm" NOT NULL,
    "weightBracketKg" INTEGER NOT NULL,
    "minCents" INTEGER NOT NULL,
    "maxCents" INTEGER NOT NULL,
    "partnerName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryRate_originCountry_destinationCountry_idx" ON "DeliveryRate"("originCountry", "destinationCountry");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRate_originCountry_destinationCountry_incoterm_weig_key" ON "DeliveryRate"("originCountry", "destinationCountry", "incoterm", "weightBracketKg");
