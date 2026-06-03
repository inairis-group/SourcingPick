"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { uploadForwarderProofAction } from "@/lib/orders/forwarder-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Forwarder upload form — public, token-authenticated. Reuses the
 * existing AttachmentPicker so size limits + previews match what the
 * factory sees on the order page. On success we router.refresh() so the
 * gallery + upload counter update without a full reload.
 */
export function ForwarderUploadForm({ token }: { token: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const t = dict.forwarder;
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [justUploaded, setJustUploaded] = useState<number>(0);
  const [_, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;
    setError(null);
    setWarnings([]);
    setPending(true);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("token", token);
      for (const f of files) fd.append("files", f);
      const r = await uploadForwarderProofAction(fd);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setJustUploaded(r.created);
      setWarnings(r.warnings ?? []);
      setFiles([]);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {justUploaded > 0 && (
        <div className="rounded-md border border-success-edge bg-success-soft px-4 py-3 flex items-start gap-3">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            strokeWidth={2}
            className="text-success mt-0.5 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-success">
              {t.successTitle.replace("{n}", String(justUploaded))}
            </p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {t.successBody}
            </p>
            {warnings.length > 0 && (
              <ul className="text-xs text-warning mt-1.5 list-disc ps-4">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <AttachmentPicker
        label={t.pickerLabel}
        hint={t.pickerHint}
        files={files}
        onChange={setFiles}
      />

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          disabled={files.length === 0}
        >
          <HugeiconsIcon icon={CloudUploadIcon} size={14} strokeWidth={1.5} />
          <span className="ms-1.5">
            {files.length > 0
              ? t.submitWithCount.replace("{n}", String(files.length))
              : t.submitEmpty}
          </span>
        </Button>
      </div>
    </form>
  );
}
