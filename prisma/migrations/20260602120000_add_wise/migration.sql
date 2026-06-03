-- Wise Business is being introduced as the live payment + payout rail
-- (decision 2026-06-02). This is additive: WISE values are added to the
-- existing enums and a wiseRecipientId column is added to Organization,
-- but Stripe / Alipay / LianLian stay in place until the migration arc
-- completes. A follow-up migration will drop the legacy values + columns.

ALTER TYPE "PayoutProvider" ADD VALUE 'WISE';
ALTER TYPE "PayoutMethod" ADD VALUE 'WISE';

ALTER TABLE "Organization"
  ADD COLUMN "wiseRecipientId" TEXT;
