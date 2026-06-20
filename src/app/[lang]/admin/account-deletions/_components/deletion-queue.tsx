"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import {
  approveAccountDeletionAction,
  rejectAccountDeletionAction,
} from "@/lib/admin/deletion-actions";

export type DeletionRow = {
  id: string;
  reason: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userRole: string;
  orgName: string;
};

export function DeletionQueue({ rows }: { rows: DeletionRow[] }) {
  const dict = useDictionary();
  const t = dict.admin.accountDeletions;

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-muted">
        {t.empty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <RequestCard key={row.id} row={row} />
      ))}
    </ul>
  );
}

function RequestCard({ row }: { row: DeletionRow }) {
  const dict = useDictionary();
  const t = dict.admin.accountDeletions;
  const locale = useLocale();
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const approve = () => {
    if (!window.confirm(t.approveConfirm)) return;
    setError(null);
    startTransition(async () => {
      const r = await approveAccountDeletionAction(row.id);
      if (!r.ok) {
        setError(r.error || t.error);
        return;
      }
      router.refresh();
    });
  };

  const reject = () => {
    setError(null);
    startTransition(async () => {
      const r = await rejectAccountDeletionAction(row.id, note.trim());
      if (!r.ok) {
        setError(r.error || t.error);
        return;
      }
      setRejecting(false);
      setNote("");
      router.refresh();
    });
  };

  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-headline">{row.userName}</p>
          <p className="text-xs text-muted break-all">{row.userEmail}</p>
          <p className="mt-1 text-xs text-faint">
            {row.orgName} · {row.userRole} · {t.columns.requested}{" "}
            {formatDate(row.createdAt, locale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={pending}
            onClick={approve}
          >
            {t.approveCta}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => setRejecting((v) => !v)}
          >
            {t.rejectCta}
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-subtle/50 px-3 py-2 text-sm text-fg">
        <span className="text-xs font-medium text-muted">
          {t.columns.reason}:{" "}
        </span>
        {row.reason ? row.reason : <span className="text-faint">{t.noReason}</span>}
      </div>

      {error && (
        <div className="mt-3">
          <FormError>{error}</FormError>
        </div>
      )}

      {rejecting && (
        <div className="mt-3 flex flex-col gap-2">
          <label
            className="text-xs font-medium text-muted"
            htmlFor={`reject-note-${row.id}`}
          >
            {t.rejectNoteLabel}
          </label>
          <textarea
            id={`reject-note-${row.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.rejectNotePlaceholder}
            rows={2}
            maxLength={1000}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-brand-edge"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={pending}
              onClick={reject}
            >
              {t.rejectSubmit}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setRejecting(false);
                setError(null);
              }}
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
