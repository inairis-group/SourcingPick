"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Category,
  MarketplaceCondition,
  VehicleFuel,
  VehicleTransmission,
} from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDictionary } from "@/lib/i18n/client-provider";

const CATEGORIES = Object.values(Category);
const CONDITIONS = Object.values(MarketplaceCondition);
const FUELS = Object.values(VehicleFuel);
const TRANSMISSIONS = Object.values(VehicleTransmission);

/** The five vehicle facets, as they appear in the URL. */
export type VehicleFacetValues = {
  make: string;
  fuel: string;
  transmission: string;
  yearMin: string;
  kmMax: string;
};

export const EMPTY_VEHICLE_FACETS: VehicleFacetValues = {
  make: "",
  fuel: "",
  transmission: "",
  yearMin: "",
  kmMax: "",
};

/**
 * Public marketplace filters. Identical UX to the client-side filters but
 * targets the public `/marketplace` route (no `/client/` prefix), so
 * anonymous browsing stays inside the marketing layout.
 */
export function MarketplaceFilters({
  lang,
  category,
  condition,
  deals,
  query,
  makes = [],
  vehicle = EMPTY_VEHICLE_FACETS,
}: {
  lang: string;
  category?: Category;
  condition?: MarketplaceCondition;
  deals?: boolean;
  query: string;
  /// Makes actually present in the published catalogue. Offering the full
  /// list of car manufacturers would mostly offer empty results.
  makes?: string[];
  vehicle?: VehicleFacetValues;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const params = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  const buildHref = (next: {
    q?: string;
    category?: string;
    condition?: string;
    deals?: boolean;
    vehicle?: Partial<VehicleFacetValues>;
  }) => {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next.vehicle ?? {})) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) sp.set("category", next.category);
      else sp.delete("category");
    }
    if (next.condition !== undefined) {
      if (next.condition) sp.set("condition", next.condition);
      else sp.delete("condition");
    }
    if (next.deals !== undefined) {
      if (next.deals) sp.set("deals", "1");
      else sp.delete("deals");
    }
    const qs = sp.toString();
    return `/${lang}/marketplace${qs ? `?${qs}` : ""}`;
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref({ q: draftQuery }));
  };

  return (
    <MarketplaceFilterBar
      dict={dict}
      categories={CATEGORIES}
      conditions={CONDITIONS}
      category={category}
      condition={condition}
      deals={deals}
      draftQuery={draftQuery}
      onDraftQueryChange={setDraftQuery}
      onSearch={onSearch}
      makes={makes}
      vehicle={vehicle}
      onVehicleChange={(patch) => router.push(buildHref({ vehicle: patch }))}
      onCategoryChange={(v) =>
        // Leaving car facets set while browsing furniture would silently
        // return nothing, so switching category clears them.
        router.push(
          buildHref({
            category: v,
            ...(v === Category.VEHICLE
              ? {}
              : { vehicle: EMPTY_VEHICLE_FACETS }),
          }),
        )
      }
      onConditionChange={(v) => router.push(buildHref({ condition: v }))}
      onDealsChange={(v) => router.push(buildHref({ deals: v }))}
    />
  );
}

/**
 * Shared dropdown filter bar — search input + Category / Condition / Deals
 * selects. The public and client filter wrappers differ only in their URL
 * prefix, so the visual + interaction layer lives here.
 */
export function MarketplaceFilterBar({
  dict,
  categories,
  conditions,
  category,
  condition,
  deals,
  draftQuery,
  onDraftQueryChange,
  onSearch,
  onCategoryChange,
  onConditionChange,
  onDealsChange,
  makes = [],
  vehicle = EMPTY_VEHICLE_FACETS,
  onVehicleChange,
}: {
  dict: ReturnType<typeof useDictionary>;
  categories: Category[];
  conditions: MarketplaceCondition[];
  category?: Category;
  condition?: MarketplaceCondition;
  deals?: boolean;
  draftQuery: string;
  onDraftQueryChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onCategoryChange: (v: string) => void;
  onConditionChange: (v: string) => void;
  onDealsChange: (v: boolean) => void;
  makes?: string[];
  vehicle?: VehicleFacetValues;
  onVehicleChange?: (patch: Partial<VehicleFacetValues>) => void;
}) {
  const mkt = dict.publicMarketplace as unknown as Record<string, string>;
  const cat = dict.factory.catalogue as unknown as Record<string, string>;

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <form onSubmit={onSearch} className="flex-1 min-w-0">
        <Input
          value={draftQuery}
          onChange={(e) => onDraftQueryChange(e.target.value)}
          placeholder={dict.client.marketplace.searchPlaceholder}
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Select
          size="md"
          className="min-w-36"
          value={category ?? ""}
          onChange={onCategoryChange}
          options={[
            { value: "", label: dict.client.marketplace.allCategories },
            ...categories.map((c) => ({ value: c, label: dict.categories[c] })),
          ]}
        />

        <Select
          size="md"
          className="min-w-36"
          value={condition ?? ""}
          onChange={onConditionChange}
          options={[
            { value: "", label: dict.client.marketplace.allConditions },
            ...conditions.map((c) => ({
              value: c,
              label: dict.factory.catalogue.conditions[c],
            })),
          ]}
        />
        <Select
          size="md"
          className="min-w-36"
          value={deals ? "1" : ""}
          onChange={(v) => onDealsChange(v === "1")}
          options={[
            { value: "", label: dict.client.marketplace.allDeals },
            { value: "1", label: dict.client.marketplace.dealsOnly },
          ]}
        />
      </div>
    </div>

    {/* Car facets. Shown only under the Vehicles category — they are
        meaningless everywhere else, and a permanently visible mileage box
        would be noise on a catalogue that is mostly not cars. */}
    {category === Category.VEHICLE && onVehicleChange && (
      <div className="border-line-subtle grid grid-cols-2 gap-2 border-t pt-2 sm:grid-cols-5 sm:gap-3">
        <Select
          size="md"
          value={vehicle.make}
          onChange={(v) => onVehicleChange({ make: v })}
          options={[
            { value: "", label: cat.makeLabel },
            ...makes.map((m) => ({ value: m, label: m })),
          ]}
        />
        <Select
          size="md"
          value={vehicle.fuel}
          onChange={(v) => onVehicleChange({ fuel: v })}
          options={[
            { value: "", label: cat.fuelLabel },
            ...FUELS.map((f) => ({
              value: f,
              label: dict.publicMarketplace.fuels[f],
            })),
          ]}
        />
        <Select
          size="md"
          value={vehicle.transmission}
          onChange={(v) => onVehicleChange({ transmission: v })}
          options={[
            { value: "", label: cat.transmissionLabel },
            ...TRANSMISSIONS.map((tr) => ({
              value: tr,
              label: dict.publicMarketplace.transmissions[tr],
            })),
          ]}
        />
        {/* Committed on blur rather than per keystroke: each change is a
            navigation, and one per digit would fire four useless queries. */}
        <Input
          type="number"
          inputMode="numeric"
          min="1900"
          defaultValue={vehicle.yearMin}
          placeholder={mkt.vehicleYearFrom}
          onBlur={(e) => onVehicleChange({ yearMin: e.target.value })}
        />
        <Input
          type="number"
          inputMode="numeric"
          min="0"
          defaultValue={vehicle.kmMax}
          placeholder={mkt.vehicleKmUpTo}
          onBlur={(e) => onVehicleChange({ kmMax: e.target.value })}
        />
      </div>
    )}
    </div>
  );
}
