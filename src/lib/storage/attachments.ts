import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";
import {
  AttachmentContext,
  AttachmentKind,
  type Attachment,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Attachment storage adapter — wider mime/extension set than the original
 * KYC `storeFile`, with per-kind size caps. Writes to
 * `./uploads/attachments/<contextType>/<contextId>/`.
 *
 * Returns the persisted Attachment row so callers can render it
 * immediately (e.g. message-send action shows the new attachment in the
 * thread on the next render).
 */

const UPLOADS_ROOT = join(process.cwd(), "uploads");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
// Voice notes recorded by MediaRecorder land as webm/ogg on Chrome+Firefox
// and m4a on Safari; mp3/wav/aac are accepted for forwarded files. The
// `.webm` extension classifies as VIDEO above — for audio-only blobs the
// recorder names them `.webm-audio` so we can tell them apart.
const AUDIO_EXT = new Set([
  ".mp3",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".opus",
  ".wav",
  ".webm-audio",
]);
const FILE_EXT = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".zip",
]);

const SIZE_LIMITS_BYTES: Record<AttachmentKind, number> = {
  IMAGE: 10 * 1024 * 1024,
  VIDEO: 50 * 1024 * 1024,
  AUDIO: 15 * 1024 * 1024,
  FILE: 25 * 1024 * 1024,
};

/** Hard cap per context — keeps a runaway thread from blowing up storage. */
export const MAX_ATTACHMENTS_PER_CONTEXT = 10;

export class AttachmentError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "EMPTY"
      | "TOO_LARGE"
      | "BAD_EXTENSION"
      | "TOO_MANY",
  ) {
    super(message);
    this.name = "AttachmentError";
  }
}

/**
 * Bucket a file by extension into our coarse IMAGE/VIDEO/FILE classifier.
 * Returns null when nothing matches — caller treats that as a rejection.
 */
export function classifyByExtension(filename: string): AttachmentKind | null {
  const ext = extname(filename).toLowerCase();
  if (IMAGE_EXT.has(ext)) return AttachmentKind.IMAGE;
  if (VIDEO_EXT.has(ext)) return AttachmentKind.VIDEO;
  if (AUDIO_EXT.has(ext)) return AttachmentKind.AUDIO;
  if (FILE_EXT.has(ext)) return AttachmentKind.FILE;
  return null;
}

/**
 * Persist a single file to disk + insert the Attachment row. Validation
 * (size, extension) runs first and throws AttachmentError on failure so
 * the caller can map it to a user-friendly message.
 *
 * `uploaderId` may be null for system-injected attachments — the schema
 * allows it. Real user actions should always pass the current user.
 */
export async function storeAttachment(input: {
  contextType: AttachmentContext;
  contextId: string;
  uploaderId: string | null;
  file: File;
}): Promise<Attachment> {
  const { file, contextType, contextId, uploaderId } = input;
  if (!file || file.size === 0) {
    throw new AttachmentError("Empty file.", "EMPTY");
  }

  const kind = classifyByExtension(file.name);
  if (!kind) {
    throw new AttachmentError(
      `${file.name}: unsupported file type.`,
      "BAD_EXTENSION",
    );
  }

  const limit = SIZE_LIMITS_BYTES[kind];
  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    throw new AttachmentError(
      `${file.name}: exceeds the ${mb} MB limit for ${kind.toLowerCase()}s.`,
      "TOO_LARGE",
    );
  }

  // Cap per-context to keep storage and rendering predictable.
  const existing = await prisma.attachment.count({
    where: { contextType, contextId },
  });
  if (existing >= MAX_ATTACHMENTS_PER_CONTEXT) {
    throw new AttachmentError(
      `This item already has the maximum of ${MAX_ATTACHMENTS_PER_CONTEXT} attachments.`,
      "TOO_MANY",
    );
  }

  const ext = extname(file.name).toLowerCase();
  const dir = join(
    UPLOADS_ROOT,
    "attachments",
    contextType.toLowerCase(),
    contextId,
  );
  await mkdir(dir, { recursive: true });

  const stamp = randomBytes(4).toString("hex");
  const safeName = `${stamp}${ext}`;
  await writeFile(
    join(dir, safeName),
    Buffer.from(await file.arrayBuffer()),
  );

  const storageUrl = `uploads/attachments/${contextType.toLowerCase()}/${contextId}/${safeName}`;

  return prisma.attachment.create({
    data: {
      contextType,
      contextId,
      uploaderId,
      kind,
      storageUrl,
      // Browsers omit mime when copy-pasting; default to ext-derived.
      mimeType: file.type || mimeFromExt(ext),
      sizeBytes: file.size,
      originalName: file.name.slice(0, 200),
    },
  });
}

/**
 * Best-effort batch: stores each file, swallowing per-file errors so a
 * single bad upload doesn't sink the whole submission. Errors come back
 * in the `errors` array for the caller to surface.
 */
export async function storeAttachments(input: {
  contextType: AttachmentContext;
  contextId: string;
  uploaderId: string | null;
  files: File[];
}): Promise<{ created: Attachment[]; errors: string[] }> {
  const created: Attachment[] = [];
  const errors: string[] = [];
  for (const file of input.files) {
    if (!file || file.size === 0) continue;
    try {
      const att = await storeAttachment({
        contextType: input.contextType,
        contextId: input.contextId,
        uploaderId: input.uploaderId,
        file,
      });
      created.push(att);
    } catch (e) {
      if (e instanceof AttachmentError) errors.push(e.message);
      else throw e;
    }
  }
  return { created, errors };
}

function mimeFromExt(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
    case ".m4v":
      return "video/quicktime";
    case ".pdf":
      return "application/pdf";
    case ".csv":
      return "text/csv";
    case ".txt":
      return "text/plain";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}
