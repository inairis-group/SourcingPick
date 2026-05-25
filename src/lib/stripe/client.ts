import "server-only";
import Stripe from "stripe";

/**
 * Stripe client singleton — pinned API version so a Stripe-side dashboard
 * version bump doesn't silently change the shape of webhook events.
 *
 * In v1 we run against test mode by default. Wire the live keys when ready
 * to ship (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in production env).
 */

// Pinned API version. Bump intentionally alongside Stripe SDK upgrades and
// re-test the webhook event shapes.
const API_VERSION = "2026-04-22.dahlia" as const;

let cached: Stripe | undefined;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env to enable payments.",
    );
  }
  cached = new Stripe(key, {
    apiVersion: API_VERSION,
    typescript: true,
    appInfo: {
      name: "SourcingPick",
      version: "0.1.0",
    },
  });
  return cached;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Run `stripe listen` and copy the signing secret to .env.",
    );
  }
  return secret;
}

/** Public site URL used to build absolute Stripe redirect URLs. */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  );
}
