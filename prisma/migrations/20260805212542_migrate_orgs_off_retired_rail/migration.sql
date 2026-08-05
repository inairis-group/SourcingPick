-- Move any organisation still pointing at the retired Wise rail onto PingPong.
--
-- The account id is cleared rather than carried over: a Wise recipient id is
-- meaningless to PingPong, and leaving it in place would look like a
-- configured payout account while every dispatch failed. Status drops to
-- PENDING so the factory is prompted to onboard again, which they genuinely
-- have to do.
--
-- Payout and EscrowTransaction rows are untouched — they are immutable
-- financial records and keep referencing WISE for the transfers it actually
-- made.
UPDATE "Organization"
SET "payoutProvider"  = 'PINGPONG',
    "payoutAccountId" = NULL,
    "payoutStatus"    = 'PENDING'
WHERE "payoutProvider" = 'WISE';
