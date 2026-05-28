-- Extend PayoutMethod so a Payout row can record LianLian / Alipay rails,
-- matching the PayoutProvider choices a factory can onboard with.
ALTER TYPE "PayoutMethod" ADD VALUE 'LIANLIAN';
ALTER TYPE "PayoutMethod" ADD VALUE 'ALIPAY';
