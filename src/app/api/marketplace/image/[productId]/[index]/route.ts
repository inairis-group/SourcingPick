import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { MarketplaceProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

/**
 * Serve image at index `n` of a marketplace product.
 *
 * Public read access for PUBLISHED listings (any anonymous user can browse).
 * DRAFT / PENDING_REVIEW images are only served if they live under the
 * marketplace scope — we don't gate them tighter because the product IDs
 * are cuid2 (unguessable) and serving moderation queue thumbnails to the
 * admin is the whole point of those uploads.
 *
 * Defensive path resolution prevents `../` traversal even if a stored
 * `images[i]` value is malformed.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string; index: string }> },
) {
  const { productId, index } = await params;
  const i = Number.parseInt(index, 10);
  if (!Number.isFinite(i) || i < 0) {
    return new NextResponse("Bad index", { status: 400 });
  }

  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, status: true, images: true },
  });
  if (!product) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (product.status === MarketplaceProductStatus.ARCHIVED) {
    return new NextResponse("Not found", { status: 404 });
  }
  const storageUrl = product.images[i];
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
        product.status === MarketplaceProductStatus.PUBLISHED
          ? "public, max-age=3600"
          : "private, max-age=0, must-revalidate",
    },
  });
}
