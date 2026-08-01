"use client";

import { useActionState } from "react";
import { attachShipmentDocuments, reviseShipmentBrief } from "@/lib/shipments/actions";

/**
 * The internal team's two write surfaces on a shipment: revise the §2 brief,
 * and attach the §2.2.1 invoice.
 *
 * Both were reachable only from code until now — the internal side was
 * list-only, so `reviseShipmentBrief` and `attachShipmentDocuments` had no UI.
 */

type Copy = Record<string, string>;

const FIELD = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";
const LABEL = "text-faint mb-1 block text-xs font-medium";

function useError(state: { ok: boolean; error?: string } | null, copy: Copy) {
  if (!state || state.ok || !state.error) return null;
  return copy[`err_${state.error}`] ?? copy.err_generic ?? state.error;
}

export function ReviseBriefForm({
  shipmentId,
  defaults,
  copy,
}: {
  shipmentId: string;
  defaults: {
    shippingMethod: string;
    totalWeightKg: string;
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    destAddress: string;
    destCity: string;
    destCountry: string;
  };
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(reviseShipmentBrief, null);
  const error = useError(state, copy);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      {/* Stated up front: this is not a quiet edit — it invalidates the
          fixed price and obliges a justified revision. */}
      <p className="border-warning-edge bg-warning-soft text-warning rounded-md border px-3 py-2 text-sm">
        {copy.reviseBriefHint}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className={LABEL} htmlFor="shippingMethod">
            {copy.method}
          </label>
          <input
            id="shippingMethod"
            name="shippingMethod"
            defaultValue={defaults.shippingMethod}
            required
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="totalWeightKg">
            {copy.weight}
          </label>
          <input
            id="totalWeightKg"
            name="totalWeightKg"
            type="number"
            step="0.001"
            min="0"
            defaultValue={defaults.totalWeightKg}
            required
            className={FIELD}
          />
        </div>
        <div className="col-span-2">
          <label className={LABEL}>{copy.dimensions}</label>
          <div className="flex items-center gap-2">
            <input
              name="lengthCm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.lengthCm}
              required
              className={FIELD}
            />
            <input
              name="widthCm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.widthCm}
              required
              className={FIELD}
            />
            <input
              name="heightCm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.heightCm}
              required
              className={FIELD}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <input name="destAddress" defaultValue={defaults.destAddress} required className={FIELD} />
        <input name="destCity" defaultValue={defaults.destCity} required className={FIELD} />
        <input name="destCountry" defaultValue={defaults.destCountry} required className={FIELD} />
      </div>

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="border-line-strong text-fg hover:bg-subtle duration-fast h-10 self-start rounded-md border px-5 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {copy.reviseBrief}
      </button>
    </form>
  );
}

export function AttachInvoiceForm({ shipmentId, copy }: { shipmentId: string; copy: Copy }) {
  const [state, action, pending] = useActionState(attachShipmentDocuments, null);
  const error = useError(state, copy);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <p className="text-faint text-xs">{copy.attachInvoiceHint}</p>
      <input
        type="file"
        name="invoice"
        accept="application/pdf,image/*"
        required
        className="text-fg text-sm"
      />

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}
      {state?.ok && (
        <p className="border-success-edge bg-success-soft text-success rounded-md border px-3 py-2 text-sm">
          {copy.created}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-action text-on-action hover:bg-action-hover duration-fast h-9 self-start rounded-md px-4 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {copy.upload}
      </button>
    </form>
  );
}
