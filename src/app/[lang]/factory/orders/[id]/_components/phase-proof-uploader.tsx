"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import {
  uploadOrderProofAction,
  type ProofKind,
  type UploadProofState,
} from "@/lib/orders/proof-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: UploadProofState = {};

/**
 * Factory-side proof photo uploader. One instance per phase (QC or
 * shipment) — gated by the parent based on order status so we never
 * render an upload UI for a phase that's already locked.
 */
export function PhaseProofUploader({
  orderId,
  kind,
}: {
  orderId: string;
  kind: ProofKind;
}) {
  const dict = useDictionary();
  const t = dict.factory.orders.proofs;
  const [files, setFiles] = useState<File[]>([]);
  const [state, formAction, pending] = useActionState(
    uploadOrderProofAction,
    INITIAL,
  );

  useEffect(() => {
    if (state.ok) setFiles([]);
  }, [state.ok]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append("orderId", orderId);
    fd.append("kind", kind);
    for (const f of files) fd.append("files", f);
    startTransition(() => formAction(fd));
  };

  const label = kind === "QC" ? t.qcLabel : t.shipmentLabel;
  const hint = kind === "QC" ? t.qcHint : t.shipmentHint;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {state.error && <FormError>{state.error}</FormError>}
      {state.ok && (
        <div className="rounded-md border border-success-edge bg-success-soft/30 px-3 py-2 text-xs text-success">
          {t.saved}
        </div>
      )}

      <AttachmentPicker
        label={label}
        hint={hint}
        files={files}
        onChange={setFiles}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={pending}
          disabled={files.length === 0}
        >
          {t.submitCta}
        </Button>
      </div>
    </form>
  );
}
