"use client";

import { useLightbox } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

/**
 * Hero + thumbnails for marketplace product detail pages, with the
 * lightbox wired in. Used by factory catalogue, client marketplace and
 * public marketplace detail pages so the click-to-zoom UX is identical
 * everywhere a product is reviewed.
 *
 * Falls back to a placeholder square when no images exist (factory might
 * publish without photos in the moderation flow — admin still needs to
 * see the listing).
 */
export function ProductImageGallery({
  imageUrls,
  productName,
}: {
  imageUrls: string[];
  productName: string;
}) {
  const lb = useLightbox(imageUrls);

  if (imageUrls.length === 0) {
    return (
      <div className="aspect-4/3 bg-subtle rounded-lg border border-line" />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => lb.open(0)}
        aria-label={productName}
        className={cn(
          "aspect-4/3 bg-subtle rounded-lg border border-line overflow-hidden relative cursor-zoom-in",
          "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrls[0]}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </button>
      {imageUrls.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {imageUrls.slice(1, 6).map((url, i) => {
            // +1 offset because slice(1) skipped the hero, which is index 0
            // in the lightbox.
            const lightboxIndex = i + 1;
            return (
              <button
                key={lightboxIndex}
                type="button"
                onClick={() => lb.open(lightboxIndex)}
                aria-label={`${productName} ${lightboxIndex + 1}`}
                className={cn(
                  "aspect-square rounded-md border border-line bg-subtle overflow-hidden relative cursor-zoom-in",
                  "focus:outline-2 focus:outline-focus focus:outline-offset-2",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
      {lb.element}
    </div>
  );
}
