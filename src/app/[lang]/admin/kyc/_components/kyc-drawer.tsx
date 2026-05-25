"use client";

import { Fragment, useState, useTransition } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { KycStatus, type KycDocumentKind } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download01Icon,
  FileVerifiedIcon,
  Image01Icon,
  PdfIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  approveKycAction,
  flagKycAction,
  rejectKycAction,
} from "@/lib/admin/kyc-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import type { QueueOrg } from "./kyc-queue";

type Props = {
  org: QueueOrg | null;
  open: boolean;
  onClose: () => void;
};

type Mode = "view" | "rejecting" | "flagging";

export function KycDrawer({ org, open, onClose }: Props) {
  const dict = useDictionary();
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("view");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!org) return null;

  const reset = () => {
    setMode("view");
    setReason("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveKycAction(org.id);
      if (result.ok) handleClose();
      else setError(result.error);
    });
  };

  const onConfirmReject = () => {
    if (!reason.trim()) {
      setError(dict.admin.kyc.errorReasonRequired);
      return;
    }
    startTransition(async () => {
      const result = await rejectKycAction(org.id, reason);
      if (result.ok) handleClose();
      else setError(result.error);
    });
  };

  const onConfirmFlag = () => {
    if (!reason.trim()) {
      setError(dict.admin.kyc.errorReasonRequired);
      return;
    }
    startTransition(async () => {
      const result = await flagKycAction(org.id, reason);
      if (result.ok) handleClose();
      else setError(result.error);
    });
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-modal">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-base ease-default"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-fast ease-default"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-overlay" aria-hidden />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-slow ease-emphasize"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-base ease-default"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="w-full max-w-2xl h-full bg-page shadow-lg overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-page/95 backdrop-blur-md border-b border-line px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-1">
                    {dict.admin.kyc.drawerEyebrow}
                  </p>
                  <h2 className="text-xl font-bold text-headline tracking-tight truncate">
                    {org.displayName}
                  </h2>
                  <p className="text-xs text-muted truncate">{org.legalName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={dict.common.actions.close}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-ghost-hover text-faint hover:text-fg transition-colors duration-fast"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {error && <FormError>{error}</FormError>}

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-faint">
                    {dict.admin.kyc.colStatus}
                  </span>
                  <StatusBadge status={org.kycStatus} dict={dict} />
                </div>

                {/* Owner contact */}
                <DetailGroup title={dict.admin.kyc.sectionContact}>
                  {org.users[0] ? (
                    <>
                      <DetailRow
                        label={dict.admin.kyc.contactName}
                        value={`${org.users[0].firstName} ${org.users[0].lastName}`}
                      />
                      <DetailRow
                        label={dict.admin.kyc.contactEmail}
                        value={org.users[0].email}
                      />
                    </>
                  ) : (
                    <p className="text-sm text-muted">{dict.admin.kyc.noOwner}</p>
                  )}
                </DetailGroup>

                {/* Company */}
                <DetailGroup title={dict.admin.kyc.sectionCompany}>
                  <DetailRow
                    label={dict.auth.signup.legalNameLabel}
                    value={org.legalName}
                  />
                  <DetailRow
                    label={dict.auth.signup.addressLabel}
                    value={`${org.address}, ${org.city}, ${org.country}`}
                  />
                  <DetailRow
                    label={dict.auth.signup.vatLabel}
                    value={org.vatNumber || "—"}
                  />
                  <DetailRow
                    label={dict.admin.kyc.submittedAt}
                    value={formatDate(org.createdAt, locale, "medium")}
                  />
                </DetailGroup>

                {/* Manufacturing */}
                <DetailGroup title={dict.admin.kyc.sectionManufacturing}>
                  <DetailRow
                    label={dict.auth.signup.categoryLabel}
                    value={
                      org.factoryProfile
                        ? dict.categories[org.factoryProfile.category]
                        : "—"
                    }
                  />
                  <DetailRow
                    label={dict.auth.signup.capabilitiesLabel}
                    value={
                      org.factoryProfile && org.factoryProfile.capabilities.length > 0
                        ? org.factoryProfile.capabilities.join(", ")
                        : "—"
                    }
                  />
                </DetailGroup>

                {/* Documents */}
                <DetailGroup title={dict.admin.kyc.sectionDocuments}>
                  {org.kycDocuments.length === 0 ? (
                    <p className="text-sm text-muted">
                      {dict.admin.kyc.noDocuments}
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {org.kycDocuments.map((doc) => (
                        <DocumentRow key={doc.id} doc={doc} dict={dict} />
                      ))}
                    </ul>
                  )}
                </DetailGroup>
              </div>

              {/* Actions footer */}
              <div className="sticky bottom-0 bg-page border-t border-line px-6 py-4">
                {mode === "view" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={onApprove}
                      loading={pending}
                      disabled={org.kycStatus === KycStatus.VERIFIED}
                      leftIcon={
                        <HugeiconsIcon
                          icon={FileVerifiedIcon}
                          size={16}
                          strokeWidth={1.5}
                        />
                      }
                    >
                      {dict.admin.kyc.approve}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setMode("flagging");
                        setError(null);
                      }}
                      disabled={pending || org.kycStatus === KycStatus.FLAGGED}
                    >
                      {dict.admin.kyc.flag}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      onClick={() => {
                        setMode("rejecting");
                        setError(null);
                      }}
                      disabled={pending || org.kycStatus === KycStatus.REJECTED}
                    >
                      {dict.admin.kyc.reject}
                    </Button>
                  </div>
                )}

                {(mode === "rejecting" || mode === "flagging") && (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-fg">
                      {mode === "rejecting"
                        ? dict.admin.kyc.rejectReasonLabel
                        : dict.admin.kyc.flagReasonLabel}
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder={dict.admin.kyc.reasonPlaceholder}
                      className={cn(
                        "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-sm resize-y",
                        "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
                        "transition-colors duration-fast",
                      )}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant={mode === "rejecting" ? "danger" : "primary"}
                        size="md"
                        onClick={mode === "rejecting" ? onConfirmReject : onConfirmFlag}
                        loading={pending}
                      >
                        {mode === "rejecting"
                          ? dict.admin.kyc.confirmReject
                          : dict.admin.kyc.confirmFlag}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={reset}
                        disabled={pending}
                      >
                        {dict.common.actions.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2">
        {title}
      </h3>
      <div className="rounded-md border border-line bg-subtle divide-y divide-line-subtle">
        {children}
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 px-4 py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-faint sm:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-fg sm:col-span-2 break-words">{value}</dd>
    </div>
  );
}

function DocumentRow({
  doc,
  dict,
}: {
  doc: QueueOrg["kycDocuments"][number];
  dict: ReturnType<typeof useDictionary>;
}) {
  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";
  const kindLabel = dict.admin.kyc.docKinds[doc.kind as KycDocumentKind];
  const href = `/api/admin/kyc-document/${doc.id}`;

  return (
    <li className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2">
      <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md bg-brand-50 text-brand-700">
        <HugeiconsIcon
          icon={isImage ? Image01Icon : isPdf ? PdfIcon : FileVerifiedIcon}
          size={16}
          strokeWidth={1.5}
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-faint">
          {kindLabel}
        </p>
        <p className="text-sm text-fg truncate">{doc.fileName}</p>
      </div>
      <span className="text-xs text-muted whitespace-nowrap">
        {formatBytes(doc.sizeBytes)}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-faint hover:text-fg hover:bg-ghost-hover transition-colors duration-fast"
        aria-label={dict.admin.kyc.openDocument}
      >
        <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={1.5} />
      </a>
    </li>
  );
}

function StatusBadge({
  status,
  dict,
}: {
  status: KycStatus;
  dict: ReturnType<typeof useDictionary>;
}) {
  const map: Record<KycStatus, { label: string; classes: string }> = {
    PENDING: {
      label: dict.common.status.pending,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    FLAGGED: {
      label: dict.common.status.flagged,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    VERIFIED: {
      label: dict.common.status.verified,
      classes: "bg-success-soft text-success border-success-edge",
    },
    REJECTED: {
      label: dict.common.status.rejected,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide",
        classes,
      )}
    >
      {label}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
