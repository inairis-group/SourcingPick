-- Partner item #6 — surface Wise webhook deliveries (including failed
-- reconciliations) in the admin webhook dashboard so an operator can
-- spot a buyer wire that didn't match an order before it stalls.
ALTER TYPE "WebhookSource" ADD VALUE 'WISE';
