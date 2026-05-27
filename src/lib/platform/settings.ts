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

export type DeliveryEtas = {
  africa: string | null;
  europe: string | null;
  americas: string | null;
  asia: string | null;
};

let etaCached: { value: DeliveryEtas; expiresAt: number } | null = null;

/**
 * Free-text estimated delivery windows per continent, surfaced on the
 * marketplace. Admin-editable; null/empty hides the row for that
 * continent. Cached for 60s alongside the allowlist.
 */
export async function getDeliveryEtas(): Promise<DeliveryEtas> {
  if (etaCached && etaCached.expiresAt > Date.now()) return etaCached.value;
  const row = await prisma.platformSettings.findUnique({
    where: { id: "default" },
    select: {
      deliveryEtaAfrica: true,
      deliveryEtaEurope: true,
      deliveryEtaAmericas: true,
      deliveryEtaAsia: true,
    },
  });
  const value: DeliveryEtas = {
    africa: row?.deliveryEtaAfrica ?? null,
    europe: row?.deliveryEtaEurope ?? null,
    americas: row?.deliveryEtaAmericas ?? null,
    asia: row?.deliveryEtaAsia ?? null,
  };
  etaCached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

export function clearDeliveryEtasCache(): void {
  etaCached = null;
}
