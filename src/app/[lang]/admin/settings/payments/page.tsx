import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import type { PayoutProvider } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listProviderStatuses } from "@/lib/payouts/dispatch";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/settings/payments">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.payments.title };
}

const PROVIDER_LABELS: Record<PayoutProvider, string> = {
  STRIPE_CONNECT: "Stripe Connect",
  LIANLIAN: "LianLian Global",
  ALIPAY: "Alipay",
  WISE: "Wise Business",
};

const PROVIDER_DESCRIPTIONS: Record<PayoutProvider, string> = {
  STRIPE_CONNECT:
    "Default payout rail for EU / UK / US / SG / HK / UAE / MX / NG / KE / ZA factories. Hosted onboarding, instant payouts in most regions.",
  LIANLIAN:
    "Cross-border payouts to mainland China and SE Asia (Vietnam, Indonesia, Thailand, Philippines). Lower fees than Stripe for CN-bound transfers.",
  ALIPAY:
    "Alipay Cross-border (Ant International) — for Chinese factories who prefer Alipay over LianLian's bank-account flow. Same target market as LianLian.",
  WISE:
    "Wise Business — single rail covering 80+ countries including all current supplier corridors. Sole live provider going forward; Stripe / Alipay / LianLian above will be retired once the Wise migration completes.",
};

/**
 * Admin payment-providers dashboard. Shows live config status for each
 * payout provider so the operator can see what's enabled without
 * SSHing into the server. Credentials themselves stay in env — this
 * page only reports presence + a cheap health-check probe.
 */
export default async function AdminPaymentsPage({
  params,
}: PageProps<"/[lang]/admin/settings/payments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  // Pass 3b made WISE the live rail. The other three providers are
  // intentionally retired but their adapters still register in the
  // dispatcher (the schema enums + lib files stay until a final cleanup
  // pass for rollback safety). Sort them after Wise and dim them so the
  // operator sees at a glance which one is "the" rail.
  const allStatuses = await listProviderStatuses();
  const RETIRED: ReadonlyArray<typeof allStatuses[number]["provider"]> = [
    "STRIPE_CONNECT",
    "LIANLIAN",
    "ALIPAY",
  ];
  const statuses = [
    ...allStatuses.filter((s) => !RETIRED.includes(s.provider)),
    ...allStatuses.filter((s) => RETIRED.includes(s.provider)),
  ];
  const isRetired = (p: (typeof allStatuses)[number]["provider"]) =>
    RETIRED.includes(p);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.payments.eyebrow}
        title={dict.admin.payments.title}
        description={dict.admin.payments.description}
      />

      <div className="mt-6 rounded-md border border-info-edge bg-info-soft/30 p-4 text-sm text-info flex items-start gap-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={16}
          strokeWidth={1.5}
          className="shrink-0 mt-0.5"
        />
        <div className="leading-snug">
          <p className="font-medium">{dict.admin.payments.secretsNoticeTitle}</p>
          <p className="text-info/85 mt-0.5">
            {dict.admin.payments.secretsNoticeBody}
          </p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {statuses.map((s) => {
          const greenDot = s.configured && s.reachable;
          const yellowDot = s.configured && !s.reachable;
          return (
            <li
              key={s.provider}
              className={cn(
                "rounded-lg border border-line bg-surface p-5",
                isRetired(s.provider) && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      aria-hidden
                      className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        greenDot && "bg-success",
                        yellowDot && "bg-warning",
                        !s.configured && "bg-danger",
                      )}
                    />
                    <h3 className="text-sm font-semibold text-headline">
                      {PROVIDER_LABELS[s.provider]}
                    </h3>
                    <StatusPill
                      configured={s.configured}
                      reachable={s.reachable}
                      labels={dict.admin.payments.statuses}
                    />
                    {isRetired(s.provider) && (
                      <span className="inline-flex items-center h-5 px-2 rounded-full border border-line text-[10px] font-medium uppercase tracking-wide text-muted">
                        {dict.admin.payments.retiredBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1.5 leading-snug max-w-prose">
                    {PROVIDER_DESCRIPTIONS[s.provider]}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {s.requiredEnvVars.map((name) => (
                  <EnvRow
                    key={name}
                    name={name}
                    present={Boolean(process.env[name])}
                  />
                ))}
              </div>

              {s.message && !s.reachable && (
                <p className="mt-3 text-xs text-warning leading-snug">
                  {s.message}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusPill({
  configured,
  reachable,
  labels,
}: {
  configured: boolean;
  reachable: boolean;
  labels: {
    active: string;
    configured: string;
    missing: string;
  };
}) {
  const tone =
    configured && reachable
      ? "bg-success-soft text-success border-success-edge"
      : configured
        ? "bg-warning-soft text-warning border-warning-edge"
        : "bg-danger-soft text-danger border-danger-edge";
  const label =
    configured && reachable
      ? labels.active
      : configured
        ? labels.configured
        : labels.missing;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function EnvRow({ name, present }: { name: string; present: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-sm bg-subtle px-2 py-1.5">
      <HugeiconsIcon
        icon={present ? CheckmarkCircle02Icon : Cancel01Icon}
        size={12}
        strokeWidth={1.75}
        className={present ? "text-success" : "text-faint"}
      />
      <code className="text-[11px] font-mono text-fg truncate">{name}</code>
    </div>
  );
}
