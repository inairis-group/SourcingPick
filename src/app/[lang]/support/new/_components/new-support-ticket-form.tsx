"use client";

import { useActionState, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sent02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import {
  createSupportTicketAction,
  type CreateTicketState,
} from "@/lib/support/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: CreateTicketState = {};

export function NewSupportTicketForm() {
  const dict = useDictionary();
  const t = dict.support;
  const [state, formAction, pending] = useActionState(
    createSupportTicketAction,
    INITIAL,
  );
  const [files, setFiles] = useState<File[]>([]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-faint">
          {t.subjectLabel}
        </label>
        <Input
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder={t.subjectPlaceholder}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-faint">
          {t.bodyLabel}
        </label>
        <textarea
          name="body"
          required
          maxLength={5000}
          rows={6}
          placeholder={t.bodyPlaceholder}
          className="w-full rounded-md border border-line-strong bg-surface text-fg placeholder:text-faint p-3 text-sm resize-y focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2"
        />
        <p className="text-[11px] text-faint">{t.bodyHint}</p>
      </div>

      <AttachmentPicker
        label={t.attachmentsLabel}
        hint={t.attachmentsHint}
        files={files}
        onChange={setFiles}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          <HugeiconsIcon icon={Sent02Icon} size={14} strokeWidth={1.5} />
          <span className="ms-1.5">{t.submitCta}</span>
        </Button>
      </div>
    </form>
  );
}
