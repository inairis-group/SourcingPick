"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * Reusable image lightbox.
 *
 * The reviewer-side screens (admin KYC, product moderation, request
 * verification) used to show images as small inline thumbnails — clicking
 * did nothing. Per the partner doc: images must be clickable so they can
 * be reviewed at full size.
 *
 * Usage:
 *   const lb = useLightbox(urls);
 *   ...
 *   <button onClick={() => lb.open(i)}><img ...thumbnail.../></button>
 *   {lb.element}
 *
 * Keyboard: Esc closes, ← / → navigate. Body scroll is locked while open
 * so the page underneath doesn't drift. Renders via a portal to escape
 * any `overflow: hidden` ancestor (Dialog drawers in particular).
 */
export function useLightbox(urls: ReadonlyArray<string>) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback(
    (i: number) => {
      if (i < 0 || i >= urls.length) return;
      setIndex(i);
    },
    [urls.length],
  );
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % urls.length)),
    [urls.length],
  );
  const prev = useCallback(
    () =>
      setIndex((i) =>
        i === null ? null : (i - 1 + urls.length) % urls.length,
      ),
    [urls.length],
  );

  const element = (
    <ImageLightbox
      urls={urls}
      index={index}
      onClose={close}
      onNext={next}
      onPrev={prev}
    />
  );

  return { open, close, element, isOpen: index !== null };
}

function ImageLightbox({
  urls,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  urls: ReadonlyArray<string>;
  index: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Keyboard: Esc closes; ← / → navigate.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, onClose, onNext, onPrev]);

  // Lock body scroll while open so the page beneath doesn't drift on
  // mobile when the user gestures over the dim background.
  useEffect(() => {
    if (index === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [index]);

  if (!mounted || index === null) return null;

  const url = urls[index];
  if (!url) return null;
  const multi = urls.length > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Image viewer"
    >
      {/* Top-right close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={cn(
          "absolute top-3 right-3 inline-flex items-center justify-center h-10 w-10 rounded-full",
          "bg-black/40 text-white hover:bg-black/60 transition-colors duration-fast",
          "focus:outline-2 focus:outline-white focus:outline-offset-2",
        )}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
      </button>

      {multi && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full",
              "bg-black/40 text-white hover:bg-black/60 transition-colors duration-fast",
            )}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full",
              "bg-black/40 text-white hover:bg-black/60 transition-colors duration-fast",
            )}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </button>
        </>
      )}

      <div
        className="max-h-[90vh] max-w-[92vw] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image. Plain <img> so we don't have to whitelist every storage
            host in next/image config. Loading attribute keeps the swap
            from re-downloading prior frames during keyboard navigation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          loading="eager"
          className="max-h-[85vh] max-w-[92vw] object-contain rounded-sm shadow-lg"
        />
        {multi && (
          <p className="text-xs text-white/80 font-mono">
            {index + 1} / {urls.length}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
