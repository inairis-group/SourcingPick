import "server-only";
import { prisma } from "@/lib/db/client";
import { getStripe } from "./client";

/**
 * Get the Stripe Customer ID for an org, creating one on first use.
 *
 * We don't pre-create customers at signup — the bulk of orgs will never
 * pay (the factories don't pay, and many client orgs sign up to browse).
 * Lazy creation avoids dead Stripe Customer rows.
 */
export async function getOrCreateStripeCustomerId(
  organizationId: string,
): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      legalName: true,
      displayName: true,
      country: true,
      city: true,
      address: true,
      vatNumber: true,
      stripeCustomerId: true,
      users: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { email: true, firstName: true, lastName: true },
      },
    },
  });
  if (!org) throw new Error(`Organization ${organizationId} not found.`);
  if (org.stripeCustomerId) return org.stripeCustomerId;

  const stripe = getStripe();
  const primary = org.users[0];
  const customer = await stripe.customers.create({
    name: org.legalName || org.displayName,
    email: primary?.email,
    address: {
      line1: org.address,
      city: org.city,
      country: org.country,
    },
    metadata: {
      organizationId: org.id,
      vatNumber: org.vatNumber ?? "",
    },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
