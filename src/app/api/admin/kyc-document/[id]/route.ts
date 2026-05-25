import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Serves a single KYC document file. Admin-only.
 *
 * Defensive: resolves the stored relative path against the uploads root and
 * rejects anything that escapes the root (prevents `../../../etc/passwd`
 * attacks if a bad storageUrl ever lands in the DB).
 */

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireRole(Role.ADMIN);
  const { id } = await params;

  const doc = await prisma.kycDocument.findUnique({
    where: { id },
    select: { id: true, organizationId: true, fileName: true, mimeType: true, storageUrl: true },
  });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  // Resolve safely
  const requested = resolve(process.cwd(), doc.storageUrl);
  if (!requested.startsWith(UPLOADS_ROOT + sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(requested);
  } catch {
    return new NextResponse("File missing on disk", { status: 410 });
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "kyc.document_downloaded",
    targetType: "KycDocument",
    targetId: doc.id,
    payload: { organizationId: doc.organizationId },
  });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

// Suppress unused-var lint for join (was considering using it elsewhere)
void join;
