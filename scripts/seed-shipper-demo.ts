/**
 * Idempotent shipper fixtures for an existing database.
 *
 * `prisma/seed.ts` early-returns once a PLATFORM org exists, so it can't
 * provision anything into a database that has already been seeded. This script
 * is safe to run repeatedly: it upserts one shipper partner and, if an order
 * without a logistics leg exists, hands it over so the shipper queue is not
 * empty.
 *
 * Run: `npx tsx scripts/seed-shipper-demo.ts`
 */
import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  KycStatus,
  Locale,
  OrgType,
  PrismaClient,
  Role,
  ShipmentStatus,
  SubRole,
} from "@prisma/client";

// Prisma 7 needs a driver adapter — the connection URL is no longer in the
// schema. Mirrors src/lib/db/client.ts.
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
/**
 * Two partners on purpose. One is enough to exercise the role, but the
 * hand-off picker and the org-scoping in `getShipmentForShipper` are only
 * meaningfully testable when a second shipper exists to be excluded.
 */
const PARTNERS = [
  {
    legalName: "Shenzhen Lianyun Logistics",
    displayName: "联运物流 Lianyun",
    city: "Shenzhen",
    address: "Bao'an District, Shenzhen, Guangdong",
    email: "shipper@sourcingpick.dev",
    firstName: "Wei",
    lastName: "Zhang",
  },
  {
    legalName: "Ningbo Haixing Freight",
    displayName: "海星货运 Haixing",
    city: "Ningbo",
    address: "Beilun District, Ningbo, Zhejiang",
    email: "shipper2@sourcingpick.dev",
    firstName: "Mei",
    lastName: "Lin",
  },
] as const;

const PASSWORD = "password123!";

async function main() {
  const passwordHash = await hash(PASSWORD, 12);
  const orgs: { id: string; displayName: string }[] = [];

  for (const p of PARTNERS) {
    let org = await prisma.organization.findFirst({
      where: { type: OrgType.SHIPPER, legalName: p.legalName },
      select: { id: true, displayName: true },
    });
    if (!org) {
      org = await prisma.organization.create({
        data: {
          type: OrgType.SHIPPER,
          legalName: p.legalName,
          displayName: p.displayName,
          country: "CN",
          city: p.city,
          address: p.address,
          kycStatus: KycStatus.VERIFIED,
          kycVerifiedAt: new Date(),
        },
        select: { id: true, displayName: true },
      });
      console.log(`Created shipper org: ${org.displayName}`);
    } else {
      console.log(`Shipper org already present: ${org.displayName}`);
    }
    orgs.push(org);

    const existingUser = await prisma.user.findUnique({
      where: { email: p.email },
      select: { id: true },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
          passwordHash,
          emailVerified: new Date(),
          role: Role.SHIPPER,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          hasOnboarded: true,
          locale: Locale.zh,
        },
      });
      console.log(`Created shipper user: ${p.email} / ${PASSWORD}`);
    } else {
      console.log(`Shipper user already present: ${p.email}`);
    }
  }

  const org = orgs[0];

  // Hand over one order so the queue isn't empty.
  const order = await prisma.order.findFirst({
    where: { shipment: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, reference: true },
  });
  if (!order) {
    console.log("No order without a shipment — skipping hand-off.");
    return;
  }

  const shipment = await prisma.shipment.create({
    data: {
      reference: `SHP-${Math.floor(10000 + Math.random() * 89999)}`,
      orderId: order.id,
      shipperOrgId: org.id,
      shippingMethod: "Air freight · express",
      totalWeightKg: 128.5,
      lengthCm: 120,
      widthCm: 80,
      heightCm: 95,
      destName: "Atelier Rivage SAS",
      destAddress: "12 rue des Docks",
      destCity: "Lyon",
      destPostalCode: "69009",
      destCountry: "FR",
      items: {
        create: [
          {
            label: "Cotton tote bags",
            nature: "marchandise en usage libre",
            quantity: 5000,
            unitPriceCents: 184,
          },
          {
            label: "Kraft mailers",
            nature: "marchandise en usage libre",
            quantity: 2000,
            unitPriceCents: 12,
          },
        ],
      },
      events: {
        create: { status: ShipmentStatus.QUOTE_REQUESTED, clientVisible: false },
      },
    },
    select: { reference: true },
  });
  console.log(`Handed ${order.reference} to ${org.displayName} as ${shipment.reference}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
