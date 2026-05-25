"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AgentTaskPriority, AgentTaskStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

const CreateSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(AgentTaskPriority).default(AgentTaskPriority.MEDIUM),
  dueAt: z.union([z.coerce.date(), z.literal("")]).optional(),
  requestId: z.string().optional().or(z.literal("")),
});

export type TaskActionState = {
  error?: string;
};

/**
 * Create a personal task for the agent. Tasks may optionally be tied to a
 * SourcingRequest the agent is assigned to — used for "follow up by
 * Friday" reminders that the dashboard can surface as urgent.
 */
export async function createTaskAction(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const agent = await requireRole(Role.AGENT);

  const parsed = CreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") ?? AgentTaskPriority.MEDIUM,
    dueAt: formData.get("dueAt") ?? "",
    requestId: formData.get("requestId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // If a requestId is provided, verify the agent actually owns it.
  let requestId: string | null = null;
  if (parsed.data.requestId) {
    const req = await prisma.sourcingRequest.findFirst({
      where: { id: parsed.data.requestId, agentId: agent.id },
      select: { id: true },
    });
    if (!req) {
      return {
        error:
          "That request isn't assigned to you — pick one from your queue or leave the link empty.",
      };
    }
    requestId = req.id;
  }

  const task = await prisma.agentTask.create({
    data: {
      agentId: agent.id,
      requestId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt instanceof Date ? parsed.data.dueAt : null,
    },
    select: { id: true },
  });

  await writeAuditLog({
    actorUserId: agent.id,
    action: "task.created",
    targetType: "AgentTask",
    targetId: task.id,
    payload: { title: parsed.data.title, priority: parsed.data.priority },
  });

  revalidatePath("/[lang]/agent/tasks", "page");
  revalidatePath("/[lang]/agent/dashboard", "page");
  return {};
}

export type TaskMutationResult = { ok: true } | { ok: false; error: string };

export async function completeTaskAction(
  taskId: string,
): Promise<TaskMutationResult> {
  const agent = await requireRole(Role.AGENT);
  const updated = await prisma.agentTask.updateMany({
    where: { id: taskId, agentId: agent.id, status: { not: AgentTaskStatus.DONE } },
    data: { status: AgentTaskStatus.DONE, completedAt: new Date() },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Task not found or already done." };
  }
  await writeAuditLog({
    actorUserId: agent.id,
    action: "task.completed",
    targetType: "AgentTask",
    targetId: taskId,
  });
  revalidatePath("/[lang]/agent/tasks", "page");
  revalidatePath("/[lang]/agent/dashboard", "page");
  return { ok: true };
}

export async function cancelTaskAction(
  taskId: string,
): Promise<TaskMutationResult> {
  const agent = await requireRole(Role.AGENT);
  const updated = await prisma.agentTask.updateMany({
    where: {
      id: taskId,
      agentId: agent.id,
      status: { notIn: [AgentTaskStatus.DONE, AgentTaskStatus.CANCELLED] },
    },
    data: { status: AgentTaskStatus.CANCELLED },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Task not found or already closed." };
  }
  await writeAuditLog({
    actorUserId: agent.id,
    action: "task.cancelled",
    targetType: "AgentTask",
    targetId: taskId,
  });
  revalidatePath("/[lang]/agent/tasks", "page");
  revalidatePath("/[lang]/agent/dashboard", "page");
  return { ok: true };
}

export async function reopenTaskAction(
  taskId: string,
): Promise<TaskMutationResult> {
  const agent = await requireRole(Role.AGENT);
  const updated = await prisma.agentTask.updateMany({
    where: {
      id: taskId,
      agentId: agent.id,
      status: { in: [AgentTaskStatus.DONE, AgentTaskStatus.CANCELLED] },
    },
    data: { status: AgentTaskStatus.PENDING, completedAt: null },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Task can't be reopened." };
  }
  await writeAuditLog({
    actorUserId: agent.id,
    action: "task.reopened",
    targetType: "AgentTask",
    targetId: taskId,
  });
  revalidatePath("/[lang]/agent/tasks", "page");
  revalidatePath("/[lang]/agent/dashboard", "page");
  return { ok: true };
}
