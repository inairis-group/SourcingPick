import { notFound } from "next/navigation";
import {
  AgentTaskPriority,
  AgentTaskStatus,
  Role,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
  KpiCard,
} from "@/components/dashboard/primitives";
import { CreateTaskForm } from "./_components/create-task-form";
import { TaskRow, type TaskRowData } from "./_components/task-row";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/tasks">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.tasks.title };
}

const OPEN_STATUSES: AgentTaskStatus[] = [
  AgentTaskStatus.PENDING,
  AgentTaskStatus.IN_PROGRESS,
];

const OPEN_REQ_STATUSES = [
  SourcingStatus.REQUEST_RECEIVED,
  SourcingStatus.ASSIGNED,
  SourcingStatus.QUOTE_SENT,
];

export default async function AgentTasksPage({
  params,
}: PageProps<"/[lang]/agent/tasks">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const [tasks, openRequests, openTaskCount, dueSoonCount] = await Promise.all([
    prisma.agentTask.findMany({
      where: { agentId: agent.id },
      orderBy: [
        { status: "asc" },
        { dueAt: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: 200,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueAt: true,
        completedAt: true,
        createdAt: true,
        request: { select: { id: true, reference: true, title: true } },
      },
    }),
    prisma.sourcingRequest.findMany({
      where: { agentId: agent.id, status: { in: OPEN_REQ_STATUSES } },
      orderBy: { assignedAt: "asc" },
      select: { id: true, reference: true, title: true },
    }),
    prisma.agentTask.count({
      where: { agentId: agent.id, status: { in: OPEN_STATUSES } },
    }),
    prisma.agentTask.count({
      where: {
        agentId: agent.id,
        status: { in: OPEN_STATUSES },
        dueAt: {
          lte: new Date(Date.now() + 48 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    }),
  ]);

  const overdueCount = tasks.filter(
    (t) =>
      OPEN_STATUSES.includes(t.status) &&
      t.dueAt &&
      t.dueAt.getTime() < Date.now(),
  ).length;

  const open = tasks
    .filter((t) => OPEN_STATUSES.includes(t.status))
    .map((t): TaskRowData => toRow(t, lang));
  const closed = tasks
    .filter(
      (t) =>
        t.status === AgentTaskStatus.DONE ||
        t.status === AgentTaskStatus.CANCELLED,
    )
    .slice(0, 30)
    .map((t): TaskRowData => toRow(t, lang));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.agent.tasks.eyebrow}
        title={dict.agent.tasks.title}
        description={dict.agent.tasks.description}
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={dict.agent.tasks.kpiOpen}
          value={String(openTaskCount)}
          tone={openTaskCount > 0 ? "info" : "neutral"}
        />
        <KpiCard
          label={dict.agent.tasks.kpiDueSoon}
          value={String(dueSoonCount)}
          tone={dueSoonCount > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={dict.agent.tasks.kpiOverdue}
          value={String(overdueCount)}
          tone={overdueCount > 0 ? "danger" : "neutral"}
        />
      </div>

      <DashboardSection title={dict.agent.tasks.newTaskTitle} className="mb-6">
        <CreateTaskForm
          requests={openRequests.map((r) => ({
            value: r.id,
            label: `${r.reference} · ${r.title}`,
          }))}
        />
      </DashboardSection>

      <DashboardSection
        title={dict.agent.tasks.openTitle.replace("{n}", String(open.length))}
        className="mb-6"
      >
        {open.length === 0 ? (
          <p className="text-sm text-faint text-center py-6">
            {dict.agent.tasks.openEmpty}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line-subtle -my-3">
            {open.map((t) => (
              <li key={t.id} className="py-3">
                <TaskRow task={t} lang={lang} />
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      {closed.length > 0 && (
        <DashboardSection
          title={dict.agent.tasks.closedTitle.replace(
            "{n}",
            String(closed.length),
          )}
        >
          <ul className="flex flex-col divide-y divide-line-subtle -my-3">
            {closed.map((t) => (
              <li key={t.id} className="py-3">
                <TaskRow task={t} lang={lang} />
              </li>
            ))}
          </ul>
        </DashboardSection>
      )}
    </div>
  );
}

function toRow(
  t: {
    id: string;
    title: string;
    description: string | null;
    priority: AgentTaskPriority;
    status: AgentTaskStatus;
    dueAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    request: { id: string; reference: string; title: string } | null;
  },
  lang: import("@/lib/i18n/config").Locale,
): TaskRowData {
  const due = t.dueAt;
  const overdue =
    due !== null &&
    due.getTime() < Date.now() &&
    (t.status === AgentTaskStatus.PENDING ||
      t.status === AgentTaskStatus.IN_PROGRESS);
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueAtLabel: due ? formatDate(due, lang, "medium") : null,
    completedAtLabel: t.completedAt
      ? formatDate(t.completedAt, lang, "short")
      : null,
    overdue,
    request: t.request,
  };
}
