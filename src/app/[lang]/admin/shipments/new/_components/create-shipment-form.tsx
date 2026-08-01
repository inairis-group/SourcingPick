"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createShipmentForOrder } from "@/lib/shipments/actions";

/**
 * §2 — the mandatory brief. The spec treats the order-level data and the
 * per-product rows as one payload, so this is deliberately a single form
 * rather than a wizard: a shipper cannot quote from a partial brief, and
 * splitting it would invite half-filled records.
 *
 * Product rows are client state because the count is open-ended; they post as
 * parallel `itemLabel`/`itemNature`/… arrays, which the action zips back up.
 */

type Option = { id: string; label: string };
type Copy = Record<string, string>;

const FIELD = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";
const LABEL = "text-faint mb-1 block text-xs font-medium";

export function CreateShipmentForm({
  lang,
  orders,
  shippers,
  copy,
}: {
  lang: string;
  orders: Option[];
  shippers: Option[];
  copy: Copy;
}) {
  const router = useRouter();
  const [rows, setRows] = useState([0]);
  const [state, action, pending] = useActionState(createShipmentForOrder, null);

  // Navigate in an effect, not during render: calling router.push from the
  // component body is a side effect during render and re-fires on every
  // subsequent render while the success state is still set.
  useEffect(() => {
    if (state?.ok) router.push(`/${lang}/admin/shipments`);
  }, [state, router, lang]);

  const error =
    state && !state.ok ? (copy[`err_${state.error}`] ?? copy.err_generic ?? state.error) : null;

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="orderId">
            {copy.selectOrder}
          </label>
          <select id="orderId" name="orderId" required className={FIELD}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="shipperOrgId">
            {copy.selectShipper}
          </label>
          <select id="shipperOrgId" name="shipperOrgId" required className={FIELD}>
            {shippers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* §2.2 — order-level logistics data. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className={LABEL} htmlFor="shippingMethod">
            {copy.method}
          </label>
          <input id="shippingMethod" name="shippingMethod" required className={FIELD} />
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
            required
            className={FIELD}
          />
        </div>
        <div className="col-span-2">
          <label className={LABEL}>{copy.dimensions}</label>
          <div className="flex items-center gap-2">
            {["lengthCm", "widthCm", "heightCm"].map((n) => (
              <input
                key={n}
                name={n}
                type="number"
                step="0.01"
                min="0"
                required
                className={FIELD}
              />
            ))}
          </div>
        </div>
      </div>

      {/* §2.2.6 — full destination. */}
      <fieldset className="border-line rounded-lg border p-4">
        <legend className="text-faint px-2 text-xs font-medium">{copy.destination}</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input name="destName" placeholder="—" required className={FIELD} />
          <input name="destAddress" placeholder="—" required className={FIELD} />
          <input name="destCity" placeholder="—" required className={FIELD} />
          <input name="destPostalCode" placeholder="—" className={FIELD} />
          <input name="destCountry" placeholder="—" required className={FIELD} />
        </div>
      </fieldset>

      {/* §2.1 — per-product rows. */}
      <fieldset className="border-line rounded-lg border p-4">
        <legend className="text-faint px-2 text-xs font-medium">{copy.items}</legend>
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input name="itemLabel" placeholder={copy.itemLabel} required className={FIELD} />
              <input name="itemNature" placeholder={copy.nature} required className={FIELD} />
              <input
                name="itemQuantity"
                type="number"
                min="1"
                defaultValue={1}
                placeholder={copy.qty}
                className={FIELD}
              />
              <input
                name="itemUnitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder={copy.unitPrice}
                className={FIELD}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, (prev.at(-1) ?? 0) + 1])}
          className="text-info mt-3 text-xs font-semibold"
        >
          + {copy.addItem}
        </button>
      </fieldset>

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-action text-on-action hover:bg-action-hover duration-fast h-10 self-start rounded-md px-5 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {copy.createSubmit}
      </button>
    </form>
  );
}
