import "server-only";
import type { Incoterm } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Pricing-v3 Phase 3 — approximate delivery-fee calculator.
 *
 * Looks up the (origin, destination, incoterm) row in DeliveryRate
 * and picks the highest weight bracket whose threshold is ≤ the
 * requested weight. Returns the row's `min`/`max` range plus the
 * partner name and an optional note.
 *
 * The math is intentionally simple: weights are bracketed, ranges
 * carry the uncertainty. The result is labelled "approximate" in
 * every embedding so buyers know the real quote comes from the
 * forwarder at tender time.
 *
 * Returns `null` when no rate row matches — callers render a "we'll
 * come back with a quote" empty state.
 */
export type DeliveryEstimate = {
  minCents: number;
  maxCents: number;
  partnerName: string;
  notes: string | null;
  /** Weight bracket actually matched (kg). Surfaced for transparency. */
  matchedBracketKg: number;
};

export async function estimateDeliveryFee(args: {
  originCountry: string;
  destinationCountry: string;
  incoterm: Incoterm;
  weightKg: number;
}): Promise<DeliveryEstimate | null> {
  const weight = Math.max(0, Math.floor(args.weightKg));
  const row = await prisma.deliveryRate.findFirst({
    where: {
      originCountry: args.originCountry.toUpperCase(),
      destinationCountry: args.destinationCountry.toUpperCase(),
      incoterm: args.incoterm,
      weightBracketKg: { lte: weight },
    },
    orderBy: { weightBracketKg: "desc" },
    select: {
      minCents: true,
      maxCents: true,
      partnerName: true,
      notes: true,
      weightBracketKg: true,
    },
  });
  if (!row) return null;
  return {
    minCents: row.minCents,
    maxCents: row.maxCents,
    partnerName: row.partnerName,
    notes: row.notes,
    matchedBracketKg: row.weightBracketKg,
  };
}

/**
 * Lookup helper for the standalone calculator page. Returns every
 * origin / destination country pair we have ANY rate for, so the
 * form's country dropdowns can offer just the routes we can answer.
 */
export async function availableDeliveryCountries(): Promise<{
  origins: string[];
  destinations: string[];
}> {
  const rows = await prisma.deliveryRate.findMany({
    distinct: ["originCountry", "destinationCountry"],
    orderBy: [{ originCountry: "asc" }, { destinationCountry: "asc" }],
    select: { originCountry: true, destinationCountry: true },
  });
  const origins = Array.from(new Set(rows.map((r) => r.originCountry)));
  const destinations = Array.from(
    new Set(rows.map((r) => r.destinationCountry)),
  );
  return { origins, destinations };
}
