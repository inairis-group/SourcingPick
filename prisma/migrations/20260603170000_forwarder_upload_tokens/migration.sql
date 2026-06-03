-- Partner item #15 — forwarder magic-link upload tokens.
-- A factory generates a token for its Order; the resulting magic URL
-- lets a forwarder upload ORDER_SHIPMENT_PROOF photos without holding
-- a SourcingPick account.
CREATE TABLE "ForwarderUploadToken" (
  "id"               TEXT NOT NULL,
  "token"            TEXT NOT NULL,
  "orderId"          TEXT NOT NULL,
  "createdByUserId"  TEXT,
  "label"            TEXT,
  "expiresAt"        TIMESTAMP(3) NOT NULL,
  "lastUsedAt"       TIMESTAMP(3),
  "uploadCount"      INTEGER NOT NULL DEFAULT 0,
  "revokedAt"        TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ForwarderUploadToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForwarderUploadToken_token_key"
  ON "ForwarderUploadToken" ("token");
CREATE INDEX "ForwarderUploadToken_orderId_revokedAt_idx"
  ON "ForwarderUploadToken" ("orderId", "revokedAt");
CREATE INDEX "ForwarderUploadToken_expiresAt_idx"
  ON "ForwarderUploadToken" ("expiresAt");

ALTER TABLE "ForwarderUploadToken"
  ADD CONSTRAINT "ForwarderUploadToken_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForwarderUploadToken"
  ADD CONSTRAINT "ForwarderUploadToken_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
