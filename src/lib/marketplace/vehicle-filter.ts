import { VehicleFuel, VehicleTransmission } from "@prisma/client";

/**
 * Vehicle facets for the marketplace listing.
 *
 * Category alone is not a car filter — nobody shops for "a vehicle", they shop
 * for a diesel estate under 150 000 km. These five narrow that down without
 * turning the page into a form.
 *
 * Pure, and shared by the public and client listings so both read the same URL
 * and mean the same thing by it.
 */

export type VehicleFacets = {
  make: string;
  fuel: VehicleFuel | undefined;
  transmission: VehicleTransmission | undefined;
  yearMin: number | undefined;
  kmMax: number | undefined;
};

type RawParams = Record<string, string | string[] | undefined> | undefined;

const str = (v: string | string[] | undefined): string =>
  typeof v === "string" ? v.trim() : "";

/** Positive integers only — a negative mileage cap would exclude everything. */
function positiveInt(raw: string, max: number): number | undefined {
  if (!/^\d{1,9}$/.test(raw)) return undefined;
  const n = Number(raw);
  return n > 0 && n <= max ? n : undefined;
}

export function readVehicleFacets(search: RawParams): VehicleFacets {
  const rawFuel = str(search?.fuel);
  const rawTransmission = str(search?.transmission);
  return {
    make: str(search?.make).slice(0, 60),
    fuel: (Object.values(VehicleFuel) as string[]).includes(rawFuel)
      ? (rawFuel as VehicleFuel)
      : undefined,
    transmission: (Object.values(VehicleTransmission) as string[]).includes(
      rawTransmission,
    )
      ? (rawTransmission as VehicleTransmission)
      : undefined,
    yearMin: positiveInt(str(search?.yearMin), 2100),
    kmMax: positiveInt(str(search?.kmMax), 3_000_000),
  };
}

/**
 * Build the nested `vehicle` filter. Returns `{}` when nothing is set, so it
 * spreads harmlessly into a where-clause for a non-vehicle search.
 *
 * `is:` rather than a bare object because the relation is optional — `is`
 * excludes listings with no VehicleDetail, which is exactly right the moment
 * any vehicle facet is in play.
 */
export function vehicleWhere(facets: VehicleFacets) {
  const conditions = {
    ...(facets.make
      ? { makeName: { equals: facets.make, mode: "insensitive" as const } }
      : {}),
    ...(facets.fuel ? { fuel: facets.fuel } : {}),
    ...(facets.transmission ? { transmission: facets.transmission } : {}),
    ...(facets.yearMin ? { year: { gte: facets.yearMin } } : {}),
    // A listing with no recorded mileage isn't "under 100 000 km", it's
    // unknown — a mileage cap therefore excludes it rather than assuming zero.
    ...(facets.kmMax ? { mileageKm: { lte: facets.kmMax } } : {}),
  };
  return Object.keys(conditions).length > 0
    ? { vehicle: { is: conditions } }
    : {};
}

export function hasVehicleFacet(facets: VehicleFacets): boolean {
  return Object.keys(vehicleWhere(facets)).length > 0;
}
