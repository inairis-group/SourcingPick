import { notFound } from "next/navigation";
import { PayoutStatus, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  BankIcon,
} from "@hugeicons/core-free-icons";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { fetchConnectStatus } from "@/lib/stripe/connect";
import { cn } from "@/lib/utils";
import { ConnectOnboardingButton } from "./_components/onboarding-button";
import { WiseRecipientCard } from "./_components/wise-recipient-card";
import { wiseIsConfigured } from "@/lib/wise/client";

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

  // Stripe call is wrapped — if STRIPE_SECRET_KEY isn't set yet we degrade
  // to a "not connected" state so the page still renders in dev.
  let status: Awaited<ReturnType<typeof fetchConnectStatus>> = {
    exists: false,
    payoutsEnabled: false,
    chargesEnabled: false,
    requirementsDue: [],
    accountId: null,
  };
  let stripeReachable = true;
  try {
    status = await fetchConnectStatus(user.organizationId);
  } catch {
    stripeReachable = false;
  }

  // Wise recipient state — the Wise card sits ABOVE Stripe during the
  // migration window. Once Stripe is retired this becomes the only payout
  // setup surface on the page.
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { wiseRecipientId: true },
  });

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

      <WiseRecipientCard
        wiseRecipientId={org?.wiseRecipientId ?? null}
        dict={dict}
      />

      {/* Stripe Connect surface only renders as a fallback when Wise isn't
          configured yet (transitional). Once the Wise env vars are set the
          card is hidden — Stripe is the retired rail. The lib files stay
          for rollback safety; the user-facing path is Wise-only. */}
      {!wiseIsConfigured() && (
        <ConnectStatusCard
          status={status}
          stripeReachable={stripeReachable}
          dict={dict}
        />
      )}

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

function ConnectStatusCard({
  status,
  stripeReachable,
  dict,
}: {
  status: Awaited<ReturnType<typeof fetchConnectStatus>>;
  stripeReachable: boolean;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  if (!stripeReachable) {
    return (
      <div className="rounded-lg border border-warning-edge bg-warning-soft/40 p-5 flex items-start gap-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={20}
          strokeWidth={1.5}
          className="text-warning shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm font-semibold text-headline">
            {dict.factory.payouts.unreachableTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.factory.payouts.unreachableBody}
          </p>
        </div>
      </div>
    );
  }

  if (status.payoutsEnabled) {
    return (
      <div className="rounded-lg border border-success-edge bg-success-soft/40 p-5 flex items-start gap-3">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={20}
          strokeWidth={1.5}
          className="text-success shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-headline">
            {dict.factory.payouts.readyTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.factory.payouts.readyBody}
          </p>
        </div>
        <ConnectOnboardingButton
          label={dict.factory.payouts.manageAccountCta}
          variant="ghost"
        />
      </div>
    );
  }

  if (status.exists) {
    return (
      <div className="rounded-lg border border-warning-edge bg-warning-soft/40 p-5 flex items-start gap-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={20}
          strokeWidth={1.5}
          className="text-warning shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-headline">
            {dict.factory.payouts.pendingTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.factory.payouts.pendingBody}
          </p>
          {status.requirementsDue.length > 0 && (
            <ul className="mt-2 text-[11px] text-muted list-disc ps-4">
              {status.requirementsDue.slice(0, 5).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
        <ConnectOnboardingButton
          label={dict.factory.payouts.resumeOnboardingCta}
          variant="primary"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface p-5 flex items-start gap-3",
      )}
    >
      <HugeiconsIcon
        icon={BankIcon}
        size={20}
        strokeWidth={1.5}
        className="text-brand-700 shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-headline">
          {dict.factory.payouts.startTitle}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {dict.factory.payouts.startBody}
        </p>
      </div>
      <ConnectOnboardingButton
        label={dict.factory.payouts.startOnboardingCta}
        variant="primary"
      />
    </div>
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
