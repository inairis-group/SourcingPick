"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceProductStatus } from "@prisma/client";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import {
  adminBlockProductAction,
  adminDeleteProductAction,
  adminUnblockProductAction,
} from "@/lib/marketplace/admin-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Block / unblock / delete controls for an individual marketplace
 * listing on the admin overview. Partner #1 + #2 — admin needs full
 * leverage over factory listings without going through the factory's
 * own form.
 */
export function AdminListingControls({
  productId,
  status,
  blocked,
}: {
  productId: string;
  status: MarketplaceProductStatus;
  blocked: boolean;
}) {
  const dict = useDictionary();
  const lang = useLocale();
  const t = dict.admin.marketplace.controls;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [_, startTransition] = useTransition();

  if (status === MarketplaceProductStatus.ARCHIVED) {
    return (
      <span className="text-[11px] text-faint italic">{t.alreadyArchived}</span>
    );
  }

  const block = () => {
    if (reason.trim().length < 10) {
      setError(t.reasonTooShort);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await adminBlockProductAction(productId, reason.trim());
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setReason("");
      setBlockOpen(false);
      router.refresh();
    });
  };

  const unblock = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await adminUnblockProductAction(productId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const del = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await adminDeleteProductAction(productId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {error && <FormError>{error}</FormError>}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Partner round-4: admin needs direct edit power on any
            listing without going through the factory. Opens the same
            form the factory uses, bound to adminUpdateProductAction. */}
        <Link
          href={`/${lang}/admin/marketplace/${productId}/edit`}
          variant="muted"
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          {t.editCta}
        </Link>
        {blocked ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={unblock}
            loading={pending}
          >
            {t.unblockCta}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setBlockOpen(true)}
            disabled={pending}
          >
            {t.blockCta}
          </Button>
        )}
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={pending}
        >
          {t.deleteCta}
        </Button>
      </div>

      <Dialog
        open={blockOpen}
        onClose={(v) => !pending && setBlockOpen(v)}
        size="md"
      >
        <DialogTitle>{t.blockDialogTitle}</DialogTitle>
        <DialogDescription>{t.blockDialogBody}</DialogDescription>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder={t.reasonPlaceholder}
          disabled={pending}
          className={cn(
            "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm mb-2",
            "focus:outline-2 focus:outline-focus focus:outline-offset-1",
          )}
        />
        <p className="text-[11px] text-faint mb-3">
          {reason.trim().length} / 500
        </p>
        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBlockOpen(false)}
            disabled={pending}
          >
            {t.dialogCancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={block}
            loading={pending}
          >
            {t.blockConfirm}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={(v) => !pending && setDeleteOpen(v)}
        size="sm"
      >
        <DialogTitle>{t.deleteDialogTitle}</DialogTitle>
        <DialogDescription>{t.deleteDialogBody}</DialogDescription>
        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(false)}
            disabled={pending}
          >
            {t.dialogCancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={del}
            loading={pending}
          >
            {t.deleteConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
