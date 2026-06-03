import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { AuctionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

/**
 * Serve image at index `n` of an auction. Public read for ACTIVE / ENDED /
 * SOLD listings (any browser can view); DRAFT / PENDING_REVIEW / REJECTED
 * are still served because the IDs are cuid2 (unguessable) and admin
 * moderation thumbnails need to load.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ auctionId: string; index: string }> },
) {
  const { auctionId, index } = await params;
  const i = Number.parseInt(index, 10);
  if (!Number.isFinite(i) || i < 0) {
    return new NextResponse("Bad index", { status: 400 });
  }

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { images: true, status: true, deletedAt: true },
  });
  if (!auction || auction.deletedAt) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (auction.status === AuctionStatus.CANCELLED) {
    return new NextResponse("Not found", { status: 404 });
  }
  const storageUrl = auction.images[i];
  if (!storageUrl) return new NextResponse("Not found", { status: 404 });

  const requested = resolve(process.cwd(), storageUrl);
  if (!requested.startsWith(UPLOADS_ROOT + sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(requested);
  } catch {
    return new NextResponse("File missing", { status: 410 });
  }

  const ext = storageUrl.split(".").pop()?.toLowerCase() ?? "";
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
      "Cache-Control":
        auction.status === AuctionStatus.ACTIVE
          ? "public, max-age=3600"
          : "private, max-age=0, must-revalidate",
    },
  });
}
