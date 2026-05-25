"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgentTaskPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  createTaskAction,
  type TaskActionState,
} from "@/lib/agent/task-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const INITIAL: TaskActionState = {};

export function CreateTaskForm({
  requests,
}: {
  requests: { value: string; label: string }[];
}) {
  const dict = useDictionary();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createTaskAction,
    INITIAL,
  );

  // Reset the form on success (no error returned from the action).
  useEffect(() => {
    if (!pending && !state.error && state !== INITIAL) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, pending, router]);

  const PRIORITY_LABELS: Record<AgentTaskPriority, string> = {
    LOW: dict.agent.tasks.priorityLow,
    MEDIUM: dict.agent.tasks.priorityMedium,
    HIGH: dict.agent.tasks.priorityHigh,
  };

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      <Field label={dict.agent.tasks.fieldTitle} required>
        <Input
          name="title"
          required
          maxLength={160}
          placeholder={dict.agent.tasks.titlePlaceholder}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={dict.agent.tasks.fieldPriority}>
          <Select
            name="priority"
            defaultValue={AgentTaskPriority.MEDIUM}
            options={(Object.keys(PRIORITY_LABELS) as AgentTaskPriority[]).map(
              (p) => ({ value: p, label: PRIORITY_LABELS[p] }),
            )}
          />
        </Field>
        <Field label={dict.agent.tasks.fieldDueAt}>
          <Input name="dueAt" type="date" />
        </Field>
        <Field label={dict.agent.tasks.fieldRequest}>
          <Select
            name="requestId"
            defaultValue=""
            placeholder={dict.agent.tasks.requestPlaceholder}
            options={[
              { value: "", label: dict.agent.tasks.noRequestLink },
              ...requests,
            ]}
          />
        </Field>
      </div>
      <Field label={dict.agent.tasks.fieldDescription}>
        <textarea
          name="description"
          rows={2}
          maxLength={2000}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-sm resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
          placeholder={dict.agent.tasks.descriptionPlaceholder}
        />
      </Field>
      <div className="flex items-center justify-end">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {dict.agent.tasks.createCta}
        </Button>
      </div>
    </form>
  );
}
