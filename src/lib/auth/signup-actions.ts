"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { Category, KycDocumentKind, KycStatus, OrgType, Role, SubRole } from "@prisma/client";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit/log";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { appLocaleFor, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { storeFile, StorageError } from "@/lib/storage/local";
import { passwordSchema } from "@/lib/auth/password-policy";
import { newClientCode } from "@/lib/org/client-code";

const ClientSignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  orgName: z.string().trim().min(2, "Organisation name is required.").max(200),
  country: z.string().trim().min(2, "Country is required.").max(80),
  email: z.email("Please enter a valid email."),
  // Loose format: only enforce something that looks like a phone (digits +
  // optional +, spaces, dashes, parens). Real validation happens server-side
  // if we ever need to dial it; we collect it so agents/admin can follow up.
  phone: z
    .string()
    .trim()
    .min(5, "Phone number is required.")
    .max(32, "Phone number is too long.")
    .regex(/^[0-9+\s()\-.]+$/, "Use digits, spaces, +, ( ), - or . only."),
  password: passwordSchema,
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
    phone: formData.get("phone"),
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
          clientCode: await newClientCode(tx),
        },
      });

      const user = await tx.user.create({
        data: {
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          name: `${parsed.data.firstName} ${parsed.data.lastName}`,
          phone: parsed.data.phone,
          passwordHash,
          role: Role.CLIENT,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          // The column holds all twelve now, so a visitor who signed up
          // from the Polish site is recorded as Polish rather than as the
          // nearest language we used to be able to write to them in.
          locale: appLocaleFor(locale),
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
// Signup, as the 2026-09 SaaS canvas draws it
// =============================================================

/**
 * One screen, two kinds of account.
 *
 * The canvas replaces the old pick-a-role page and the multi-step wizard
 * behind it with a single form: who you are, your details, your password.
 * The "Business / Individual" pair is the only branch, and it governs two
 * fields rather than two flows.
 *
 * An individual is still an organisation of one. The alternative — a
 * nullable organisationId — would make every downstream query that walks
 * from an order to its buyer handle an owner-less case, and none of them do.
 * So the person's own name becomes the org's name and the two company fields
 * simply go unasked.
 */
const AccountSignupSchema = z
  .object({
    accountType: z.enum(["business", "individual"]),
    fullName: z.string().trim().min(2, "Please enter your full name.").max(160),
    company: z.string().trim().max(200).optional(),
    vatNumber: z.string().trim().max(64).optional(),
    deliveryCountry: z.string().trim().min(2, "Please choose a delivery country.").max(80),
    email: z.email("Please enter a valid email."),
    password: passwordSchema,
    terms: z.literal("on", {
      error: () => ({ message: "You must accept the terms to continue." }),
    }),
  })
  .refine((v) => v.accountType !== "business" || (v.company?.length ?? 0) >= 2, {
    message: "Please enter your company name.",
    path: ["company"],
  });

/**
 * Create an account from the canvas's signup screen.
 *
 * Mirrors `signupClientAction` — same organisation, same owner user, same
 * transaction, same auto-login — and differs only in what it asks for. The
 * two exist side by side while the older wizard is still reachable.
 */
export async function signupAccountAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsed = AccountSignupSchema.safeParse({
    accountType: formData.get("accountType"),
    fullName: formData.get("fullName"),
    company: formData.get("company") ?? undefined,
    vatNumber: formData.get("vatNumber") ?? undefined,
    deliveryCountry: formData.get("deliveryCountry"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const locale = await currentLocale();

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // The canvas asks for one name field. Splitting on the last space is a
  // guess, and a bad one in plenty of languages, so the full string is kept
  // intact in `name` and the parts are filled only well enough for the
  // columns that require them.
  const orgName = data.accountType === "business" ? (data.company ?? data.fullName) : data.fullName;
  const [firstName, ...restOfName] = data.fullName.split(/\s+/);
  const lastName = restOfName.join(" ");

  const passwordHash = await hashPassword(data.password);

  let userId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          type: OrgType.CLIENT,
          legalName: orgName,
          displayName: orgName,
          country: data.deliveryCountry,
          city: "",
          address: "",
          vatNumber: data.vatNumber || null,
          kycStatus: KycStatus.PENDING,
          clientCode: await newClientCode(tx),
        },
      });
      const user = await tx.user.create({
        data: {
          email: data.email,
          firstName,
          // Not nullable, and an individual with a one-word name has no
          // second part to give it.
          lastName: lastName || firstName,
          name: data.fullName,
          passwordHash,
          role: Role.CLIENT,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          locale: appLocaleFor(locale),
          hasOnboarded: false,
        },
      });
      return { user, org };
    });
    userId = created.user.id;
  } catch (e) {
    await writeAuditLog({
      action: "auth.signup_failed",
      payload: { email: data.email, role: "CLIENT", message: String(e) },
      level: "WARN",
    });
    return { error: "Something went wrong creating your account. Please try again." };
  }

  await writeAuditLog({
    actorUserId: userId,
    action: "auth.signup",
    targetType: "User",
    targetId: userId,
    payload: { role: "CLIENT", accountType: data.accountType },
  });

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
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
  phone: z
    .string()
    .trim()
    .min(5, "Phone number is required.")
    .max(32, "Phone number is too long.")
    .regex(/^[0-9+\s()\-.]+$/, "Use digits, spaces, +, ( ), - or . only."),
  password: passwordSchema,
  legalName: z.string().trim().min(2, "Legal name is required.").max(200),
  displayName: z.string().trim().min(1, "Display name is required.").max(200),
  country: z.string().trim().min(2, "Country is required.").max(80),
  city: z.string().trim().min(1, "City is required.").max(120),
  address: z.string().trim().min(3, "Address is required.").max(300),
  vatNumber: z.string().trim().max(40).optional().or(z.literal("")),
  /// 统一社会信用代码 — the Unified Social Credit Code, 18 alphanumeric
  /// characters printed on the 营业执照. This is the primary identifier for a
  /// Chinese legal entity, so it replaces SIREN/VAT as the required field.
  unifiedSocialCreditCode: z
    .string()
    .trim()
    .regex(/^[0-9A-Z]{18}$/, "The Unified Social Credit Code is 18 characters."),
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
    phone: formData.get("phone"),
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

  // Registration needs exactly one document: the 营业执照 (business licence).
  // It carries the legal name, business scope and the Unified Social Credit
  // Code, which is everything needed to open the account. The representative's
  // ID (>25% of capital) is a verification requirement, not a registration one,
  // so it is collected during KYC review rather than gating signup.
  const licenseFile = formData.get("doc_business_license");
  if (!(licenseFile instanceof File) || licenseFile.size === 0) {
    return { error: "The business licence (营业执照) is required." };
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
          unifiedSocialCreditCode: parsed.data.unifiedSocialCreditCode,
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
          phone: parsed.data.phone,
          passwordHash,
          role: Role.FACTORY,
          subRole: SubRole.OWNER,
          organizationId: org.id,
          locale: appLocaleFor(locale),
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
      const stored: Array<{
        kind: KycDocumentKind;
        file: import("@/lib/storage/local").StoredFile;
      }> = [];

      stored.push({
        kind: KycDocumentKind.BUSINESS_LICENSE,
        file: await storeFile({
          scope: "factories",
          ownerId: created.org.id,
          kindPrefix: "business-license",
          file: licenseFile,
        }),
      });

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
      await prisma.organization.delete({ where: { id: created.org.id } }).catch(() => {});
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
