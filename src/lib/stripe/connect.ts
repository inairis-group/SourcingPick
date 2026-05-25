import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/client";
import type { Locale } from "@/lib/i18n/config";
import { getSiteUrl, getStripe } from "./client";

export type ConnectStatus = {
  /** Whether a Connected Account exists at Stripe for this org. */
  exists: boolean;
  /** Stripe says the account can receive payouts. */
  payoutsEnabled: boolean;
  /** Stripe says the account can be charged (we don't currently charge them, but it indicates a healthy account). */
  chargesEnabled: boolean;
  /** Onboarding requirements still due — non-empty means the factory has unfinished forms. */
  requirementsDue: string[];
  /** Stripe account ID, when one exists. */
  accountId: string | null;
};

/**
 * Get or create a Stripe Connect Express account for a factory org.
 *
 * Express is the right v1 call: Stripe hosts the onboarding (KYC, bank
 * details, ToS), we just generate AccountLinks. The factory's CGV cover
 * the platform-managed relationship.
 *
 * Country is inferred from the Organization row. Currency defaults to EUR
 * since v1 priced everything in euros.
 */
export async function getOrCreateConnectAccountId(
  organizationId: string,
): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      country: true,
      legalName: true,
      stripeConnectAccountId: true,
      users: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { email: true },
      },
    },
  });
  if (!org) throw new Error(`Organization ${organizationId} not found.`);
  if (org.stripeConnectAccountId) return org.stripeConnectAccountId;

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: "express",
    country: org.country || "FR",
    email: org.users[0]?.email,
    business_profile: {
      name: org.legalName,
    },
    capabilities: {
      transfers: { requested: true },
    },
    default_currency: "eur",
    metadata: {
      organizationId: org.id,
    },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeConnectAccountId: account.id },
  });

  return account.id;
}

/**
 * Generate a one-time Stripe-hosted onboarding URL for the factory.
 *
 * Account Links expire after a short window (Stripe default ~5 minutes for
 * onboarding type). We always mint a fresh one on each click so the
 * factory never lands on a stale page.
 */
export async function createConnectOnboardingLink(
  organizationId: string,
  locale: Locale,
): Promise<string> {
  const accountId = await getOrCreateConnectAccountId(organizationId);
  const stripe = getStripe();
  const siteUrl = getSiteUrl();
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${siteUrl}/${locale}/factory/payouts?connect=refresh`,
    return_url: `${siteUrl}/${locale}/factory/payouts?connect=done`,
  });
  return link.url;
}

/**
 * Read live status from Stripe. We don't cache on our side — the factory
 * payouts page is a low-traffic surface and freshness matters more than
 * the cost of one API hop.
 */
export async function fetchConnectStatus(
  organizationId: string,
): Promise<ConnectStatus> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { stripeConnectAccountId: true },
  });
  if (!org?.stripeConnectAccountId) {
    return {
      exists: false,
      payoutsEnabled: false,
      chargesEnabled: false,
      requirementsDue: [],
      accountId: null,
    };
  }
  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve(org.stripeConnectAccountId);
    return connectStatusFromAccount(account);
  } catch {
    return {
      exists: true,
      payoutsEnabled: false,
      chargesEnabled: false,
      requirementsDue: ["stripe_unreachable"],
      accountId: org.stripeConnectAccountId,
    };
  }
}

export function connectStatusFromAccount(
  account: Stripe.Account,
): ConnectStatus {
  const due = [
    ...(account.requirements?.currently_due ?? []),
    ...(account.requirements?.past_due ?? []),
  ];
  return {
    exists: true,
    payoutsEnabled: Boolean(account.payouts_enabled),
    chargesEnabled: Boolean(account.charges_enabled),
    requirementsDue: Array.from(new Set(due)),
    accountId: account.id,
  };
}
