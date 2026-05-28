-- Research-fee payment timestamp (anchors the 30-day credit-back window)
-- + platform-credit ledger (research-fee credit-back source, order-deposit sink).

ALTER TABLE "SourcingRequest" ADD COLUMN "researchFeePaidAt" TIMESTAMP(3);

CREATE TYPE "CreditReason" AS ENUM (
  'RESEARCH_FEE_CREDIT',
  'ORDER_APPLIED',
  'ADMIN_ADJUSTMENT'
);

CREATE TABLE "CreditTransaction" (
  "id"              TEXT NOT NULL,
  "organizationId"  TEXT NOT NULL,
  "amountCents"     INTEGER NOT NULL,
  "reason"          "CreditReason" NOT NULL,
  "refType"         TEXT,
  "refId"           TEXT,
  "note"            TEXT,
  "createdByUserId" TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditTransaction_organizationId_createdAt_idx"
  ON "CreditTransaction" ("organizationId", "createdAt");

ALTER TABLE "CreditTransaction"
  ADD CONSTRAINT "CreditTransaction_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
