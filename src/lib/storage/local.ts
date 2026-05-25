import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Local filesystem storage adapter — v1 only.
 *
 * Files are saved under `./uploads/<scope>/<id>/`. The returned `storageUrl`
 * is the relative path; callers persist that on the `storageUrl` column of
 * KycDocument / Attachment / etc.
 *
 * For production, swap this module out for Cloudflare R2 / AWS S3.
 * `storageUrl` semantics stay the same (relative paths can become object keys).
 */

const UPLOADS_ROOT = join(process.cwd(), "uploads");

export type StoredFile = {
  storageUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

const SAFE_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type StoreFileInput = {
  scope: "factories" | "marketplace";
  ownerId: string;
  kindPrefix: string; // e.g. "registry", "tax", "facility-1", "product-1"
  file: File;
};

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "EMPTY"
      | "TOO_LARGE"
      | "BAD_EXTENSION",
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Validate + persist a File from a multipart Server Action.
 * Throws StorageError on validation failures.
 */
export async function storeFile(input: StoreFileInput): Promise<StoredFile> {
  if (!input.file || input.file.size === 0) {
    throw new StorageError("Empty file.", "EMPTY");
  }
  if (input.file.size > MAX_FILE_SIZE_BYTES) {
    throw new StorageError(
      `File ${input.file.name} exceeds the 10 MB limit.`,
      "TOO_LARGE",
    );
  }

  const ext = extname(input.file.name).toLowerCase();
  if (!SAFE_EXTENSIONS.has(ext)) {
    throw new StorageError(
      `File ${input.file.name} has an unsupported type. Allowed: PDF, JPG, PNG, WebP, HEIC.`,
      "BAD_EXTENSION",
    );
  }

  const dir = join(UPLOADS_ROOT, input.scope, input.ownerId);
  await mkdir(dir, { recursive: true });

  // Disambiguate filenames so a re-upload doesn't clobber.
  const stamp = randomBytes(4).toString("hex");
  const safeName = `${input.kindPrefix}-${stamp}${ext}`;
  const fullPath = join(dir, safeName);

  const buffer = Buffer.from(await input.file.arrayBuffer());
  await writeFile(fullPath, buffer);

  // storageUrl is the relative path from project root — admin download
  // endpoints will resolve this against UPLOADS_ROOT when serving.
  const storageUrl = `uploads/${input.scope}/${input.ownerId}/${safeName}`;

  return {
    storageUrl,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
  };
}
