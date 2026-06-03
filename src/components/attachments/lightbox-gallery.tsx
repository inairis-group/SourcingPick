"use client";

import { useLightbox } from "@/components/ui/image-lightbox";
import { AttachmentDeleteButton } from "./attachment-delete-button";
import { cn } from "@/lib/utils";

/**
 * Image gallery used by MediaGrid + any caller that wants the same
 * click-to-zoom UX. Pure client component so the lightbox hook can wire
 * keyboard nav + body-scroll lock; the parent (server) component fetches
 * and passes the image list down.
 *
 * Each thumbnail is a button — clicking opens the lightbox at that index;
 * keyboard ← / → navigate between siblings of the same gallery.
 */
export function LightboxGallery({
  images,
  canManage,
}: {
  images: ReadonlyArray<{ id: string; originalName: string }>;
  canManage: boolean;
}) {
  const urls = images.map((a) => `/api/attachments/${a.id}`);
  const lb = useLightbox(urls);

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {images.map((a, i) => (
          <li
            key={a.id}
            className="aspect-square rounded-md border border-line bg-subtle overflow-hidden relative group"
          >
            <button
              type="button"
              onClick={() => lb.open(i)}
              aria-label={a.originalName}
              className={cn(
                "absolute inset-0 cursor-zoom-in",
                "focus:outline-2 focus:outline-focus focus:outline-offset-2",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[i]}
                alt={a.originalName}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </button>
            {canManage && (
              <div className="absolute top-1.5 inset-e-1.5 z-10">
                <AttachmentDeleteButton id={a.id} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {lb.element}
    </>
  );
}
