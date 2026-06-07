"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Link04Icon,
  TickDouble02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import {
  createForwarderUploadTokenAction,
  revokeForwarderUploadTokenAction,
} from "@/lib/orders/forwarder-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export type ForwarderToken = {
  id: string;
  token: string;
  label: string | null;
  expiresAt: Date;
  lastUsedAt: Date | null;
  uploadCount: number;
  createdAt: Date;
};

/**
 * Forwarder magic-link panel (partner item #15). Lists every active and
 * recently-used token for the order, with a copy-to-clipboard button,
 * an "extend / regenerate" path that just creates a new token, and a
 * revoke action. The form below the list creates a fresh link.
 */
export function ForwarderLinkPanel({
  orderId,
  tokens,
  baseUrl,
  canCreate,
}: {
  orderId: string;
  tokens: ForwarderToken[];
  baseUrl: string;
  canCreate: boolean;
}) {
  const dict = useDictionary();
  const lang = useLocale();
  const router = useRouter();
  const t = dict.factory.orders.forwarder;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [label, setLabel] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const buildUrl = (token: string) =>
    `${baseUrl}/${lang}/forwarder/upload/${token}`;

  const onCopy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(buildUrl(token));
      setCopiedToken(token);
      setTimeout(() => setCopiedToken((c) => (c === token ? null : c)), 1800);
    } catch {
      setError(t.copyError);
    }
  };

  const onCreate = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await createForwarderUploadTokenAction(orderId, label);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setLabel("");
      router.refresh();
      // Auto-copy the newly-minted link to save the factory a click.
      try {
        await navigator.clipboard.writeText(buildUrl(r.token));
        setCopiedToken(r.token);
        setTimeout(
          () => setCopiedToken((c) => (c === r.token ? null : c)),
          1800,
        );
      } catch {
        /* clipboard rejected — fine, the link is in the list */
      }
    });
  };

  const onRevoke = (tokenId: string) => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await revokeForwarderUploadTokenAction(tokenId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="mt-6 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {t.title}
          </h2>
          <p className="text-xs text-muted max-w-prose leading-snug">
            {t.body}
          </p>
        </div>
      </div>

      {error && <FormError className="mb-3">{error}</FormError>}

      {tokens.length > 0 && (
        <ul className="flex flex-col gap-2 mb-4">
          {tokens.map((tok) => {
            const url = buildUrl(tok.token);
            const isCopied = copiedToken === tok.token;
            return (
              <li
                key={tok.id}
                className="rounded-md border border-line bg-subtle/40 p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    {tok.label && (
                      <p className="text-sm font-medium text-headline truncate">
                        {tok.label}
                      </p>
                    )}
                    <p className="text-[11px] text-muted">
                      {t.expiresOn.replace(
                        "{date}",
                        formatDate(tok.expiresAt, lang, "short"),
                      )}
                    </p>
                    {tok.lastUsedAt && (
                      <p className="text-[11px] text-success">
                        {t.lastUsedOn.replace(
                          "{date}",
                          formatDate(tok.lastUsedAt, lang, "short"),
                        )}{" "}
                        ·{" "}
                        {t.uploadCount.replace(
                          "{n}",
                          String(tok.uploadCount),
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevoke(tok.id)}
                    disabled={pending}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={12}
                      strokeWidth={1.5}
                    />
                    <span className="ms-1.5">{t.revoke}</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 text-[11px] font-mono text-fg bg-surface border border-line-subtle rounded px-2 py-1.5 truncate">
                    {url}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onCopy(tok.token)}
                  >
                    <HugeiconsIcon
                      icon={isCopied ? TickDouble02Icon : Copy01Icon}
                      size={12}
                      strokeWidth={1.5}
                      className={cn(isCopied && "text-success")}
                    />
                    <span className="ms-1.5">
                      {isCopied ? t.copied : t.copy}
                    </span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canCreate && (
        <div className="flex items-end gap-2 flex-wrap pt-4 border-t border-line-subtle">
          <div className="flex-1 min-w-50">
            <label className="block text-xs font-medium uppercase tracking-wide text-faint mb-1">
              {t.labelLabel}
            </label>
            <Input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t.labelPlaceholder}
              maxLength={120}
              inputSize="sm"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onCreate}
            loading={pending}
          >
            <HugeiconsIcon icon={Link04Icon} size={14} strokeWidth={1.5} />
            <span className="ms-1.5">{t.createCta}</span>
          </Button>
        </div>
      )}

      {!canCreate && tokens.length === 0 && (
        <p className="text-xs text-muted">{t.notYetAvailable}</p>
      )}
    </section>
  );
}
