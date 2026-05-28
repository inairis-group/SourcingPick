"use server";

import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BannerTone, Role } from "@prisma/client";
import type { AttachmentContext } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  AttachmentError,
  classifyByExtension,
  storeAttachment,
} from "@/lib/storage/attachments";
import { clearMarketplaceBannersCache } from "./banners";

// String literal avoids the dev-server stale-Prisma-client enum hazard
// (importing AttachmentContext as a value can resolve to undefined until
// the Turbopack cache refreshes). Typed via `satisfies` for safety.
const BANNER_CONTEXT = "MARKETPLACE_BANNER" satisfies AttachmentContext;

// Hex only — these values are interpolated into an inline `background`
// style string on both the storefront and the live preview, so we reject
// anything that isn't a plain colour to keep the CSS un-injectable.
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const hexColor = z
  .string()
  .trim()
  .regex(HEX, "Use a hex colour like #1d4ed8.");
const optionalHex = z.union([hexColor, z.literal("")]).optional();

const BannerSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required.").max(120),
    subtitle: z.string().trim().max(200).optional().or(z.literal("")),
    ctaLabel: z.string().trim().max(40).optional().or(z.literal("")),
    ctaHref: z.string().trim().max(300).optional().or(z.literal("")),
    tone: z.enum(BannerTone).default(BannerTone.BRAND),
    background: z
      .enum(["PRESET", "GRADIENT", "IMAGE", "VIDEO"])
      .default("PRESET"),
    gradientFrom: optionalHex,
    gradientVia: optionalHex,
    gradientTo: optionalHex,
    gradientAngle: z.coerce.number().int().min(0).max(360).default(135),
    overlayOpacity: z.coerce.number().int().min(0).max(100).default(40),
    sortOrder: z.coerce.number().int().min(0).max(999).default(0),
    startsAt: z.union([z.coerce.date(), z.literal("")]).optional(),
    endsAt: z.union([z.coerce.date(), z.literal("")]).optional(),
  })
  .refine(
    (d) =>
      // A CTA label without a destination (or vice versa) is a mistake —
      // require both or neither.
      Boolean(d.ctaLabel) === Boolean(d.ctaHref),
    {
      path: ["ctaHref"],
      message: "Provide both a button label and a link, or leave both empty.",
    },
  )
  .refine(
    (d) =>
      // A custom gradient needs at least a start and an end colour.
      d.background !== "GRADIENT" || (d.gradientFrom && d.gradientTo),
    {
      path: ["gradientFrom"],
      message: "A gradient needs at least a start and an end colour.",
    },
  )
  .refine(
    (d) =>
      !(d.startsAt instanceof Date) ||
      !(d.endsAt instanceof Date) ||
      d.endsAt.getTime() > d.startsAt.getTime(),
    { path: ["endsAt"], message: "End must be after start." },
  );

export type BannerActionState = { error?: string; created?: boolean };

export async function createBannerAction(
  _prev: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  const admin = await requireRole(Role.ADMIN);

  const parsed = BannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    ctaLabel: formData.get("ctaLabel") ?? "",
    ctaHref: formData.get("ctaHref") ?? "",
    tone: formData.get("tone") ?? BannerTone.BRAND,
    background: formData.get("background") ?? "PRESET",
    gradientFrom: formData.get("gradientFrom") ?? "",
    gradientVia: formData.get("gradientVia") ?? "",
    gradientTo: formData.get("gradientTo") ?? "",
    gradientAngle: formData.get("gradientAngle") ?? "135",
    overlayOpacity: formData.get("overlayOpacity") ?? "40",
    sortOrder: formData.get("sortOrder") ?? "0",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const d = parsed.data;
  const isMedia = d.background === "IMAGE" || d.background === "VIDEO";

  // Validate the media file up front so we don't create an orphan banner
  // row for a missing/wrong-type upload.
  let mediaFile: File | null = null;
  if (isMedia) {
    const f = formData.get("media");
    if (!(f instanceof File) || f.size === 0) {
      return {
        error:
          d.background === "VIDEO"
            ? "Upload a video for this banner."
            : "Upload an image for this banner.",
      };
    }
    const kind = classifyByExtension(f.name);
    const wanted = d.background === "VIDEO" ? "VIDEO" : "IMAGE";
    if (kind !== wanted) {
      return {
        error:
          d.background === "VIDEO"
            ? "That file isn't a supported video (mp4, webm, mov)."
            : "That file isn't a supported image (jpg, png, webp, gif).",
      };
    }
    mediaFile = f;
  }

  const isGradient = d.background === "GRADIENT";
  const banner = await prisma.marketplaceBanner.create({
    data: {
      title: d.title,
      subtitle: d.subtitle || null,
      ctaLabel: d.ctaLabel || null,
      ctaHref: d.ctaHref || null,
      tone: d.tone,
      background: d.background,
      gradientFrom: isGradient ? d.gradientFrom || null : null,
      gradientVia: isGradient ? d.gradientVia || null : null,
      gradientTo: isGradient ? d.gradientTo || null : null,
      gradientAngle: isGradient ? d.gradientAngle : null,
      overlayOpacity: d.overlayOpacity,
      sortOrder: d.sortOrder,
      startsAt: d.startsAt instanceof Date ? d.startsAt : null,
      endsAt: d.endsAt instanceof Date ? d.endsAt : null,
      createdByUserId: admin.id,
    },
    select: { id: true },
  });

  if (mediaFile) {
    try {
      const att = await storeAttachment({
        contextType: BANNER_CONTEXT,
        contextId: banner.id,
        uploaderId: admin.id,
        file: mediaFile,
      });
      await prisma.marketplaceBanner.update({
        where: { id: banner.id },
        data: { mediaUrl: `/api/attachments/${att.id}` },
      });
    } catch (e) {
      // Roll back the banner so a failed upload doesn't leave a blank card.
      await prisma.marketplaceBanner.delete({ where: { id: banner.id } });
      if (e instanceof AttachmentError) return { error: e.message };
      throw e;
    }
  }

  clearMarketplaceBannersCache();
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.banner_created",
    targetType: "MarketplaceBanner",
    targetId: banner.id,
    payload: { title: d.title, background: d.background },
  });

  revalidatePath("/[lang]/admin/marketplace/banners", "page");
  revalidatePath("/[lang]/marketplace", "page");
  return { created: true };
}

export type BannerMutationResult = { ok: true } | { ok: false; error: string };

export async function toggleBannerAction(
  bannerId: string,
  active: boolean,
): Promise<BannerMutationResult> {
  const admin = await requireRole(Role.ADMIN);
  const existing = await prisma.marketplaceBanner.findUnique({
    where: { id: bannerId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Banner not found." };

  await prisma.marketplaceBanner.update({
    where: { id: bannerId },
    data: { active },
  });

  clearMarketplaceBannersCache();
  await writeAuditLog({
    actorUserId: admin.id,
    action: active ? "marketplace.banner_enabled" : "marketplace.banner_disabled",
    targetType: "MarketplaceBanner",
    targetId: bannerId,
  });

  revalidatePath("/[lang]/admin/marketplace/banners", "page");
  revalidatePath("/[lang]/marketplace", "page");
  return { ok: true };
}

export async function deleteBannerAction(
  bannerId: string,
): Promise<BannerMutationResult> {
  const admin = await requireRole(Role.ADMIN);
  const existing = await prisma.marketplaceBanner.findUnique({
    where: { id: bannerId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Banner not found." };

  // Clean up any uploaded media (image/video) — files on disk + rows.
  const media = await prisma.attachment.findMany({
    where: { contextType: BANNER_CONTEXT, contextId: bannerId },
    select: { id: true, storageUrl: true },
  });
  for (const m of media) {
    try {
      await unlink(resolve(process.cwd(), m.storageUrl));
    } catch {
      // Best-effort: a missing file shouldn't block deletion.
    }
  }
  if (media.length > 0) {
    await prisma.attachment.deleteMany({
      where: { contextType: BANNER_CONTEXT, contextId: bannerId },
    });
  }

  await prisma.marketplaceBanner.delete({ where: { id: bannerId } });

  clearMarketplaceBannersCache();
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.banner_deleted",
    targetType: "MarketplaceBanner",
    targetId: bannerId,
  });

  revalidatePath("/[lang]/admin/marketplace/banners", "page");
  revalidatePath("/[lang]/marketplace", "page");
  return { ok: true };
}
