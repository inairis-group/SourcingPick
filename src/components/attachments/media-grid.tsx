import { AttachmentKind, type AttachmentContext } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Download02Icon } from "@hugeicons/core-free-icons";
import { prisma } from "@/lib/db/client";
import { AttachmentDeleteButton } from "./attachment-delete-button";
import { LightboxGallery } from "./lightbox-gallery";
import { cn } from "@/lib/utils";

/**
 * Server component — fetches attachments for (contextType, contextId) and
 * renders them grouped: images first (gallery grid), then videos (with
 * native player), then files (link list with size + filename).
 *
 * Renders nothing when there are no attachments — safe to drop into a
 * detail page unconditionally.
 *
 * The download URL always goes through `/api/attachments/[id]`, which
 * enforces per-context permissions on the server. Don't link to
 * storageUrl directly.
 */
export async function MediaGrid({
  contextType,
  contextId,
  title,
  className,
  canManage = false,
}: {
  contextType: AttachmentContext;
  contextId: string;
  /** Optional section heading; omitted on inline uses (e.g. messages). */
  title?: string;
  className?: string;
  /** When true, render per-item delete controls (caller asserts the
      viewer owns this context; the delete action re-checks server-side). */
  canManage?: boolean;
}) {
  const attachments = await prisma.attachment.findMany({
    where: { contextType, contextId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      kind: true,
      mimeType: true,
      sizeBytes: true,
      originalName: true,
    },
  });
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => a.kind === AttachmentKind.IMAGE);
  const videos = attachments.filter((a) => a.kind === AttachmentKind.VIDEO);
  const files = attachments.filter((a) => a.kind === AttachmentKind.FILE);

  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-surface p-5 flex flex-col gap-4",
        className,
      )}
    >
      {title && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {title}
        </h2>
      )}

      {images.length > 0 && (
        <LightboxGallery
          images={images.map((a) => ({
            id: a.id,
            originalName: a.originalName,
          }))}
          canManage={canManage}
        />
      )}

      {videos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-line bg-subtle overflow-hidden relative"
            >
              {canManage && (
                <div className="absolute top-1.5 inset-e-1.5 z-10">
                  <AttachmentDeleteButton id={a.id} />
                </div>
              )}
              <video
                src={`/api/attachments/${a.id}`}
                controls
                preload="metadata"
                className="w-full aspect-video bg-black"
              />
              <p className="text-xs text-muted px-3 py-2 truncate">
                {a.originalName}
              </p>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <a
                href={`/api/attachments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 min-w-0 items-center gap-2 rounded-sm border border-line-subtle bg-subtle px-3 py-2 hover:bg-surface transition-colors duration-fast"
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg truncate">
                    {a.originalName}
                  </p>
                  <p className="text-[10px] text-faint">
                    {formatSize(a.sizeBytes)}
                  </p>
                </div>
                <HugeiconsIcon
                  icon={Download02Icon}
                  size={14}
                  strokeWidth={1.5}
                  className="text-faint shrink-0"
                />
              </a>
              {canManage && <AttachmentDeleteButton id={a.id} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
