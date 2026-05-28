import "server-only";
import type { BannerBackground, BannerTone } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Active marketplace banners for the storefront. A banner is "active"
 * when its `active` flag is set AND the current time is within its
 * optional [startsAt, endsAt] window. Ordered by sortOrder then newest.
 *
 * Cached 60s per process — banners change rarely and the storefront is
 * a hot path. clearMarketplaceBannersCache() is called from the admin
 * mutations.
 */
export type ActiveBanner = {
  id: string;
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

const CACHE_TTL_MS = 60_000;
let cached: { value: ActiveBanner[]; expiresAt: number } | null = null;

export async function getActiveBanners(): Promise<ActiveBanner[]> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const now = new Date();
  const rows = await prisma.marketplaceBanner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 5,
    select: {
      id: true,
      title: true,
      subtitle: true,
      ctaLabel: true,
      ctaHref: true,
      tone: true,
      background: true,
      gradientFrom: true,
      gradientVia: true,
      gradientTo: true,
      gradientAngle: true,
      mediaUrl: true,
      overlayOpacity: true,
    },
  });

  cached = { value: rows, expiresAt: Date.now() + CACHE_TTL_MS };
  return rows;
}

export function clearMarketplaceBannersCache(): void {
  cached = null;
}
