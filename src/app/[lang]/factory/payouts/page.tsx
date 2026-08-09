import { notFound } from "next/navigation";
import { PayoutAccountStatus, PayoutStatus, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  BankIcon,
} from "@hugeicons/core-free-icons";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import { ConnectOnboardingButton } from "./_components/onboarding-button";
import { pingpongIsConfigured } from "@/lib/payments/pingpong/config";
import { getPayoutBalance } from "@/lib/payouts/balance";
import { PayoutBalanceView } from "@/components/payouts/balance-view";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/payouts">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.payouts.title };
}

export default async function FactoryPayoutsPage({
  params,
}: PageProps<"/[lang]/factory/payouts">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  /**
   * Payout setup now lives entirely on the Organization: which rail, which
   * account, what the rail last told us about it. The previous version made a
   * live Stripe call on render and fell back to a fake "not connected" object
   * when the key was missing — the page is faster and more honest reading our
   * own record, and the rail's view of the account arrives by webhook anyway.
   */
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      payoutProvider: true,
      payoutAccountId: true,
      payoutStatus: true,
    },
  });
  const railReady = pingpongIsConfigured();
  // Same three figures every earning role sees. The bespoke history list
  // below predates it; this replaces the guesswork of reading status pills.
  const balance = await getPayoutBalance();

  const payouts = await prisma.payout.findMany({
    where: { factoryOrgId: user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reference: true,
      amountCents: true,
      // Renamed (CTO audit F3) — see Payout schema doc.
      supplierFeeCents: true,
      status: true,
      method: true,
      sentAt: true,
      scheduledAt: true,
      createdAt: true,
      failureReason: true,
      escrow: {
        select: {
          order: {
            select: { reference: true, request: { select: { title: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.factory.payouts.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.factory.payouts.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.factory.payouts.description}
        </p>
      </header>

      {balance && (
        <div className="mb-6">
          <PayoutBalanceView
            balance={balance}
            lang={lang}
            copy={dict.payouts as unknown as Record<string, string>}
          />
        </div>
      )}

      <PayoutAccountCard
        accountId={org?.payoutAccountId ?? null}
        status={org?.payoutStatus ?? null}
        railReady={railReady}
        dict={dict}
      />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
          {dict.factory.payouts.historyTitle}
        </h2>
        {payouts.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">
              {dict.factory.payouts.historyEmpty}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="rounded-md border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {p.reference}
                      {p.escrow?.order && (
                        <> · {p.escrow.order.reference}</>
                      )}
                    </p>
                    <p className="text-sm font-medium text-fg mt-0.5">
                      {p.escrow?.order?.request.title ?? "—"}
                    </p>
                    {p.failureReason && p.status === PayoutStatus.PENDING && (
                      <p className="text-xs text-warning mt-1">
                        {p.failureReason === "factory_connect_not_set_up"
                          ? dict.factory.payouts.failurePendingOnboarding
                          : p.failureReason}
                      </p>
                    )}
                  </div>
                  <div className="text-end flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-headline">
                      {formatEUR(p.amountCents / 100, lang)}
                    </span>
                    <PayoutStatusPill status={p.status} dict={dict} />
                    <span className="text-[11px] text-faint">
                      {p.sentAt
                        ? `${dict.factory.payouts.sentOn} ${formatDate(p.sentAt, lang, "short")}`
                        : `${dict.factory.payouts.createdOn} ${formatDate(p.createdAt, lang, "short")}`}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Payout account state, from our own record rather than a live API call.
 *
 * Three cases the factory actually cares about, and they need different
 * answers: the rail isn't switched on yet (nothing they can do), they haven't
 * onboarded (a button), or they're set up (a confirmation). Collapsing those
 * into one "not connected" state is what made the old card unhelpful.
 */
function PayoutAccountCard({
  accountId,
  status,
  railReady,
  dict,
}: {
  accountId: string | null;
  status: PayoutAccountStatus | null;
  railReady: boolean;
  dict: Dictionary;
}) {
  const active = status === PayoutAccountStatus.ACTIVE && Boolean(accountId);

  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            active
              ? "bg-success-soft text-success"
              : "bg-subtle text-muted",
          )}
        >
          <HugeiconsIcon
            icon={active ? CheckmarkCircle02Icon : BankIcon}
            size={20}
            strokeWidth={1.5}
          />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-headline">
            {dict.factory.payouts.accountTitle}
          </h2>

          {!railReady ? (
            // Not the factory's problem to solve — say so rather than showing
            // a button that would fail.
            <p className="mt-1 text-sm text-muted">
              {dict.factory.payouts.railNotReady}
            </p>
          ) : active ? (
            <>
              <p className="mt-1 text-sm text-muted">
                {dict.factory.payouts.accountActive}
              </p>
              <p className="mt-2 font-mono text-xs text-faint">{accountId}</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                {status === PayoutAccountStatus.RESTRICTED
                  ? dict.factory.payouts.accountRestricted
                  : status === PayoutAccountStatus.REJECTED
                    ? dict.factory.payouts.accountRejected
                    : dict.factory.payouts.accountMissing}
              </p>
              <div className="mt-3">
                <ConnectOnboardingButton
                  label={dict.factory.payouts.startOnboarding}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PayoutStatusPill({
  status,
  dict,
}: {
  status: PayoutStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const map: Record<PayoutStatus, { label: string; classes: string }> = {
    PENDING: {
      label: dict.factory.payouts.statusPending,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    SCHEDULED: {
      label: dict.factory.payouts.statusScheduled,
      classes: "bg-info-soft text-info border-info-edge",
    },
    SENT: {
      label: dict.factory.payouts.statusSent,
      classes: "bg-success-soft text-success border-success-edge",
    },
    RECEIVED: {
      label: dict.factory.payouts.statusReceived,
      classes: "bg-success-soft text-success border-success-edge",
    },
    FAILED: {
      label: dict.factory.payouts.statusFailed,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
  };
  const conf = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        conf.classes,
      )}
    >
      {conf.label}
    </span>
  );
}
