-- Polymorphic Attachment table for messages, sourcing requests, orders
-- and marketplace listings. Single table keeps the queries simple
-- ("get all media for context X") and avoids 4 parallel tables that
-- would each need their own audit + storage plumbing.

CREATE TYPE "AttachmentContext" AS ENUM (
  'MESSAGE',
  'SOURCING_REQUEST',
  'ORDER',
  'MARKETPLACE_PRODUCT'
);

CREATE TYPE "AttachmentKind" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

CREATE TABLE "Attachment" (
  "id"           TEXT NOT NULL,
  "contextType"  "AttachmentContext" NOT NULL,
  "contextId"    TEXT NOT NULL,
  "uploaderId"   TEXT,
  "kind"         "AttachmentKind" NOT NULL,
  "storageUrl"   TEXT NOT NULL,
  "mimeType"     TEXT NOT NULL,
  "sizeBytes"    INTEGER NOT NULL,
  "originalName" TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Attachment_contextType_contextId_idx"
  ON "Attachment" ("contextType", "contextId");

ALTER TABLE "Attachment"
  ADD CONSTRAINT "Attachment_uploaderId_fkey"
  FOREIGN KEY ("uploaderId") REFERENCES "User" ("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
