import "server-only";
import { SourcingRegion } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * The geographic allowlist that gates the new-request wizard's region +
 * country pickers, the factory directory's region filter, and any future
 * surface that needs to know "what does SourcingPick officially cover."
 *
 * Reads from PlatformSettings (single row, id="default"). If the row is
 * missing (fresh DB), we return a sane fallback so the app keeps working.
 *
 * Cached for 60 seconds per process — the read is cheap but on hot pages
 * (wizard, factory directory) we don't need to re-fetch on every render.
 */

const CACHE_TTL_MS = 60_000;
type Allowlist = {
  regions: SourcingRegion[];
  countries: string[];
};

let cached: { value: Allowlist; expiresAt: number } | null = null;

export async function getSourcingAllowlist(): Promise<Allowlist> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const row = await prisma.platformSettings.findUnique({
    where: { id: "default" },
    select: {
      allowedSourcingRegions: true,
      allowedSourcingCountries: true,
    },
  });

  const value: Allowlist = row
    ? {
        regions: row.allowedSourcingRegions,
        countries: row.allowedSourcingCountries,
      }
    : {
        // Launch defaults if the seed row is missing (e.g. fresh CI DB).
        regions: [SourcingRegion.ASIA, SourcingRegion.MIDDLE_EAST],
        countries: ["CN", "VN", "AE"],
      };

  cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

export function clearSourcingAllowlistCache(): void {
  cached = null;
}
