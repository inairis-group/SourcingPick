"use client";

import { useActionState } from "react";
import { createShipperPartner } from "@/lib/shipments/actions";

/**
 * Organisation and first user in one form — a SHIPPER org with no user is
 * unreachable, and the action creates both in a single transaction, so
 * splitting the UI would misrepresent what happens.
 */

type Copy = Record<string, string>;

const FIELD = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";
const LABEL = "text-faint mb-1 block text-xs font-medium";

export function CreatePartnerForm({ copy }: { copy: Copy }) {
  const [state, action, pending] = useActionState(createShipperPartner, null);

  const error =
    state && !state.ok ? (copy[`err_${state.error}`] ?? copy.err_generic ?? state.error) : null;

  const text = (name: string, label: string, required = true) => (
    <div>
      <label className={LABEL} htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} required={required} className={FIELD} />
    </div>
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset className="border-line rounded-lg border p-4">
        <legend className="text-faint px-2 text-xs font-medium">{copy.selectShipper}</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("legalName", copy.legalName)}
          {text("displayName", copy.displayName)}
          {text("country", copy.country)}
          {text("city", copy.city)}
          <div className="sm:col-span-2">{text("address", copy.address)}</div>
        </div>
      </fieldset>

      <fieldset className="border-line rounded-lg border p-4">
        <legend className="text-faint px-2 text-xs font-medium">{copy.contactEmail}</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("firstName", copy.firstName)}
          {text("lastName", copy.lastName)}
          <div>
            <label className={LABEL} htmlFor="email">
              {copy.contactEmail}
            </label>
            <input id="email" name="email" type="email" required className={FIELD} />
          </div>
          <div>
            <label className={LABEL} htmlFor="password">
              {copy.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={12}
              required
              className={FIELD}
            />
            <p className="text-faint mt-1 text-xs">{copy.passwordHint}</p>
          </div>
        </div>
      </fieldset>

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
        className="bg-action text-on-action hover:bg-action-hover duration-fast h-10 self-start rounded-md px-5 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {copy.createPartner}
      </button>
    </form>
  );
}
