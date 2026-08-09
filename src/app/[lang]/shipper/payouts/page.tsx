import { notFound } from "next/navigation";
import { PayoutProvider, Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { getPayoutBalance } from "@/lib/payouts/balance";
import { PayoutBalanceView } from "@/components/payouts/balance-view";
import { pingpongIsConfigured } from "@/lib/payments/pingpong/config";
import { PayoutOnboardingButton } from "@/components/payouts/onboarding-button";

/**
 * A shipper's money.
 *
 * Freight never passes through escrow: the buyer pays the freight invoice and
 * we settle the carrier. So unlike a factory, nothing here is gated on
 * delivery confirmation — a pending row means we owe them and something is in
 * the way, usually payout setup.
 */
export default async function ShipperPayoutsPage({
  params,
}: PageProps<"/[lang]/shipper/payouts">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.SHIPPER);
  const dict = await getDictionary(lang);
  const balance = await getPayoutBalance();
  if (!balance) notFound();

  const copy = dict.payouts as unknown as Record<string, string>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-headline text-2xl font-bold tracking-tight">
          {copy.balanceTitle}
        </h1>
        <p className="text-muted mt-1 text-sm">{copy.balanceDescription}</p>
      </header>

      <PayoutBalanceView
        balance={balance}
        lang={lang}
        copy={copy}
        onboardingSlot={
          pingpongIsConfigured() && !balance.payoutAccountReady ? (
            <PayoutOnboardingButton
              provider={PayoutProvider.PINGPONG}
              label={dict.factory.payouts.startOnboarding}
            />
          ) : null
        }
      />
    </div>
  );
}
