"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  approveProductAction,
  rejectProductAction,
} from "@/lib/marketplace/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

export type ModerationRow = {
  id: string;
  reference: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  priceFactoryEur: string;
  priceClientEur: string;
  moq: number;
  leadTimeDays: number;
  certifications: string[];
  images: string[];
  submittedAtLabel: string;
  factoryName: string;
  factoryLocation: string;
  factoryKycVerified: boolean;
};

export function ModerationQueue({ items }: { items: ModerationRow[] }) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [_, startTransition] = useTransition();

  const onApprove = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await approveProductAction(id);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const onConfirmReject = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await rejectProductAction(id, reason);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRejecting(null);
      setReason("");
      router.refresh();
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
        <p className="text-sm text-muted">{dict.admin.marketplace.empty}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <FormError>{error}</FormError>}
      {items.map((p) => (
        <article
          key={p.id}
          className="rounded-lg border border-line bg-surface overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0">
            <div className="bg-subtle grid grid-cols-2 gap-px p-px">
              {p.images.slice(0, 4).map((url, i) => (
                <div
                  key={i}
                  className="aspect-square bg-subtle relative overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
              {p.images.length === 0 && (
                <div className="col-span-2 aspect-[2/1] flex items-center justify-center text-faint text-xs">
                  {dict.admin.marketplace.noImage}
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-wide text-faint">
                    {p.reference}
                  </p>
                  <h3 className="text-base font-semibold text-headline">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {p.categoryLabel} · {p.factoryName} · {p.factoryLocation}
                  </p>
                </div>
                {!p.factoryKycVerified && (
                  <span className="inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide bg-warning-soft text-warning border-warning-edge">
                    {dict.admin.marketplace.factoryKycMissing}
                  </span>
                )}
              </div>

              <p className="text-sm text-fg leading-snug whitespace-pre-wrap">
                {p.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-line-subtle">
                <Metric
                  label={dict.factory.catalogue.priceLabel}
                  value={p.priceFactoryEur}
                />
                <Metric
                  label={dict.factory.catalogue.clientPriceLabel}
                  value={p.priceClientEur}
                />
                <Metric
                  label={dict.factory.catalogue.moqLabel}
                  value={String(p.moq)}
                />
                <Metric
                  label={dict.factory.catalogue.leadTimeLabel}
                  value={`${p.leadTimeDays} ${dict.factory.tenders.daysSuffix}`}
                />
              </div>

              {p.certifications.length > 0 && (
                <p className="text-[11px] text-muted">
                  {p.certifications.join(" · ")}
                </p>
              )}

              <p className="text-[11px] text-faint">
                {dict.admin.marketplace.submittedAt} {p.submittedAtLabel}
              </p>

              {rejecting === p.id ? (
                <div className="rounded-md border border-line p-3 bg-subtle flex flex-col gap-2">
                  <label className="text-xs font-medium text-fg">
                    {dict.admin.marketplace.rejectReasonLabel}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={cn(
                      "w-full rounded-sm border bg-surface text-fg p-2 text-sm resize-y",
                      "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
                    )}
                    placeholder={dict.admin.marketplace.rejectReasonPlaceholder}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejecting(null);
                        setReason("");
                      }}
                      disabled={pendingId === p.id}
                    >
                      {dict.admin.marketplace.back}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => onConfirmReject(p.id)}
                      loading={pendingId === p.id}
                    >
                      {dict.admin.marketplace.confirmReject}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRejecting(p.id)}
                    disabled={pendingId === p.id}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={14}
                      strokeWidth={1.5}
                    />
                    <span className="ms-1.5">
                      {dict.admin.marketplace.rejectCta}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(p.id)}
                    loading={pendingId === p.id}
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      strokeWidth={1.5}
                    />
                    <span className="ms-1.5">
                      {dict.admin.marketplace.approveCta}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}
