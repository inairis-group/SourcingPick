"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Category,
  KycDocumentKind,
  KycStatus,
  OrgType,
  Role,
  SubRole,
} from "@prisma/client";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit/log";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { storeFile, StorageError } from "@/lib/storage/local";

const ClientSignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  orgName: z.string().trim().min(2, "Organisation name is required.").max(200),
  country: z.string().trim().min(2, "Country is required.").max(80),
  email: z.email("Please enter a valid email."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(200, "Password is too long."),
  terms: z.literal("on", {
    error: () => ({ message: "You must accept the terms to continue." }),
  }),
});

export type SignupActionState = {
  error?: string;
};

/**
 * Client signup. Creates an Organization (type=CLIENT, kycStatus=PENDING) +
 * an OWNER User in one transaction, signs the user in via Credentials, and
 * redirects to the client dashboard.
 *
 * KYC verification happens later via the admin queue — clients can sign
 * up freely and start the onboarding wizard immediately.
 */
export async function signupClientAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsed = ClientSignupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    orgName: formData.get("orgName"),
    country: formData.get("country"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const locale = await currentLocale();

  // Email uniqueness check
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  // Create org + owner user atomically
  let userId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          type: OrgType.CLIENT,
          legalName: parsed.data.orgName,
          displayName: parsed.data.orgName,
          country: parsed.data.country,
          city: "",
          address: "",
          kycStatus: KycStatus.PENDING,
        },
      });

      const user = await tx.user.create({
        data: {
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          name: `${parsed.data.firstName} ${parsed.data.lastName}`,
          passwordHash,
          role: Role.CLIENT,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          locale,
          hasOnboarded: false,
        },
      });

      return { user, org };
    });
    userId = created.user.id;
  } catch (e) {
    await writeAuditLog({
      action: "auth.signup_failed",
      payload: { email: parsed.data.email, role: "CLIENT", message: String(e) },
      level: "WARN",
    });
    return { error: "Something went wrong creating your account. Please try again." };
  }

  await writeAuditLog({
    actorUserId: userId,
    action: "auth.signup",
    targetType: "User",
    targetId: userId,
    payload: { role: "CLIENT" },
  });

  // Auto-login the new user
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      // Account was created but auto-login failed — direct them to login.
      redirect(`/${locale}/login`);
    }
    throw e;
  }

  redirect(dashboardPathForRole(Role.CLIENT, locale));
}

// =============================================================
// Factory signup
// =============================================================

const FactorySignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: z.email("Please enter a valid email."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(200, "Password is too long."),
  legalName: z.string().trim().min(2, "Legal name is required.").max(200),
  displayName: z.string().trim().min(1, "Display name is required.").max(200),
  country: z.string().trim().min(2, "Country is required.").max(80),
  city: z.string().trim().min(1, "City is required.").max(120),
  address: z.string().trim().min(3, "Address is required.").max(300),
  vatNumber: z.string().trim().max(40).optional().or(z.literal("")),
  category: z.enum(Category),
  capabilities: z
    .string()
    .trim()
    .max(500, "Capabilities list is too long.")
    .optional()
    .or(z.literal("")),
  terms: z.literal("on", {
    error: () => ({ message: "You must accept the terms to continue." }),
  }),
});

/**
 * Factory signup. Creates Organization (FACTORY, KYC PENDING) +
 * FactoryProfile + User (OWNER) + KYC documents in one transaction. Files
 * are stored to local disk under ./uploads/ for v1.
 *
 * Document requirements (per spec §10.1):
 *  - registry  : required
 *  - tax       : required
 *  - facility  : at least 1, ideally 3 (we enforce ≥1 for v1, surface a
 *                soft "we recommend 3+" hint in the UI)
 *  - references: optional
 *  - insurance : optional
 *
 * If file storage fails partway through, we delete the org + user + any
 * already-saved files via the transaction rollback. Files written before
 * rollback stay on disk as orphans — admin can prune (rare path).
 */
export async function signupFactoryAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsed = FactorySignupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    legalName: formData.get("legalName"),
    displayName: formData.get("displayName"),
    country: formData.get("country"),
    city: formData.get("city"),
    address: formData.get("address"),
    vatNumber: formData.get("vatNumber") ?? "",
    category: formData.get("category"),
    capabilities: formData.get("capabilities") ?? "",
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Required files
  const registryFile = formData.get("doc_registry");
  const taxFile = formData.get("doc_tax");
  const facilityFiles = formData.getAll("doc_facility");

  if (!(registryFile instanceof File) || registryFile.size === 0) {
    return { error: "Business registration document is required." };
  }
  if (!(taxFile instanceof File) || taxFile.size === 0) {
    return { error: "Tax certificate is required." };
  }
  const facilityActual = facilityFiles.filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (facilityActual.length < 1) {
    return { error: "At least one photo of your facility is required." };
  }

  const locale = await currentLocale();

  // Email uniqueness
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Capabilities: comma-separated → trimmed list
  const capabilitiesList = (parsed.data.capabilities ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

  const passwordHash = await hashPassword(parsed.data.password);

  let userId: string | undefined;
  try {
    // Create org + profile + user first so we have an orgId for file paths.
    const created = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          type: OrgType.FACTORY,
          legalName: parsed.data.legalName,
          displayName: parsed.data.displayName,
          country: parsed.data.country,
          city: parsed.data.city,
          address: parsed.data.address,
          vatNumber: parsed.data.vatNumber || null,
          kycStatus: KycStatus.PENDING,
          factoryProfile: {
            create: {
              category: parsed.data.category,
              capabilities: capabilitiesList,
              languages: [],
            },
          },
        },
      });

      const user = await tx.user.create({
        data: {
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          name: `${parsed.data.firstName} ${parsed.data.lastName}`,
          passwordHash,
          role: Role.FACTORY,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          locale,
          hasOnboarded: false,
        },
      });

      return { user, org };
    });

    userId = created.user.id;

    // Store files OUTSIDE the transaction (filesystem isn't transactional).
    // On failure we attempt cleanup of the org row to avoid an orphaned
    // KYC-less factory account.
    try {
      const stored: Array<{ kind: KycDocumentKind; file: import("@/lib/storage/local").StoredFile }> = [];

      stored.push({
        kind: KycDocumentKind.REGISTRY,
        file: await storeFile({
          scope: "factories",
          ownerId: created.org.id,
          kindPrefix: "registry",
          file: registryFile,
        }),
      });
      stored.push({
        kind: KycDocumentKind.TAX,
        file: await storeFile({
          scope: "factories",
          ownerId: created.org.id,
          kindPrefix: "tax",
          file: taxFile,
        }),
      });
      for (let i = 0; i < facilityActual.length; i++) {
        stored.push({
          kind: KycDocumentKind.FACILITY_PHOTO,
          file: await storeFile({
            scope: "factories",
            ownerId: created.org.id,
            kindPrefix: `facility-${i + 1}`,
            file: facilityActual[i]!,
          }),
        });
      }

      await prisma.kycDocument.createMany({
        data: stored.map((s) => ({
          organizationId: created.org.id,
          kind: s.kind,
          fileName: s.file.fileName,
          mimeType: s.file.mimeType,
          sizeBytes: s.file.sizeBytes,
          storageUrl: s.file.storageUrl,
        })),
      });
    } catch (e) {
      // Roll back the org + user
      await prisma.organization
        .delete({ where: { id: created.org.id } })
        .catch(() => {});
      if (e instanceof StorageError) {
        return { error: e.message };
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof StorageError) return { error: e.message };
    await writeAuditLog({
      action: "auth.signup_failed",
      payload: {
        email: parsed.data.email,
        role: "FACTORY",
        message: String(e),
      },
      level: "WARN",
    });
    return {
      error: "Something went wrong creating your account. Please try again.",
    };
  }

  await writeAuditLog({
    actorUserId: userId,
    action: "auth.signup",
    targetType: "User",
    targetId: userId,
    payload: { role: "FACTORY", category: parsed.data.category },
  });

  // Auto-login
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      redirect(`/${locale}/login`);
    }
    throw e;
  }

  redirect(dashboardPathForRole(Role.FACTORY, locale));
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
