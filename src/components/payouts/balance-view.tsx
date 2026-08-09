import { PayoutStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import type { PayoutBalance } from "@/lib/payouts/balance";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * "Where is my money?" — shared by factories, agents and shippers.
 *
 * Three figures, because three is what someone actually wants to know: what
 * has gone out, what is owed, and what went wrong. Wording is deliberately
 * "sent", never "received": we know what we dispatched to the rail, not what
 * has cleared the receiving bank, and a balance that implies cleared funds
 * would be a promise we can't keep.
 */
export function PayoutBalanceView({
  balance,
  lang,
  copy,
  onboardingSlot,
}: {
  balance: PayoutBalance;
  lang: Locale;
  copy: Record<string, string>;
  /// The role's own payout-setup control, rendered when something is blocked.
  onboardingSlot?: React.ReactNode;
}) {
  const tiles = [
    { label: copy.balanceSent, cents: balance.sentCents, tone: "success" as const },
    { label: copy.balancePending, cents: balance.pendingCents, tone: "warn" as const },
    { label: copy.balanceFailed, cents: balance.failedCents, tone: "danger" as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      {balance.blockedReason && (
        <div className="border-warning-edge bg-warning-soft flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
          <HugeiconsIcon
            icon={Alert01Icon}
            size={18}
            strokeWidth={1.5}
            className="text-warning shrink-0"
          />
          <p className="text-warning min-w-0 flex-1 text-sm">
            {copy[`balanceBlocked_${balance.blockedReason}`] ??
              copy.balanceBlocked_generic}
          </p>
          {onboardingSlot}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="border-line bg-surface rounded-lg border p-4"
          >
            <p className="text-faint text-xs font-medium">{t.label}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums",
                t.cents === 0 ? "text-muted" : "text-headline",
                t.tone === "danger" && t.cents > 0 && "text-danger",
              )}
            >
              {formatEUR(t.cents / 100, lang)}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
          {copy.balanceHistory}
        </h2>
        {balance.recent.length === 0 ? (
          <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
            {copy.balanceEmpty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {balance.recent.map((p) => (
              <li
                key={p.id}
                className="border-line bg-surface flex flex-wrap items-start justify-between gap-3 rounded-md border p-4"
              >
                <div className="min-w-0">
                  <p className="text-faint font-mono text-xs uppercase">
                    {p.reference}
                    {(p.orderReference ?? p.shipmentReference) && (
                      <> · {p.orderReference ?? p.shipmentReference}</>
                    )}
                  </p>
                  <p className="text-fg mt-0.5 text-sm font-medium">
                    {copy[`payoutKind_${p.kind}`] ?? p.kind}
                  </p>
                  {p.failureReason && p.status !== PayoutStatus.SENT && (
                    <p className="text-warning mt-1 text-xs">
                      {copy[`payoutFail_${p.failureReason}`] ?? p.failureReason}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-end">
                  <span className="text-headline text-sm font-semibold tabular-nums">
                    {formatEUR(p.amountCents / 100, lang)}
                  </span>
                  {p.supplierFeeCents > 0 && (
                    <span className="text-faint text-[11px] tabular-nums">
                      {copy.balanceFee} {formatEUR(p.supplierFeeCents / 100, lang)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium",
                      p.status === PayoutStatus.SENT &&
                        "border-success-edge bg-success-soft text-success",
                      p.status === PayoutStatus.PENDING &&
                        "border-warning-edge bg-warning-soft text-warning",
                      p.status === PayoutStatus.FAILED &&
                        "border-danger-edge bg-danger-soft text-danger",
                    )}
                  >
                    {copy[`payoutStatus_${p.status}`] ?? p.status}
                  </span>
                  <span className="text-faint text-[11px]">
                    {p.sentAt
                      ? `${copy.balanceSentOn} ${formatDate(p.sentAt, lang, "short")}`
                      : `${copy.balanceRecordedOn} ${formatDate(p.createdAt, lang, "short")}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
