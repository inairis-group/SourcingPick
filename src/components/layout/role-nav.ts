import {
  ChartLineData01Icon,
  ComputerIcon,
  DashboardSquare01Icon,
  InvoiceIcon,
  Mail01Icon,
  Message01Icon,
  PackageIcon,
  SecurityCheckIcon,
  Settings01Icon,
  ShoppingBag01Icon,
  ShoppingBag03Icon,
  StarIcon,
  Store01Icon,
  TaskDone01Icon,
  UserGroup02Icon,
  UserMultiple02Icon,
  UserRemove01Icon,
  Wallet01Icon,
  Building01Icon,
  BookOpen01Icon,
  CloudIcon,
  AlertCircleIcon,
  GlobalIcon,
  ScrollIcon,
} from "@hugeicons/core-free-icons";
import type { Role } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export type NavItem = {
  href: string;
  label: string;
  // Same icon type the HugeiconsIcon component expects.
  icon: typeof DashboardSquare01Icon;
  /** Primary items show in the bottom pill. Secondary items live in the hamburger overlay only. */
  primary?: boolean;
  /**
   * Optional tour id — used by the first-order tutorial coachmark
   * (FirstOrderTutorial) to spotlight this item. Rendered as
   * `data-tour="..."` on the nav link.
   */
  tourId?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Per-role navigation: primary items surface in the bottom pill (≤5 picks),
 * secondary items only show in the hamburger overlay. Settings + Logout are
 * always reachable from the top bar so we leave them out of the pill.
 */
export function navForRole(role: Role, lang: string, dict: Dictionary): NavGroup[] {
  const base = `/${lang}`;
  switch (role) {
    case "CLIENT":
      return [
        {
          label: dict.nav.dashboard,
          items: [
            {
              href: `${base}/client/dashboard`,
              label: dict.nav.dashboard,
              icon: DashboardSquare01Icon,
              primary: true,
            },
            {
              href: `${base}/client/requests`,
              label: dict.nav.requests,
              icon: ShoppingBag01Icon,
              primary: true,
            },
            {
              href: `${base}/client/orders`,
              label: dict.nav.orders,
              icon: PackageIcon,
              primary: true,
            },
            {
              href: `${base}/client/marketplace`,
              label: dict.nav.marketplace,
              icon: Store01Icon,
              // Pricing-v3 Phase 2: marketplace de-emphasised — removed
              // from the primary bottom-pill, lives in the hamburger
              // overlay only until the catalogue is mature.
              tourId: "marketplace",
            },
            {
              href: `${base}/client/auctions`,
              label: dict.nav.auctions,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/messages`,
              label: dict.nav.messages,
              icon: Message01Icon,
            },
            // Partner #9: certifications surface removed from the
            // buyer journey — the concept wasn't landing. Factory +
            // admin still manage certs internally; buyers don't see
            // them in the menu or on product pages.
            {
              href: `${base}/client/quotes`,
              label: dict.client.quotesAggregated.title,
              icon: InvoiceIcon,
            },
            {
              href: `${base}/client/invoices`,
              label: dict.nav.invoices,
              icon: InvoiceIcon,
              tourId: "invoices",
            },
            {
              href: `${base}/client/analytics`,
              label: dict.client.analytics.title,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/client/settings`,
              label: dict.nav.settings,
              icon: Settings01Icon,
            },
          ],
        },
      ];
    case "FACTORY":
      return [
        {
          label: dict.nav.dashboard,
          items: [
            {
              href: `${base}/factory/dashboard`,
              label: dict.nav.dashboard,
              icon: DashboardSquare01Icon,
              primary: true,
            },
            {
              href: `${base}/factory/tenders`,
              label: dict.nav.tenders,
              icon: Mail01Icon,
              primary: true,
            },
            {
              href: `${base}/factory/orders`,
              label: dict.nav.orders,
              icon: PackageIcon,
              primary: true,
            },
            {
              href: `${base}/factory/catalogue`,
              label: dict.nav.catalogue,
              icon: ShoppingBag03Icon,
              primary: true,
            },
            {
              href: `${base}/factory/auctions`,
              label: dict.nav.auctions,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/messages`,
              label: dict.nav.messages,
              icon: Message01Icon,
            },
            {
              href: `${base}/factory/payouts`,
              label: dict.nav.payouts,
              icon: Wallet01Icon,
            },
            {
              href: `${base}/factory/certification`,
              label: dict.nav.certification,
              icon: SecurityCheckIcon,
            },
            {
              href: `${base}/factory/analytics`,
              label: dict.factory.analytics.title,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/factory/settings`,
              label: dict.nav.settings,
              icon: Settings01Icon,
            },
          ],
        },
      ];
    case "AGENT":
      return [
        {
          label: dict.nav.dashboard,
          items: [
            {
              href: `${base}/agent/dashboard`,
              label: dict.nav.dashboard,
              icon: DashboardSquare01Icon,
              primary: true,
            },
            {
              href: `${base}/agent/requests`,
              label: dict.nav.requests,
              icon: ShoppingBag01Icon,
              primary: true,
            },
            {
              href: `${base}/agent/factories`,
              label: dict.agent.factories.title,
              icon: Building01Icon,
              primary: true,
            },
            {
              href: `${base}/agent/quotes`,
              label: dict.agent.quotesAggregated.title,
              icon: InvoiceIcon,
            },
            {
              href: `${base}/agent/orders`,
              label: dict.nav.orders,
              icon: PackageIcon,
            },
            {
              href: `${base}/agent/invoices`,
              label: dict.nav.invoices,
              icon: InvoiceIcon,
            },
            {
              href: `${base}/agent/profile`,
              label: dict.agent.profile.title,
              icon: UserGroup02Icon,
            },
            {
              href: `${base}/agent/tasks`,
              label: dict.nav.tasks,
              icon: TaskDone01Icon,
              primary: true,
            },
            {
              href: `${base}/messages`,
              label: dict.nav.messages,
              icon: Message01Icon,
            },
            {
              href: `${base}/agent/analytics`,
              label: dict.agent.analytics.title,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/agent/settings`,
              label: dict.nav.settings,
              icon: Settings01Icon,
            },
          ],
        },
      ];
    case "ADMIN":
      return [
        {
          label: dict.admin.dashboard.title,
          items: [
            {
              href: `${base}/admin`,
              label: dict.nav.dashboard,
              icon: DashboardSquare01Icon,
              primary: true,
            },
            {
              href: `${base}/admin/requests`,
              label: dict.nav.requests,
              icon: ShoppingBag01Icon,
              primary: true,
            },
            {
              href: `${base}/admin/kyc`,
              label: dict.admin.kyc.title,
              icon: AlertCircleIcon,
              primary: true,
            },
            {
              href: `${base}/admin/marketplace`,
              label: dict.admin.marketplace.title,
              icon: Store01Icon,
              primary: true,
            },
            {
              // The moderation queue is a daily job, not a settings page —
              // it needs a nav entry or reviews sit pending unseen.
              href: `${base}/admin/marketplace/reviews`,
              label: dict.publicMarketplace.moderationTitle,
              icon: StarIcon,
            },
            {
              href: `${base}/admin/auctions`,
              label: dict.admin.auctions.title,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/messages`,
              label: dict.nav.messages,
              icon: Message01Icon,
            },
            {
              href: `${base}/admin/certifications`,
              label: dict.admin.certifications.title,
              icon: SecurityCheckIcon,
            },
          ],
        },
        {
          label: dict.admin.finance.title,
          items: [
            {
              href: `${base}/admin/finance`,
              label: dict.admin.finance.title,
              icon: ChartLineData01Icon,
            },
            {
              href: `${base}/admin/escrow`,
              label: dict.admin.escrow.title,
              icon: Wallet01Icon,
            },
            {
              href: `${base}/admin/payouts`,
              label: dict.admin.payouts.title,
              icon: Wallet01Icon,
            },
            {
              href: `${base}/admin/invoices`,
              label: dict.admin.invoices.title,
              icon: InvoiceIcon,
            },
          ],
        },
        {
          label: dict.admin.users.title,
          items: [
            {
              href: `${base}/admin/organizations`,
              label: dict.admin.organizations.title,
              icon: Building01Icon,
            },
            {
              href: `${base}/admin/users`,
              label: dict.admin.users.title,
              icon: UserMultiple02Icon,
            },
            {
              href: `${base}/admin/account-deletions`,
              label: dict.admin.accountDeletions.title,
              icon: UserRemove01Icon,
            },
            {
              href: `${base}/admin/agents`,
              label: dict.admin.agents.title,
              icon: UserGroup02Icon,
            },
          ],
        },
        {
          label: dict.admin.audit.title,
          items: [
            {
              href: `${base}/admin/audit`,
              label: dict.admin.audit.title,
              icon: BookOpen01Icon,
            },
            {
              href: `${base}/admin/webhooks`,
              label: dict.admin.webhooks.title,
              icon: CloudIcon,
            },
            {
              href: `${base}/admin/logins`,
              label: dict.admin.logins.title,
              icon: ComputerIcon,
            },
            {
              href: `${base}/admin/support`,
              label: dict.admin.support.title,
              icon: Mail01Icon,
            },
            {
              // Public pre-sales chat — distinct from the authenticated
              // support-ticket queue above it.
              href: `${base}/admin/support/chat`,
              label: dict.marketing.contact.chatQueueTitle,
              icon: Message01Icon,
            },
            {
              href: `${base}/admin/disputes`,
              label: dict.admin.disputes.title,
              icon: ScrollIcon,
            },
            {
              href: `${base}/admin/settings/sourcing`,
              label: dict.admin.sourcingAllowlist.title,
              icon: GlobalIcon,
            },
            {
              href: `${base}/admin/settings/payments`,
              label: dict.admin.payments.title,
              icon: Wallet01Icon,
            },
            {
              href: `${base}/admin/settings`,
              label: dict.nav.settings,
              icon: Settings01Icon,
            },
          ],
        },
      ];
    case "SHIPPER":
      // Expéditeur Sourcing Pick. Deliberately the narrowest nav of any role:
      // §8 of the spec asks for maximum simplicity, and §1.2 means there is no
      // client-facing surface for them to reach at all. Shipments is the whole
      // job; Messages is the only channel to the internal team.
      return [
        {
          label: dict.nav.shipments,
          items: [
            {
              href: `${base}/shipper/shipments`,
              label: dict.nav.shipments,
              icon: PackageIcon,
              primary: true,
            },
            {
              href: `${base}/messages`,
              label: dict.nav.messages,
              icon: Message01Icon,
              primary: true,
            },
            {
              href: `${base}/shipper/settings`,
              label: dict.nav.settings,
              icon: Settings01Icon,
            },
          ],
        },
      ];
  }
}

export function primaryItems(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items.filter((i) => i.primary));
}
