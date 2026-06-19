"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Video01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { adminUploadTestVideoAction } from "@/lib/marketplace/admin-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Phase 2 — admin-only test-video uploader for a marketplace product.
 * Single video per listing (mp4/webm). New upload replaces any
 * previous one. Surfaced on the admin product-edit page; never shown
 * to factories or buyers.
 */
export function TestVideoUploader({
  productId,
  currentVideoAttachmentId,
}: {
  productId: string;
  currentVideoAttachmentId: string | null;
}) {
  const dict = useDictionary();
  const t = dict.admin.marketplace.testVideo;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const submit = (file: File) => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("video", file);
      const r = await adminUploadTestVideoAction(productId, fd);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <header className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <HugeiconsIcon icon={Video01Icon} size={16} strokeWidth={1.5} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-headline">{t.title}</h3>
          <p className="text-xs text-muted mt-0.5 leading-snug">{t.body}</p>
        </div>
      </header>

      {error && <FormError>{error}</FormError>}

      {currentVideoAttachmentId && (
        <video
          src={`/api/attachments/${currentVideoAttachmentId}`}
          controls
          playsInline
          preload="metadata"
          className="w-full aspect-video rounded-md border border-line bg-page"
        />
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) submit(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <Button
          type="button"
          variant={currentVideoAttachmentId ? "secondary" : "primary"}
          size="sm"
          onClick={() => fileRef.current?.click()}
          loading={pending}
        >
          {currentVideoAttachmentId ? t.replaceCta : t.uploadCta}
        </Button>
        <span
          className={cn(
            "text-[11px] flex items-center gap-1",
            currentVideoAttachmentId ? "text-success" : "text-muted",
          )}
        >
          <HugeiconsIcon
            icon={currentVideoAttachmentId ? Video01Icon : Cancel01Icon}
            size={12}
            strokeWidth={1.75}
          />
          {currentVideoAttachmentId ? t.statusUploaded : t.statusMissing}
        </span>
      </div>
    </section>
  );
}
