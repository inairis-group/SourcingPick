"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AgentTaskPriority, AgentTaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { FormError } from "@/components/ui/form-error";
import {
  cancelTaskAction,
  completeTaskAction,
  reopenTaskAction,
} from "@/lib/agent/task-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

export type TaskRowData = {
  id: string;
  title: string;
  description: string | null;
  priority: AgentTaskPriority;
  status: AgentTaskStatus;
  dueAtLabel: string | null;
  completedAtLabel: string | null;
  overdue: boolean;
  request: { id: string; reference: string; title: string } | null;
};

const PRIORITY_TONE: Record<AgentTaskPriority, string> = {
  LOW: "bg-subtle text-muted border-line",
  MEDIUM: "bg-info-soft text-info border-info-edge",
  HIGH: "bg-warning-soft text-warning border-warning-edge",
};

const STATUS_TONE: Record<AgentTaskStatus, string> = {
  PENDING: "bg-info-soft text-info border-info-edge",
  IN_PROGRESS: "bg-warning-soft text-warning border-warning-edge",
  DONE: "bg-success-soft text-success border-success-edge",
  CANCELLED: "bg-subtle text-faint border-line",
};

export function TaskRow({
  task,
  lang,
}: {
  task: TaskRowData;
  lang: string;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"complete" | "cancel" | "reopen" | null>(
    null,
  );
  const [_, startTransition] = useTransition();

  const run = (
    op: "complete" | "cancel" | "reopen",
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) => {
    setError(null);
    setPending(op);
    startTransition(async () => {
      const result = await fn();
      setPending(null);
      if (!result.ok) {
        setError(result.error ?? "Failed.");
        return;
      }
      router.refresh();
    });
  };

  const open =
    task.status === AgentTaskStatus.PENDING ||
    task.status === AgentTaskStatus.IN_PROGRESS;

  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={cn(
                "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide",
                PRIORITY_TONE[task.priority],
              )}
            >
              {dict.agent.tasks[
                `priority${task.priority[0]}${task.priority.slice(1).toLowerCase()}` as
                  | "priorityLow"
                  | "priorityMedium"
                  | "priorityHigh"
              ]}
            </span>
            <span
              className={cn(
                "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide",
                STATUS_TONE[task.status],
              )}
            >
              {dict.agent.tasks.statuses[task.status]}
            </span>
            {task.overdue && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-danger">
                {dict.agent.tasks.overdueBadge}
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm font-medium",
              task.status === AgentTaskStatus.DONE
                ? "line-through text-muted"
                : "text-headline",
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted mt-0.5 leading-snug whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-faint">
            {task.dueAtLabel && (
              <span className={task.overdue ? "text-danger font-medium" : ""}>
                {dict.agent.tasks.dueAt} {task.dueAtLabel}
              </span>
            )}
            {task.completedAtLabel && (
              <span>
                {dict.agent.tasks.completedAt} {task.completedAtLabel}
              </span>
            )}
            {task.request && (
              <Link
                href={`/${lang}/agent/requests/${task.request.id}`}
                variant="default"
                className="text-[11px] font-medium"
              >
                {task.request.reference}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {open && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  run("cancel", () => cancelTaskAction(task.id))
                }
                loading={pending === "cancel"}
              >
                {dict.agent.tasks.cancelCta}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  run("complete", () => completeTaskAction(task.id))
                }
                loading={pending === "complete"}
              >
                {dict.agent.tasks.completeCta}
              </Button>
            </>
          )}
          {!open && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => run("reopen", () => reopenTaskAction(task.id))}
              loading={pending === "reopen"}
            >
              {dict.agent.tasks.reopenCta}
            </Button>
          )}
        </div>
      </div>
      {error && <FormError>{error}</FormError>}
    </article>
  );
}
