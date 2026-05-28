import type { BannerBackground, BannerTone } from "@prisma/client";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<BannerTone, string> = {
  BRAND: "bg-linear-to-br from-brand-600 to-brand-800",
  DARK: "bg-[var(--color-ink-deep)]",
  SALE: "bg-linear-to-br from-danger to-danger/80",
};

/**
 * Data needed to render a banner card. Defined independently of the
 * server-only `banners.ts` query module so this component can live in both
 * the server tree (admin preview) and the client bundle (carousel + the
 * admin create form's live preview) without dragging Prisma/pg along.
 */
export type BannerCardData = {
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: BannerTone;
  background: BannerBackground;
  gradientFrom: string | null;
  gradientVia: string | null;
  gradientTo: string | null;
  gradientAngle: number | null;
  mediaUrl: string | null;
  overlayOpacity: number;
};

/**
 * Build the inline `background` value for a GRADIENT banner from its
 * from/via?/to + angle. Exported so the admin live-preview uses the exact
 * same string the storefront renders.
 */
export function gradientCss(b: {
  gradientFrom: string | null;
  gradientVia: string | null;
  gradientTo: string | null;
  gradientAngle: number | null;
}): string {
  const angle = b.gradientAngle ?? 135;
  const stops = [b.gradientFrom, b.gradientVia, b.gradientTo].filter(
    (s): s is string => Boolean(s),
  );
  if (stops.length < 2) {
    // Fall back to a single colour fill if under-specified.
    return stops[0] ?? "var(--color-ink-deep)";
  }
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

/**
 * Single banner card. Presentational (no hooks, no server-only) so it can
 * render in a server tree (admin preview) AND inside the client carousel.
 *
 * Background layers, bottom→top:
 *   1. background (preset gradient class | custom gradient | image | video)
 *   2. dark overlay (image/video only, for text legibility)
 *   3. content (title / subtitle / CTA), always white text
 */
export function BannerCard({ banner }: { banner: BannerCardData }) {
  const isMedia = banner.background === "IMAGE" || banner.background === "VIDEO";
  const overlay = Math.min(100, Math.max(0, banner.overlayOpacity)) / 100;

  return (
    <div className="relative overflow-hidden rounded-xl border border-transparent">
      {/* Background layer */}
      {banner.background === "PRESET" && (
        <div className={cn("absolute inset-0", TONE_CLASSES[banner.tone])} />
      )}
      {banner.background === "GRADIENT" && (
        <div
          className="absolute inset-0"
          style={{ background: gradientCss(banner) }}
        />
      )}
      {banner.background === "IMAGE" && banner.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.mediaUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {banner.background === "VIDEO" && banner.mediaUrl && (
        <video
          src={banner.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Legibility overlay over media */}
      {isMedia && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlay }}
          aria-hidden
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm">
            {banner.title}
          </h3>
          {banner.subtitle && (
            <p className="text-sm text-white/85 mt-0.5 leading-snug drop-shadow-sm">
              {banner.subtitle}
            </p>
          )}
        </div>
        {banner.ctaLabel && banner.ctaHref && (
          <span className="shrink-0 inline-flex items-center h-10 px-5 rounded-md bg-white text-ink font-semibold text-sm">
            {banner.ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
