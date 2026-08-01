"use client";

import { useActionState } from "react";
import type { ShipmentStatus } from "@prisma/client";
import { submitShipmentQuote, updateShipmentStatus } from "@/lib/shipments/actions";

/**
 * The shipper's two write surfaces: submit/revise a quote (§3) and move the
 * status (§4).
 *
 * Client components because both actions return a validation result, and a
 * plain `<form action={fn}>` requires the action to return void — which would
 * mean silently discarding "you must justify this price change" and leaving
 * the shipper staring at an unchanged form. `useActionState` keeps the result
 * and renders it.
 *
 * Copy is passed down rather than read here so the whole surface stays on the
 * server dictionary and this file holds no strings of its own.
 */

type Copy = Record<string, string>;

/** Error keys the actions can return, mapped to the dictionary. */
function errorMessage(error: string | undefined, copy: Copy): string | null {
  if (!error) return null;
  return copy[`err_${error}`] ?? copy.err_generic ?? error;
}

const FIELD = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";
const LABEL = "text-faint mb-1 block text-xs font-medium";

export function QuoteForm({
  shipmentId,
  isRevision,
  copy,
}: {
  shipmentId: string;
  isRevision: boolean;
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(submitShipmentQuote, null);
  const error = errorMessage(state && !state.ok ? state.error : undefined, copy);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="amount">
            {copy.amount}
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="currency">
            {copy.currency}
          </label>
          <select id="currency" name="currency" defaultValue="CNY" className={FIELD}>
            <option value="CNY">CNY</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          {/* §3.1 — a fixed price is meaningless without its validity window. */}
          <label className={LABEL} htmlFor="validUntil">
            {copy.validUntil}
          </label>
          <input id="validUntil" name="validUntil" type="date" required className={FIELD} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="conditions">
          {copy.conditions}
        </label>
        <textarea id="conditions" name="conditions" rows={2} required className={FIELD} />
      </div>

      <div>
        <label className={LABEL} htmlFor="notes">
          {copy.notes}
        </label>
        <textarea id="notes" name="notes" rows={2} className={FIELD} />
      </div>

      {/* §3.2 — only meaningful once a first quote exists; the action requires
          it in that case, so the field is only rendered then. */}
      {isRevision && (
        <div>
          <label className={LABEL} htmlFor="revisionReason">
            {copy.revisionReason}
          </label>
          <textarea id="revisionReason" name="revisionReason" rows={2} required className={FIELD} />
        </div>
      )}

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
        {copy.submitQuote}
      </button>
    </form>
  );
}

export function StatusForm({
  shipmentId,
  current,
  statuses,
  labels,
  copy,
}: {
  shipmentId: string;
  current: ShipmentStatus;
  statuses: ShipmentStatus[];
  labels: Record<string, string>;
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(updateShipmentStatus, null);
  const error = errorMessage(state && !state.ok ? state.error : undefined, copy);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="status">
            {copy.colStatus}
          </label>
          <select id="status" name="status" defaultValue={current} className={FIELD}>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {labels[st]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="note">
            {copy.statusNote}
          </label>
          <input id="note" name="note" type="text" className={FIELD} />
        </div>
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
        {copy.updateStatus}
      </button>
    </form>
  );
}
