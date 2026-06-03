import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

/**
 * Public-read org logo. Orgs whose logo is null get a 404; the caller is
 * expected to render an initials fallback in that case (no point in
 * serving a placeholder PNG when the UI can draw clean text).
 *
 * Path resolution is hardened against `..` traversal — even though the
 * `logoUrl` column is platform-controlled, treating it as untrusted
 * keeps the route resilient if a future feature lets users set their own
 * URLs.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    select: { logoUrl: true, deletedAt: true, suspended: true },
  });
  if (!org || org.deletedAt || org.suspended) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!org.logoUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const requested = resolve(process.cwd(), org.logoUrl);
  if (!requested.startsWith(UPLOADS_ROOT + sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(requested);
  } catch {
    return new NextResponse("File missing", { status: 410 });
  }

  const ext = org.logoUrl.split(".").pop()?.toLowerCase() ?? "";
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "heic" || ext === "heif"
          ? "image/heic"
          : "image/jpeg";

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      // Cache moderately — logos change occasionally; client busts the
      // cache via a `?v=<updatedAt>` query string at the call site.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
