import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import {
  AttachmentContext,
  MarketplaceProductStatus,
  Role,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

/**
 * Serve a single Attachment by id. Permission per context type:
 *   - MARKETPLACE_PRODUCT — same rule as the storefront image route
 *     (visible while the listing isn't archived/deleted; cuid2 IDs make
 *     guessing unrealistic).
 *   - MESSAGE — must be a participant of the parent thread.
 *   - SOURCING_REQUEST — client who owns it, agent assigned to it, or
 *     ADMIN.
 *   - ORDER — buyer org, factory org, agent, or ADMIN.
 *
 * Path resolution is hardened against `..` even though storageUrl is
 * platform-controlled.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    select: {
      id: true,
      contextType: true,
      contextId: true,
      storageUrl: true,
      mimeType: true,
      originalName: true,
      sizeBytes: true,
    },
  });
  if (!attachment) return new NextResponse("Not found", { status: 404 });

  const allowed = await canRead(attachment);
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  const requested = resolve(process.cwd(), attachment.storageUrl);
  if (!requested.startsWith(UPLOADS_ROOT + sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(requested);
  } catch {
    return new NextResponse("File missing", { status: 410 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": attachment.mimeType || "application/octet-stream",
      "Content-Length": String(attachment.sizeBytes),
      // Inline for images/videos/pdfs; attachment for everything else.
      // Inline lets <img>/<video> render directly; non-inline triggers a
      // download with the original filename preserved.
      "Content-Disposition": isInlineMime(attachment.mimeType)
        ? `inline; filename="${safeFilename(attachment.originalName)}"`
        : `attachment; filename="${safeFilename(attachment.originalName)}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

function isInlineMime(mime: string): boolean {
  return (
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime === "application/pdf"
  );
}

function safeFilename(name: string): string {
  // Strip CR/LF and quote chars so we don't break the header.
  return name.replace(/[\r\n"]/g, "_").slice(0, 200);
}

async function canRead(att: {
  contextType: AttachmentContext;
  contextId: string;
}): Promise<boolean> {
  switch (att.contextType) {
    case AttachmentContext.MARKETPLACE_BANNER:
      // Banner media is public marketing content shown on the storefront.
      return true;

    case AttachmentContext.MARKETPLACE_PRODUCT: {
      const product = await prisma.marketplaceProduct.findUnique({
        where: { id: att.contextId },
        select: { status: true, deletedAt: true, factoryOrgId: true },
      });
      if (!product || product.deletedAt) return false;
      if (product.status === MarketplaceProductStatus.ARCHIVED) {
        // Archived listings: only the owning factory + admin can still pull.
        const session = await auth();
        if (!session?.user) return false;
        if (session.user.role === Role.ADMIN) return true;
        return session.user.organizationId === product.factoryOrgId;
      }
      return true;
    }

    case AttachmentContext.MESSAGE: {
      const session = await auth();
      if (!session?.user) return false;
      if (session.user.role === Role.ADMIN) return true;
      const message = await prisma.message.findUnique({
        where: { id: att.contextId },
        select: { threadId: true },
      });
      if (!message) return false;
      const participant = await prisma.threadParticipant.findFirst({
        where: { threadId: message.threadId, userId: session.user.id },
        select: { threadId: true },
      });
      return Boolean(participant);
    }

    case AttachmentContext.SOURCING_REQUEST: {
      const session = await auth();
      if (!session?.user) return false;
      if (session.user.role === Role.ADMIN) return true;
      const req = await prisma.sourcingRequest.findUnique({
        where: { id: att.contextId },
        select: { clientOrgId: true, agentId: true },
      });
      if (!req) return false;
      if (req.agentId === session.user.id) return true;
      return req.clientOrgId === session.user.organizationId;
    }

    case AttachmentContext.ORDER: {
      const session = await auth();
      if (!session?.user) return false;
      if (session.user.role === Role.ADMIN) return true;
      const order = await prisma.order.findUnique({
        where: { id: att.contextId },
        select: { clientOrgId: true, factoryOrgId: true, agentId: true },
      });
      if (!order) return false;
      if (order.agentId === session.user.id) return true;
      return (
        order.clientOrgId === session.user.organizationId ||
        order.factoryOrgId === session.user.organizationId
      );
    }
  }
  // Exhaustive — guard against new contexts being added without auth.
  void ThreadContextType;
  return false;
}
