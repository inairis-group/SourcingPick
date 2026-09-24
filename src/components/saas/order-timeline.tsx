import { cn } from "@/lib/utils";
import {
  ORDER_STATES,
  STATE_TONE,
  type OrderStage,
  type OrderState,
} from "@/lib/orders/lifecycle";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * The ladder the canvas draws down the side of an order.
 *
 * It shows all ten states always, not only the ones reached — which is the
 * design decision worth keeping. A timeline of three entries tells you what
 * has happened; a ladder of ten tells you what is left, and "what is left" is
 * the question a client opening this page actually has.
 *
 * Three appearances, all read off `SaaS-Client-Commande`:
 *
 *   reached   filled 30px disc in the state's colour, white tick,
 *             solid 2px connector in the same colour
 *   current   filled disc, a 9px white centre instead of a tick,
 *             dashed #CBD5E8 connector from here down
 *   future    white disc with a 2px #CBD5E8 ring, muted label
 *
 * The sub-state under each label is what makes it worth reading: "In transit"
 * is a category, "At sea" is an answer. Which sub-states appear here is
 * decided before this component sees them — `orderTimeline(id, forClient)`
 * filters the internal ones out in the query, so a client's ladder cannot
 * accidentally show one.
 */
export type TimelineStep = {
  state: OrderState;
  stage: OrderStage | null;
  at: Date | null;
  comment?: string | null;
};

const TONE_HEX: Record<string, string> = {
  new: "#155DFC",
  quote: "#7C5CFF",
  waiting: "#D99A00",
  done: "#0E9F6E",
  moving: "#0B7FA8",
  closed: "#0E1A3D",
  failed: "#E02424",
  idle: "#4A5578",
};

export function OrderTimeline({
  steps,
  dict,
  formatDay,
}: {
  /** One per state that has been reached, oldest first. */
  steps: readonly TimelineStep[];
  dict: Dictionary;
  /** The canvas prints 12/08 — day and month, no year. */
  formatDay: (d: Date) => string;
}) {
  const reached = new Map(steps.map((s) => [s.state, s]));
  // Cancellation is not a rung on the ladder: an order that was cancelled
  // did not pass through shipping on the way. When it has happened, the
  // ladder stops and says so.
  const cancelled = reached.get("CANCELLED");
  const rungs = cancelled
    ? [...ORDER_STATES.filter((s) => s !== "CANCELLED" && reached.has(s)), "CANCELLED" as OrderState]
    : ORDER_STATES.filter((s) => s !== "CANCELLED");

  const lastReached = rungs.filter((s) => reached.has(s)).at(-1);

  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {rungs.map((state, i) => {
        const step = reached.get(state);
        const isCurrent = state === lastReached;
        const isDone = Boolean(step) && !isCurrent;
        const colour = TONE_HEX[STATE_TONE[state]] ?? TONE_HEX.idle;
        const last = i === rungs.length - 1;

        return (
          <li key={state} className="flex items-stretch gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full border-2"
                style={
                  step
                    ? { background: colour, borderColor: colour }
                    : { background: "#FFFFFF", borderColor: "#CBD5E8" }
                }
                aria-hidden="true"
              >
                {isDone && (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {isCurrent && <span className="size-[9px] rounded-full bg-white" />}
              </span>
              {!last && (
                <span
                  aria-hidden="true"
                  className="my-1 min-h-5.5 w-0 flex-1"
                  style={{
                    borderInlineStartWidth: 2,
                    borderInlineStartStyle: isDone ? "solid" : "dashed",
                    borderInlineStartColor: isDone ? colour : "#CBD5E8",
                  }}
                />
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-[3px] pb-4.5">
              <span
                className={cn("text-md font-semibold", step ? "text-fg" : "text-muted")}
              >
                {dict.lifecycle.state[state]}
              </span>
              {step?.stage && (
                <span className="text-muted text-[13.5px]">
                  {dict.lifecycle.stage[step.stage]}
                </span>
              )}
              <span className="text-muted font-mono text-xs">
                {step?.at ? formatDay(step.at) : "—"}
              </span>
              {step?.comment && (
                <span className="text-fg bg-info-tint mt-1 rounded-callout px-3 py-2 text-[13.5px] leading-snug">
                  {step.comment}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Collapse a list of events into one rung per state.
 *
 * An order passes through several sub-states inside one state — received,
 * qualified, information missing — and the ladder shows a state once. The
 * *latest* event wins, because the ladder is answering "where is this now",
 * not "everything that ever happened".
 */
export function toTimelineSteps(
  events: readonly { state: OrderState; stage: OrderStage | null; createdAt: Date; comment: string | null }[],
): TimelineStep[] {
  const byState = new Map<OrderState, TimelineStep>();
  for (const e of events) {
    byState.set(e.state, {
      state: e.state,
      stage: e.stage,
      // The date shown is when the state was *entered*, so the first event
      // for a state keeps its timestamp even as later sub-states arrive.
      at: byState.get(e.state)?.at ?? e.createdAt,
      comment: e.comment,
    });
  }
  return [...byState.values()];
}
