"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useDictionary } from "@/lib/i18n/client-provider";
import {
  STAGES,
  statusFormStages,
  type OrderStage,
  type OrderState,
} from "@/lib/orders/lifecycle";
import {
  updateOrderStatusAction,
  type UpdateStatusState,
} from "@/lib/orders/status-actions";

const INITIAL: UpdateStatusState = {};

/**
 * "Mettre à jour l'état", as `SaaS-Admin-Statut` and `SaaS-Agent-Statut` draw
 * it: the fifteen sub-states as one list of radio rows, each under the caption
 * of the state it belongs to, the internal ones saying so; then the comment
 * for the client, "Publier au client" and "Annuler".
 *
 * "Annuler" abandons the edit — it resets the form. Cancelling an order is not
 * done from here.
 */
export function OrderStatusForm({
  orderId,
  currentStage,
  currentState,
}: {
  orderId: string;
  currentStage: OrderStage | null;
  currentState: OrderState | null;
}) {
  const dict = useDictionary();
  const t = dict.orders.statusForm;
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, INITIAL);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="orderId" value={orderId} />

      {state.error && <FormError>{t.errors[state.error]}</FormError>}
      {state.saved && (
        <div
          role="status"
          className="border-success-edge bg-success-soft text-success rounded-md border px-3 py-2 text-sm"
        >
          {t.saved}
        </div>
      )}

      <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
        <legend className="sr-only">{t.title}</legend>
        <ul className="m-0 flex list-none flex-col p-0">
          {statusFormStages().map((stage) => {
            const spec = STAGES[stage];
            return (
              <li key={stage} className="border-line border-b last:border-b-0">
                <label className="flex min-h-11 cursor-pointer items-start gap-3 py-3">
                  <input
                    type="radio"
                    name="stage"
                    value={stage}
                    defaultChecked={stage === currentStage}
                    required
                    className="accent-action mt-1 size-4 shrink-0"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-fg text-base font-semibold">
                      {dict.lifecycle.stage[stage]}
                    </span>
                    <span className="text-muted text-[13.5px]">
                      {dict.lifecycle.state[spec.state]}
                      {!spec.clientVisible && <> · {t.internal}</>}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p className="text-muted m-0 text-[13.5px]">{t.rule}</p>

      <div className="flex flex-col gap-[7px]">
        <label htmlFor={`status-comment-${orderId}`} className="text-fg text-base font-semibold">
          {t.commentLabel}
        </label>
        <textarea
          id={`status-comment-${orderId}`}
          name="comment"
          rows={3}
          maxLength={2000}
          className="border-line-strong bg-surface text-fg placeholder:text-faint focus-visible:outline-focus w-full rounded-xl border-[1.5px] px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || currentState === "COMPLETED"}>
          {t.publish}
        </Button>
        <Button type="button" variant="secondary" onClick={() => formRef.current?.reset()}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
