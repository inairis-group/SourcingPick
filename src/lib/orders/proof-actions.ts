"use server";

import { revalidatePath } from "next/cache";
import { AttachmentContext, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { storeAttachments } from "@/lib/storage/attachments";

export type ProofKind = "QC" | "SHIPMENT";
export type UploadProofState = { error?: string; ok?: boolean };

/**
 * Factory uploads QC / shipment proof photos on an order they own.
 *
 * Auth: the calling user must be a FACTORY of the order's factory org.
 * The order must be in a phase where the kind makes sense:
 *   - QC photos: PREPARATION or QC
 *   - SHIPMENT photos: QC, SHIPPED, IN_TRANSIT
 * Outside those phases the upload is rejected — protects against a
 * shipped order suddenly getting new QC photos that pre-date the
 * tracking record.
 */
export async function uploadOrderProofAction(
  _prev: UploadProofState,
  formData: FormData,
): Promise<UploadProofState> {
  const factory = await requireRole(Role.FACTORY);
  const orderId = String(formData.get("orderId") ?? "");
  const kindRaw = String(formData.get("kind") ?? "");
  if (!orderId) return { error: "Missing order." };
  const kind: ProofKind | null =
    kindRaw === "QC" || kindRaw === "SHIPMENT"
      ? (kindRaw as ProofKind)
      : null;
  if (!kind) return { error: "Invalid proof kind." };

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      factoryOrgId: factory.organizationId,
      deletedAt: null,
    },
    select: { id: true, status: true },
  });
  if (!order) return { error: "Order not found." };

  const phaseOk =
    kind === "QC"
      ? order.status === "PREPARATION" || order.status === "QC"
      : order.status === "QC" ||
        order.status === "SHIPPED" ||
        order.status === "IN_TRANSIT";
  if (!phaseOk) {
    return {
      error:
        kind === "QC"
          ? "QC photos can only be added while the order is in PREPARATION or QC."
          : "Shipment photos can only be added between QC and IN_TRANSIT.",
    };
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Pick at least one photo." };

  const contextType =
    kind === "QC"
      ? AttachmentContext.ORDER_QC_PROOF
      : AttachmentContext.ORDER_SHIPMENT_PROOF;

  const { errors } = await storeAttachments({
    contextType,
    contextId: order.id,
    uploaderId: factory.id,
    files,
  });
  if (errors.length > 0) return { error: errors[0] };

  await writeAuditLog({
    actorUserId: factory.id,
    action:
      kind === "QC"
        ? "order.qc_proof_uploaded"
        : "order.shipment_proof_uploaded",
    targetType: "Order",
    targetId: order.id,
    payload: { count: files.length },
  });

  revalidatePath("/[lang]/factory/orders", "page");
  revalidatePath("/[lang]/client/orders", "page");
  return { ok: true };
}
