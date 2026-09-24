import { notFound } from "next/navigation";
import Image from "next/image";
import { Role, SourcingRequestOrigin, SourcingStatus } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/saas/page-header";
import { FilterChips, type FilterChip } from "@/components/saas/filter-chips";
import { DataTable, Ref, Stamp, type Column } from "@/components/saas/data-table";
import { StatusPill } from "@/components/saas/status-pill";
import { EmptyLine } from "@/components/saas/panel";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { STATE_TONE, type OrderState } from "@/lib/orders/lifecycle";

export async function generateMetadata({ params }: PageProps<"/[lang]/client/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.requests.title };
}

/**
 * Which requests each chip shows.
 *
 * The canvas draws four — Toutes, En cours, Devis reçu, Clôturées — and the
 * application's `SourcingStatus` has eleven values, so the mapping is here
 * rather than in the query. Kept as a plain object because it is also what
 * makes an unknown `?status=` in the URL fall back to "all" instead of
 * returning nothing.
 */
const FILTERS = {
  all: null,
  open: [
    SourcingStatus.REQUEST_RECEIVED,
    SourcingStatus.ASSIGNED,
    SourcingStatus.PREPARATION,
    SourcingStatus.SHIPPED,
    SourcingStatus.IN_TRANSIT,
  ],
  quoted: [SourcingStatus.QUOTE_SENT, SourcingStatus.QUOTE_ACCEPTED],
  closed: [
    SourcingStatus.COMPLETED,
    SourcingStatus.CANCELLED,
    SourcingStatus.QUOTE_REJECTED,
  ],
} satisfies Record<string, SourcingStatus[] | null>;

type FilterKey = keyof typeof FILTERS;

function isFilterKey(v: string | undefined): v is FilterKey {
  return v !== undefined && v in FILTERS;
}

/**
 * The lifecycle state a request is in, from the status it actually holds.
 *
 * The canvas's ten states and the application's eleven statuses are close but
 * not identical — the canvas splits payment into pending and received, and
 * has no separate word for an accepted quotation. This is the join, and it is
 * one-directional on purpose: `SourcingStatus` stays the stored truth, and
 * the canvas's vocabulary is how it is spoken.
 */
const STATE_OF: Record<SourcingStatus, OrderState> = {
  DRAFT: "REQUEST_RECEIVED",
  REQUEST_RECEIVED: "REQUEST_RECEIVED",
  ASSIGNED: "AGENT_ASSIGNED",
  QUOTE_SENT: "QUOTE_SENT",
  QUOTE_ACCEPTED: "PAYMENT_PENDING",
  QUOTE_REJECTED: "CANCELLED",
  PREPARATION: "PREPARATION_COMPLETE",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

type Row = {
  id: string;
  reference: string;
  title: string;
  status: SourcingStatus;
  createdAt: Date;
  agent: { name: string | null; image: string | null } | null;
};

export default async function ClientRequestsPage({
  params,
  searchParams,
}: PageProps<"/[lang]/client/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const t = dict.client.requests;

  const raw = (await searchParams)?.status;
  const filter: FilterKey = isFilterKey(typeof raw === "string" ? raw : undefined)
    ? (raw as FilterKey)
    : "all";
  const statuses = FILTERS[filter];

  const requests = await prisma.sourcingRequest.findMany({
    // Marketplace purchases materialise a synthetic SourcingRequest so the
    // Order/Invoice pipeline can stay role-agnostic, but the buyer never went
    // through a quote step and seeing "Quotation sent" on something they
    // think of as an order is confusing. They live under /client/orders.
    where: {
      clientOrgId: user.organizationId,
      origin: SourcingRequestOrigin.SOURCING_FLOW,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      title: true,
      status: true,
      createdAt: true,
      agent: { select: { name: true, image: true } },
    },
  });

  const chips: FilterChip[] = [
    { key: "all", label: t.filterAll },
    { key: "open", label: t.filterOpen },
    { key: "quoted", label: t.filterQuoted },
    { key: "closed", label: t.filterClosed },
  ];

  return (
    <>
      <PageHeader
        title={t.title}
        actions={
          <Link
            href={`/${lang}/client/requests/new`}
            variant="muted"
            className={buttonClass({ variant: "primary", size: "md" })}
          >
            {t.newRequest}
            <PlusGlyph />
          </Link>
        }
      />

      <FilterChips
        chips={chips}
        current={filter}
        label={t.colState}
        hrefFor={(key) =>
          key === "all"
            ? `/${lang}/client/requests`
            : `/${lang}/client/requests?status=${key}`
        }
      />

      <Card>
        <DataTable<Row>
          caption={t.title}
          columns={columns(lang, dict)}
          rows={requests}
          rowKey={(r) => r.id}
          rowHref={(r) => `/${lang}/client/requests/${r.id}`}
          empty={<EmptyLine>{t.empty}</EmptyLine>}
        />
      </Card>
    </>
  );
}

function columns(lang: Locale, dict: Dictionary): Column<Row>[] {
  const t = dict.client.requests;
  return [
    {
      key: "reference",
      header: t.colReference,
      width: "16%",
      primary: true,
      cell: (r) => <Ref>{r.reference}</Ref>,
    },
    { key: "title", header: t.colProduct, width: "26%", cell: (r) => r.title },
    {
      key: "agent",
      header: t.colAgent,
      width: "18%",
      // An assigned agent whose profile has no display name yet would
      // otherwise render as an empty cell, which reads as "nobody is on
      // this" — the opposite of what the row says two columns along.
      cell: (r) =>
        r.agent?.name ? (
          <span className="inline-flex items-center gap-2">
            {r.agent.image && (
              <Image
                src={r.agent.image}
                alt=""
                width={26}
                height={26}
                className="size-6.5 rounded-full object-cover"
              />
            )}
            {r.agent.name}
          </span>
        ) : (
          <span className="text-muted">{t.unassigned}</span>
        ),
    },
    {
      key: "created",
      header: t.colCreated,
      width: "14%",
      cell: (r) => <Stamp>{formatDate(r.createdAt, lang)}</Stamp>,
    },
    {
      key: "state",
      header: t.colState,
      width: "18%",
      cell: (r) => {
        const state = STATE_OF[r.status];
        return <StatusPill tone={STATE_TONE[state]}>{dict.lifecycle.state[state]}</StatusPill>;
      },
    },
    {
      key: "open",
      header: "",
      width: "8%",
      hideOnCard: true,
      cell: (r) => (
        <Link
          href={`/${lang}/client/requests/${r.id}`}
          variant="inline"
          className="font-semibold"
        >
          {t.open}
        </Link>
      ),
    },
  ];
}

/** The canvas draws a plain plus beside "Nouvelle demande". */
function PlusGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
