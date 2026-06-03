import { notFound } from "next/navigation";
import {
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  TimeQuarterPassIcon,
  CustomerService01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { MessageThread } from "@/components/messaging/message-thread";
import { ensureSupportThreadOpened } from "@/lib/support/actions";
import { resolveSupportTopic } from "@/lib/support/queries";
import { cn } from "@/lib/utils";
import { SupportAdminControls } from "./_components/support-admin-controls";
import { SupportTopicCard } from "./_components/support-topic-card";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/support/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: ticket?.reference ?? "" };
}

export default async function SupportTicketDetailPage({
  params,
}: PageProps<"/[lang]/support/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireAuth();
  const dict = await getDictionary(lang);
  const t = dict.support;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      reference: true,
      subject: true,
      status: true,
      topicKind: true,
      topicId: true,
      requesterUserId: true,
      createdAt: true,
      openedAt: true,
      resolvedAt: true,
      requester: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      requesterOrg: {
        select: { displayName: true, country: true },
      },
      resolvedBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
  if (!ticket) notFound();

  // Requesters can only see their own; admins can see all.
  if (user.role !== Role.ADMIN && ticket.requesterUserId !== user.id) {
    notFound();
  }

  // Open the thread now so messaging works on this render. Also flips
  // PENDING → OPEN when an admin lands on a fresh ticket.
  const thread = await ensureSupportThreadOpened(ticket.id, {
    id: user.id,
    role: user.role,
  });
  void ThreadContextType; // referenced for type narrowing only

  const topic = await resolveSupportTopic(
    ticket.topicKind,
    ticket.topicId,
    lang,
    user.role,
  );

  const isAdmin = user.role === Role.ADMIN;
  const backHref = isAdmin
    ? `/${lang}/admin/support`
    : `/${lang}/messages`;

  return (
    // h-[calc(100dvh-3.5rem)] = full viewport minus the RoleShell topbar
    // (h-14). The `-mb-24` cancels the shell's pb-24 so the composer
    // can sit right above the role-nav-pill without a gap.
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 h-[calc(100dvh-3.5rem)] -mb-24 flex flex-col">
      <Link
        href={backHref}
        variant="muted"
        className="text-sm mb-4 inline-block shrink-0"
      >
        ← {isAdmin ? t.backToAdminQueue : t.backToMessages}
      </Link>

      <header className="flex flex-col gap-2 mb-4 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <HugeiconsIcon
              icon={CustomerService01Icon}
              size={18}
              strokeWidth={1.5}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-mono uppercase tracking-wide text-faint">
              {ticket.reference}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-headline tracking-tight">
              {ticket.subject}
            </h1>
          </div>
          <StatusPill status={ticket.status} dict={dict} />
        </div>
        <p className="text-xs text-muted">
          {t.openedBy
            .replace(
              "{name}",
              `${ticket.requester.firstName} ${ticket.requester.lastName}`,
            )
            .replace("{org}", ticket.requesterOrg?.displayName ?? "—")}
          {" · "}
          {formatDate(ticket.createdAt, lang, "medium")}
        </p>
        {ticket.status === SupportTicketStatus.RESOLVED &&
          ticket.resolvedAt &&
          ticket.resolvedBy && (
            <p className="text-xs text-success flex items-center gap-1.5">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={12}
                strokeWidth={2}
              />
              {t.resolvedOn.replace(
                "{date}",
                formatDate(ticket.resolvedAt, lang, "medium"),
              )}
              {" · "}
              {ticket.resolvedBy.firstName} {ticket.resolvedBy.lastName}
            </p>
          )}
      </header>

      {topic && <SupportTopicCard topic={topic} />}

      {isAdmin && (
        <SupportAdminControls
          ticketId={ticket.id}
          status={ticket.status}
          currentTopicKind={ticket.topicKind}
          currentTopicId={ticket.topicId}
        />
      )}

      <div className="mt-4 flex-1 min-h-0 pb-2">
        <MessageThread threadId={thread.threadId} fill />
      </div>
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: SupportTicketStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const t = dict.support;
  const map: Record<
    SupportTicketStatus,
    { label: string; classes: string; icon: typeof CheckmarkCircle02Icon }
  > = {
    PENDING: {
      label: t.statusPending,
      classes: "bg-warning-soft text-warning border-warning-edge",
      icon: TimeQuarterPassIcon,
    },
    OPEN: {
      label: t.statusOpen,
      classes: "bg-info-soft text-info border-info-edge",
      icon: TimeQuarterPassIcon,
    },
    RESOLVED: {
      label: t.statusResolved,
      classes: "bg-success-soft text-success border-success-edge",
      icon: CheckmarkCircle02Icon,
    },
  };
  const { label, classes, icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap shrink-0",
        classes,
      )}
    >
      <HugeiconsIcon icon={icon} size={11} strokeWidth={2} />
      {label}
    </span>
  );
}
