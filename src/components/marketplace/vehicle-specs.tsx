import type {
  VehicleDrivetrain,
  VehicleFuel,
  VehicleTransmission,
} from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Vehicle spec block for a Category.VEHICLE listing.
 *
 * The Certificate of Conformity is deliberately not just another row: without
 * one an imported car cannot be registered in the EU, so a missing CoC is a
 * transaction blocker rather than a missing attribute, and it gets a warning
 * treatment rather than an em dash.
 */
export function VehicleSpecs({
  vehicle,
  lang,
  dict,
}: {
  vehicle: {
    vin: string | null;
    makeName: string;
    modelName: string;
    year: number;
    mileageKm: number | null;
    fuel: VehicleFuel;
    transmission: VehicleTransmission;
    drivetrain: VehicleDrivetrain | null;
    colour: string | null;
    engineCc: number | null;
    powerKw: number | null;
    hasCoc: boolean;
    cocReference: string | null;
  };
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.publicMarketplace as unknown as Record<string, string>;
  // The enum maps live beside the labels rather than in a component constant,
  // so a fuel type reads as "Essence" and not "PETROL" in every locale.
  const maps = dict.publicMarketplace as unknown as {
    fuels: Record<VehicleFuel, string>;
    transmissions: Record<VehicleTransmission, string>;
    drivetrains: Record<VehicleDrivetrain, string>;
  };
  const num = new Intl.NumberFormat(lang);

  const rows: [string, string | null][] = [
    [t.vehicleYear, String(vehicle.year)],
    [
      t.vehicleMileage,
      vehicle.mileageKm !== null ? `${num.format(vehicle.mileageKm)} km` : null,
    ],
    [t.vehicleFuel, maps.fuels[vehicle.fuel]],
    [t.vehicleTransmission, maps.transmissions[vehicle.transmission]],
    [
      t.vehicleDrivetrain,
      vehicle.drivetrain ? maps.drivetrains[vehicle.drivetrain] : null,
    ],
    [t.vehicleColour, vehicle.colour],
    [
      t.vehicleEngine,
      vehicle.engineCc !== null ? `${num.format(vehicle.engineCc)} cc` : null,
    ],
    // kW rather than hp: it is what EU registration documents carry.
    [t.vehiclePower, vehicle.powerKw !== null ? `${vehicle.powerKw} kW` : null],
    [t.vehicleVin, vehicle.vin],
  ];

  return (
    <section className="border-line bg-surface mt-8 rounded-lg border p-5">
      <h2 className="text-headline mb-1 text-sm font-semibold">
        {t.vehicleTitle}
      </h2>
      <p className="text-muted mb-4 text-sm">
        {vehicle.makeName} {vehicle.modelName}
      </p>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div
              key={label}
              className="border-line-subtle flex justify-between gap-4 border-b py-1.5 text-sm last:border-b-0"
            >
              <dt className="text-faint">{label}</dt>
              <dd className="text-fg">{value}</dd>
            </div>
          ))}
      </dl>

      <div
        className={
          vehicle.hasCoc
            ? "border-success-edge bg-success-soft text-success mt-4 rounded-md border px-3 py-2 text-sm"
            : "border-danger-edge bg-danger-soft text-danger mt-4 rounded-md border px-3 py-2 text-sm"
        }
      >
        <span className="font-semibold">{t.vehicleCoc}: </span>
        {vehicle.hasCoc
          ? `${t.vehicleCocYes}${vehicle.cocReference ? ` · ${vehicle.cocReference}` : ""}`
          : t.vehicleCocNo}
      </div>
    </section>
  );
}
