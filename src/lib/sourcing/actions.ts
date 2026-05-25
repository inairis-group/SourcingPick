"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Category,
  Incoterm,
  NotificationType,
  Role,
  SourcingRegion,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { getSourcingAllowlist } from "@/lib/platform/settings";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

const RequestSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(200),
  category: z.enum(Category),
  productName: z.string().trim().min(2, "Product name is required.").max(200),
  productDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("Quantity must be positive."),
  targetUnitPriceEur: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional(),
  budgetEur: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional(),
  deadline: z.coerce.date().refine((d) => d > new Date(), {
    message: "Deadline must be in the future.",
  }),
  deliveryAddress: z.string().trim().min(5, "Delivery address is required.").max(300),
  incoterm: z.enum(Incoterm),
  sourcingRegion: z.enum(SourcingRegion),
  sourcingCountry: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "Invalid country code.")
    .default("CN"),
  requiredCerts: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SourcingRequestActionState = {
  error?: string;
};

export async function createSourcingRequestAction(
  _prev: SourcingRequestActionState,
  formData: FormData,
): Promise<SourcingRequestActionState> {
  const user = await requireRole(Role.CLIENT);

  const parsed = RequestSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    productName: formData.get("productName"),
    productDescription: formData.get("productDescription") ?? "",
    quantity: formData.get("quantity"),
    targetUnitPriceEur: formData.get("targetUnitPriceEur") ?? "",
    budgetEur: formData.get("budgetEur") ?? "",
    deadline: formData.get("deadline"),
    deliveryAddress: formData.get("deliveryAddress"),
    incoterm: formData.get("incoterm"),
    sourcingRegion: formData.get("sourcingRegion"),
    sourcingCountry: formData.get("sourcingCountry") ?? "CN",
    requiredCerts: formData.get("requiredCerts") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Geo-gate: the buyer's chosen region/country must be in the admin's
  // current allowlist. Without this, a stale client form (cached after an
  // admin reduced the allowlist) could create requests for closed regions.
  const allowlist = await getSourcingAllowlist();
  if (!allowlist.regions.includes(parsed.data.sourcingRegion)) {
    return {
      error:
        "That sourcing region is not currently open. Please pick another.",
    };
  }
  if (!allowlist.countries.includes(parsed.data.sourcingCountry)) {
    return {
      error:
        "That sourcing country is not currently open. Please pick another.",
    };
  }

  const locale = await currentLocale();
  const reference = await generateUniqueReference("REQ");
  const certsList = (parsed.data.requiredCerts ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const targetUnitPriceCents =
    typeof parsed.data.targetUnitPriceEur === "number"
      ? Math.round(parsed.data.targetUnitPriceEur * 100)
      : null;
  const budgetCents =
    typeof parsed.data.budgetEur === "number"
      ? Math.round(parsed.data.budgetEur * 100)
      : null;

  let requestId: string;
  try {
    const created = await prisma.sourcingRequest.create({
      data: {
        reference,
        clientOrgId: user.organizationId,
        createdByUserId: user.id,
        title: parsed.data.title,
        category: parsed.data.category,
        quantity: parsed.data.quantity,
        budgetCents,
        targetUnitPriceCents,
        deadline: parsed.data.deadline,
        deliveryAddress: parsed.data.deliveryAddress,
        incoterm: parsed.data.incoterm,
        sourcingRegion: parsed.data.sourcingRegion,
        sourcingCountry: parsed.data.sourcingCountry,
        requiredCerts: certsList,
        status: SourcingStatus.REQUEST_RECEIVED,
        products: {
          create: [
            {
              name: parsed.data.productName,
              description: parsed.data.productDescription || null,
              quantity: parsed.data.quantity,
              targetPriceCents: targetUnitPriceCents,
              images: [],
            },
          ],
        },
      },
      select: { id: true, reference: true },
    });
    requestId = created.id;

    await writeAuditLog({
      actorUserId: user.id,
      action: "request.created",
      targetType: "SourcingRequest",
      targetId: created.id,
      payload: {
        reference: created.reference,
        category: parsed.data.category,
        sourcingRegion: parsed.data.sourcingRegion,
        sourcingCountry: parsed.data.sourcingCountry,
      },
    });
  } catch (e) {
    await writeAuditLog({
      actorUserId: user.id,
      action: "request.create_failed",
      payload: { message: String(e) },
      level: "WARN",
    });
    return { error: "Something went wrong creating your request. Please try again." };
  }

  // Notify admins so the dispatch queue surfaces the new request.
  const adminIds = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });
  await emitNotificationToMany(
    adminIds.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: { systemKey: "request_received" },
      contextType: "SourcingRequest",
      contextId: requestId,
    },
  );

  revalidatePath("/[lang]/client/requests", "page");
  redirect(`/${locale}/client/requests/${requestId}`);
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
