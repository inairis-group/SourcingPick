"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SupportTicketStatus, SupportTopicKind } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Link04Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  clearSupportTicketTopicAction,
  setSupportTicketStatusAction,
  setSupportTicketTopicAction,
} from "@/lib/support/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Admin-only controls on a support ticket page. Two zones:
 *   - Status: segmented PENDING / OPEN / RESOLVED.
 *   - Topic: kind dropdown + reference / id input. Picking + saving
 *     attaches a polymorphic anchor that admins use to navigate from a
 *     ticket back to the underlying record.
 */
export function SupportAdminControls({
  ticketId,
  status,
  currentTopicKind,
  currentTopicId,
}: {
  ticketId: string;
  status: SupportTicketStatus;
  currentTopicKind: SupportTopicKind | null;
  currentTopicId: string | null;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const t = dict.support;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();
  const [topicKind, setTopicKind] = useState<SupportTopicKind | "">(
    currentTopicKind ?? "",
  );
  const [topicValue, setTopicValue] = useState(currentTopicId ?? "");

  const onStatusChange = (next: SupportTicketStatus) => {
    if (next === status) return;
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await setSupportTicketStatusAction(ticketId, next);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const onSetTopic = () => {
    if (!topicKind || !topicValue.trim()) {
      setError(t.topicErrorMissing);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await setSupportTicketTopicAction(
        ticketId,
        topicKind as SupportTopicKind,
        topicValue.trim(),
      );
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const onClearTopic = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await clearSupportTicketTopicAction(ticketId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setTopicKind("");
      setTopicValue("");
      router.refresh();
    });
  };

  return (
    <section className="rounded-lg border border-line bg-surface p-5 mb-4 flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {t.adminControlsTitle}
        </h2>
        <span className="text-[10px] text-faint">{t.adminOnly}</span>
      </header>

      {error && <FormError>{error}</FormError>}

      {/* Status segmented */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {t.statusLabel}
        </p>
        <div
          role="radiogroup"
          aria-label={t.statusLabel}
          className="inline-flex rounded-full border border-line bg-subtle p-0.5"
        >
          <StatusOption
            value={SupportTicketStatus.PENDING}
            current={status}
            disabled={pending}
            label={t.statusPending}
            icon={TimeQuarterPassIcon}
            onSelect={onStatusChange}
            activeClasses="bg-warning-soft text-warning"
          />
          <StatusOption
            value={SupportTicketStatus.OPEN}
            current={status}
            disabled={pending}
            label={t.statusOpen}
            icon={TimeQuarterPassIcon}
            onSelect={onStatusChange}
            activeClasses="bg-info-soft text-info"
          />
          <StatusOption
            value={SupportTicketStatus.RESOLVED}
            current={status}
            disabled={pending}
            label={t.statusResolved}
            icon={CheckmarkCircle02Icon}
            onSelect={onStatusChange}
            activeClasses="bg-success-soft text-success"
          />
        </div>
      </div>

      {/* Topic picker */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {t.topicSectionLabel}
        </p>
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-muted mb-1">
              {t.topicKindLabel}
            </label>
            <Select
              size="sm"
              value={topicKind}
              onChange={(v) => setTopicKind(v as SupportTopicKind | "")}
              placeholder={t.topicKindPlaceholder}
              options={Object.values(SupportTopicKind).map((k) => ({
                value: k,
                label: t.topicKinds[k],
              }))}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-muted mb-1">
              {t.topicValueLabel}
            </label>
            <Input
              type="text"
              inputSize="sm"
              value={topicValue}
              onChange={(e) => setTopicValue(e.target.value)}
              placeholder={t.topicValuePlaceholder}
            />
          </div>
          <div className="flex items-center gap-2">
            {currentTopicId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearTopic}
                disabled={pending}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={12}
                  strokeWidth={1.5}
                />
                <span className="ms-1.5">{t.clearTopic}</span>
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onSetTopic}
              loading={pending}
              disabled={!topicKind || !topicValue.trim()}
            >
              <HugeiconsIcon icon={Link04Icon} size={12} strokeWidth={1.5} />
              <span className="ms-1.5">
                {currentTopicId ? t.updateTopic : t.setTopic}
              </span>
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-faint">{t.topicHint}</p>
      </div>
    </section>
  );
}

function StatusOption({
  value,
  current,
  disabled,
  label,
  icon,
  onSelect,
  activeClasses,
}: {
  value: SupportTicketStatus;
  current: SupportTicketStatus;
  disabled: boolean;
  label: string;
  icon: typeof CheckmarkCircle02Icon;
  onSelect: (v: SupportTicketStatus) => void;
  activeClasses: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium uppercase tracking-wide",
        "transition-colors duration-fast",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        active
          ? activeClasses
          : "text-muted hover:text-fg hover:bg-surface",
      )}
    >
      <HugeiconsIcon icon={icon} size={11} strokeWidth={2} />
      {label}
    </button>
  );
}
