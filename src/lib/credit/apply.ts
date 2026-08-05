/**
 * Pure credit-application math — no I/O, no `server-only`, so it's
 * unit-testable. Decides how much platform credit to apply to a charge.
 */

/**
 * Smallest amount worth charging a buyer after credit is applied.
 *
 * Was Stripe's 50-cent card floor. It survives the rail change because the
 * underlying reason does: collecting a few cents by bank transfer costs more
 * in fees and reconciliation effort than the money is worth. Re-tune when
 * PingPong's actual per-transaction cost is known.
 */
export const MIN_CHARGE_CENTS = 50;

/**
 * Rules:
 *   - Never apply more than the balance or the charge.
 *   - If the balance covers the whole charge, apply the whole charge
 *     (remainder 0 → credit-only, no processor call).
 *   - If applying credit would leave a remainder the processor can't
 *     charge (0 < remainder < min), apply nothing — the buyer keeps the
 *     credit for a bigger charge rather than stranding an un-chargeable
 *     remainder.
 */
export function computeCreditApplication(input: {
  chargeCents: number;
  balanceCents: number;
  minChargeCents?: number;
}): { appliedCents: number; remainderCents: number } {
  const min = input.minChargeCents ?? MIN_CHARGE_CENTS;
  const balance = Math.max(0, input.balanceCents);
  const charge = Math.max(0, input.chargeCents);

  if (balance >= charge) {
    return { appliedCents: charge, remainderCents: 0 };
  }
  const applied = balance;
  const remainder = charge - applied;
  if (applied > 0 && remainder > 0 && remainder < min) {
    return { appliedCents: 0, remainderCents: charge };
  }
  return { appliedCents: applied, remainderCents: remainder };
}
