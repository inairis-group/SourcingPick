/**
 * Dev seed for SourcingPick.
 *
 * Idempotent-ish: guards against re-seeding if a PLATFORM org already exists.
 * To force re-seed, run `npm run db:reset` (destructive, gated).
 *
 * What this creates:
 *   - 1 PLATFORM org + 2 admin users + 2 agent users
 *   - 3 CLIENT orgs (FR, BR, JP) with verified KYC + owner users
 *   - 5 FACTORY orgs (PT, MA, VN, IN, TR) covering multiple regions and
 *     categories — mixed KYC states (verified, pending, flagged)
 *   - FactoryProfile for each factory
 *   - 4 published Marketplace products
 *   - 2 sample sourcing requests in different statuses
 *
 * All passwords: "password123!" (bcrypt cost 12). Dev only — production
 * onboarding sets real passwords through the signup flow.
 */

import "dotenv/config";
import { hash } from "bcryptjs";
import {
  Category,
  Incoterm,
  KycStatus,
  Locale,
  MarketplaceProductStatus,
  OrgType,
  Role,
  SourcingRegion,
  SourcingStatus,
  SubRole,
} from "@prisma/client";
import { prisma } from "../src/lib/db/client";

const DEV_PASSWORD = "password123!";

async function main() {
  const existing = await prisma.organization.count({
    where: { type: OrgType.PLATFORM },
  });
  if (existing > 0) {
    console.log("Seed skipped — PLATFORM org already exists. Run db:reset to re-seed.");
    return;
  }

  const passwordHash = await hash(DEV_PASSWORD, 12);

  // ---- PLATFORM org + staff ----
  const platform = await prisma.organization.create({
    data: {
      type: OrgType.PLATFORM,
      legalName: "SourcingPick SAS",
      displayName: "SourcingPick",
      country: "FR",
      city: "Paris",
      address: "1 rue de la Plateforme, 75001 Paris",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "caleb@inairis.fr",
        firstName: "Caystone",
        lastName: "Inairis",
        passwordHash,
        emailVerified: new Date(),
        role: Role.ADMIN,
        subRole: SubRole.SUPER,
        organizationId: platform.id,
        hasOnboarded: true,
        twoFactorEnabled: true,
        locale: Locale.en,
      },
      {
        email: "admin@inairis.fr",
        firstName: "Adam",
        lastName: "Inairis",
        passwordHash,
        emailVerified: new Date(),
        role: Role.ADMIN,
        subRole: SubRole.SUPER,
        organizationId: platform.id,
        hasOnboarded: true,
        twoFactorEnabled: true,
        locale: Locale.fr,
      },
      {
        email: "ops@sourcingpick.dev",
        firstName: "Léa",
        lastName: "Martin",
        passwordHash,
        emailVerified: new Date(),
        role: Role.ADMIN,
        subRole: SubRole.MEMBER,
        organizationId: platform.id,
        hasOnboarded: true,
        locale: Locale.fr,
      },
      {
        email: "senior-agent@sourcingpick.dev",
        firstName: "Karim",
        lastName: "Bensaïd",
        passwordHash,
        emailVerified: new Date(),
        role: Role.AGENT,
        subRole: SubRole.SENIOR,
        organizationId: platform.id,
        hasOnboarded: true,
        locale: Locale.fr,
      },
      {
        email: "agent@sourcingpick.dev",
        firstName: "Sofia",
        lastName: "Almeida",
        passwordHash,
        emailVerified: new Date(),
        role: Role.AGENT,
        subRole: SubRole.AGENT,
        organizationId: platform.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
    ],
  });

  // ---- CLIENT orgs (global spread) ----
  const clientBJ = await prisma.organization.create({
    data: {
      type: OrgType.CLIENT,
      legalName: "Caleb-Livingstone Emmanuel",
      displayName: "Caystone",
      country: "BJ",
      city: "Cotonou",
      address: "Lot 4125, Haie Vive, Cotonou",
      siren: "812345678",
      vatNumber: "FR40812345678",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
    },
  });

  const clientFR = await prisma.organization.create({
    data: {
      type: OrgType.CLIENT,
      legalName: "Adam Fernandez",
      displayName: "Adam Fernandez",
      country: "FR",
      city: "Paris",
      address: "15 Rue de la Paix, 75002 Paris",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
    },
  });

  const clientJP = await prisma.organization.create({
    data: {
      type: OrgType.CLIENT,
      legalName: "Tokyo Kura K.K.",
      displayName: "Tokyo Kura",
      country: "JP",
      city: "Tokyo",
      address: "1-1 Marunouchi, Chiyoda-ku, Tokyo",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "inairiscore@gmail.com",
        firstName: "Adam",
        lastName: "Fernandez",
        passwordHash,
        emailVerified: new Date(),
        role: Role.CLIENT,
        subRole: SubRole.OWNER,
        organizationId: clientFR.id,
        hasOnboarded: true,
        locale: Locale.fr,
      },
      {
        email: "emmanuelcaleb546@gmail.com",
        firstName: "Caleb-Livingstone",
        lastName: "Emmanuel",
        passwordHash,
        emailVerified: new Date(),
        role: Role.CLIENT,
        subRole: SubRole.OWNER,
        organizationId: clientBJ.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
      {
        email: "owner@tokyokura.example",
        firstName: "Hana",
        lastName: "Sato",
        passwordHash,
        emailVerified: new Date(),
        role: Role.CLIENT,
        subRole: SubRole.OWNER,
        organizationId: clientJP.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
    ],
  });

  // ---- FACTORY orgs (mixed regions, KYC states) ----
  const factoryPT = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Têxtil Norte Lda",
      displayName: "Têxtil Norte",
      country: "PT",
      city: "Porto",
      address: "Rua da Indústria 200, 4000-001 Porto",
      vatNumber: "PT502000000",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
      factoryProfile: {
        create: {
          category: Category.TEXTILE,
          foundedYear: 1998,
          employees: 85,
          capabilities: ["weaving", "dyeing", "finishing", "OEKO-TEX"],
          languages: ["pt", "en", "fr"],
          rating: 4.6,
          totalOrders: 142,
          certifications: ["OEKO-TEX Standard 100", "GOTS"],
        },
      },
    },
  });

  const factoryMA = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Atlas Cuir SARL",
      displayName: "Atlas Cuir",
      country: "MA",
      city: "Casablanca",
      address: "Zone industrielle Sidi Bernoussi, Casablanca",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
      factoryProfile: {
        create: {
          category: Category.HOME,
          foundedYear: 2005,
          employees: 40,
          capabilities: ["leather goods", "upholstery", "small series"],
          languages: ["fr", "ar", "en"],
          rating: 4.3,
          totalOrders: 68,
          certifications: [],
        },
      },
    },
  });

  const factoryVN = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Saigon Stationery Co.",
      displayName: "Saigon Stationery",
      country: "VN",
      city: "Ho Chi Minh City",
      address: "12 Nguyen Van Cu, District 1, HCMC",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
      factoryProfile: {
        create: {
          category: Category.STATIONERY,
          foundedYear: 2012,
          employees: 120,
          capabilities: ["notebooks", "binding", "embossing", "custom packaging"],
          languages: ["vi", "en", "zh"],
          rating: 4.4,
          totalOrders: 211,
          certifications: ["FSC Chain of Custody"],
        },
      },
    },
  });

  const factoryIN = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Jaipur Cosmetics Pvt Ltd",
      displayName: "Jaipur Cosmetics",
      country: "IN",
      city: "Jaipur",
      address: "Sitapura Industrial Area, Jaipur 302022",
      kycStatus: KycStatus.PENDING,
      factoryProfile: {
        create: {
          category: Category.COSMETICS,
          foundedYear: 2018,
          employees: 25,
          capabilities: ["natural cosmetics", "private label", "small MOQ"],
          languages: ["hi", "en"],
          rating: 0,
          totalOrders: 0,
          certifications: [],
        },
      },
    },
  });

  const factoryTR = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Anadolu Metal A.Ş.",
      displayName: "Anadolu Metal",
      country: "TR",
      city: "Istanbul",
      address: "Tuzla Sanayi Sitesi, Istanbul",
      kycStatus: KycStatus.FLAGGED,
      kycVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      factoryProfile: {
        create: {
          category: Category.METAL,
          foundedYear: 1995,
          employees: 200,
          capabilities: ["cnc machining", "stamping", "assembly"],
          languages: ["tr", "en", "de"],
          rating: 3.2,
          totalOrders: 51,
          certifications: ["ISO 9001:2015"],
        },
      },
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "owner@textil-norte.example",
        firstName: "Joaquim",
        lastName: "Pereira",
        passwordHash,
        emailVerified: new Date(),
        role: Role.FACTORY,
        subRole: SubRole.OWNER,
        organizationId: factoryPT.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
      {
        email: "owner@atlas-cuir.example",
        firstName: "Yasmine",
        lastName: "El Amrani",
        passwordHash,
        emailVerified: new Date(),
        role: Role.FACTORY,
        subRole: SubRole.OWNER,
        organizationId: factoryMA.id,
        hasOnboarded: true,
        locale: Locale.fr,
      },
      {
        email: "owner@saigon-stationery.example",
        firstName: "Linh",
        lastName: "Tran",
        passwordHash,
        emailVerified: new Date(),
        role: Role.FACTORY,
        subRole: SubRole.OWNER,
        organizationId: factoryVN.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
      {
        email: "owner@jaipur-cosmetics.example",
        firstName: "Priya",
        lastName: "Sharma",
        passwordHash,
        role: Role.FACTORY,
        subRole: SubRole.OWNER,
        organizationId: factoryIN.id,
        hasOnboarded: false, // pending KYC, not yet onboarded
        locale: Locale.en,
      },
      {
        email: "owner@anadolu-metal.example",
        firstName: "Mehmet",
        lastName: "Yılmaz",
        passwordHash,
        emailVerified: new Date(),
        role: Role.FACTORY,
        subRole: SubRole.OWNER,
        organizationId: factoryTR.id,
        hasOnboarded: true,
        locale: Locale.en,
      },
    ],
  });

  // ---- Marketplace products ----
  await prisma.marketplaceProduct.createMany({
    data: [
      {
        reference: "MKT-001",
        factoryOrgId: factoryPT.id,
        name: "Organic cotton tote, 250gsm",
        category: Category.TEXTILE,
        description:
          "GOTS-certified organic cotton tote bag, natural undyed, with reinforced handles. MOQ-friendly for SMEs.",
        images: [],
        priceCentsClient: 320, // €3.20
        priceCentsFactory: 240,
        moq: 500,
        stockAvailable: 12000,
        stockLowThreshold: 2000,
        leadTimeDays: 21,
        certifications: ["GOTS", "OEKO-TEX Standard 100"],
        status: MarketplaceProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        reference: "MKT-002",
        factoryOrgId: factoryVN.id,
        name: "A5 hardcover notebook, dotted, 192p",
        category: Category.STATIONERY,
        description:
          "Hardcover A5 notebook with dotted FSC paper, lay-flat binding, elastic closure. Custom logo embossing available.",
        images: [],
        priceCentsClient: 480,
        priceCentsFactory: 320,
        moq: 1000,
        stockAvailable: 8500,
        leadTimeDays: 28,
        certifications: ["FSC Chain of Custody"],
        status: MarketplaceProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        reference: "MKT-003",
        factoryOrgId: factoryMA.id,
        name: "Vegetable-tanned leather card holder",
        category: Category.HOME,
        description:
          "Vegetable-tanned full-grain leather card holder, 4 slots, hand-stitched. Custom embossing and color options.",
        images: [],
        priceCentsClient: 1850,
        priceCentsFactory: 1200,
        moq: 100,
        stockAvailable: 240,
        stockLowThreshold: 50,
        leadTimeDays: 35,
        certifications: [],
        status: MarketplaceProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        reference: "MKT-004",
        factoryOrgId: factoryPT.id,
        name: "Linen tea towel set, 3-pack, natural",
        category: Category.HOME,
        description:
          "100% European linen tea towel set, stone-washed for softness. Hemmed edges, hanging loop.",
        images: [],
        priceCentsClient: 1490,
        priceCentsFactory: 950,
        moq: 250,
        stockAvailable: 0,
        leadTimeDays: 21,
        certifications: ["OEKO-TEX Standard 100"],
        status: MarketplaceProductStatus.OUT_OF_STOCK,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    ],
  });

  // ---- Sourcing requests ----
  const clientFROwner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@maison-lumiere.example" },
  });
  const seniorAgent = await prisma.user.findUniqueOrThrow({
    where: { email: "senior-agent@sourcingpick.dev" },
  });

  await prisma.sourcingRequest.create({
    data: {
      reference: "REQ-100001",
      clientOrgId: clientFR.id,
      createdByUserId: clientFROwner.id,
      agentId: seniorAgent.id,
      title: "Bougies parfumées céramique — édition automne",
      category: Category.HOME,
      quantity: 3000,
      budgetCents: 4500000, // €45 000
      targetUnitPriceCents: 1500, // €15
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      deliveryAddress: "Maison Lumière, 12 rue de la République, 69001 Lyon",
      incoterm: Incoterm.DAP,
      sourcingRegion: SourcingRegion.EUROPE,
      requiredCerts: ["FSC", "REACH"],
      status: SourcingStatus.ASSIGNED,
      assignedAt: new Date(),
    },
  });

  const clientJPOwner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@tokyokura.example" },
  });

  await prisma.sourcingRequest.create({
    data: {
      reference: "REQ-100002",
      clientOrgId: clientJP.id,
      createdByUserId: clientJPOwner.id,
      title: "Custom A4 organic cotton tote, branded",
      category: Category.TEXTILE,
      quantity: 8000,
      budgetCents: 4000000,
      targetUnitPriceCents: 500,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      deliveryAddress: "Tokyo Kura, 1-1 Marunouchi, Chiyoda-ku, Tokyo",
      incoterm: Incoterm.FOB,
      sourcingRegion: SourcingRegion.ANYWHERE,
      requiredCerts: ["GOTS", "OEKO-TEX"],
      status: SourcingStatus.REQUEST_RECEIVED,
    },
  });

  // ---- Summary ----
  const counts = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.factoryProfile.count(),
    prisma.marketplaceProduct.count(),
    prisma.sourcingRequest.count(),
  ]);

  console.log("Seed complete:");
  console.log(`  Organizations:        ${counts[0]}`);
  console.log(`  Users:                ${counts[1]}`);
  console.log(`  Factory profiles:     ${counts[2]}`);
  console.log(`  Marketplace products: ${counts[3]}`);
  console.log(`  Sourcing requests:    ${counts[4]}`);
  console.log("");
  console.log(`Default dev password: ${DEV_PASSWORD}`);
  console.log("");
  console.log("Login as:");
  console.log("  caleb@inairis.fr          (Admin Super)");
  console.log("  admin@inairis.fr          (Admin Super)");
  console.log("  ops@sourcingpick.dev            (Admin Member)");
  console.log("  senior-agent@sourcingpick.dev   (Agent Senior)");
  console.log("  agent@sourcingpick.dev          (Agent)");
  console.log("  emmanuelcaleb546@gmail.com    (Client FR — Growth plan)");
  console.log("  owner@casabossa.example         (Client BR — Starter plan)");
  console.log("  owner@tokyokura.example         (Client JP — Pro plan)");
  console.log("  owner@textil-norte.example      (Factory PT — verified)");
  console.log("  owner@atlas-cuir.example        (Factory MA — verified)");
  console.log("  owner@saigon-stationery.example (Factory VN — verified)");
  console.log("  owner@jaipur-cosmetics.example  (Factory IN — KYC pending)");
  console.log("  owner@anadolu-metal.example     (Factory TR — flagged)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
