import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { Logo } from "@/components/marketing/logo";
import { ForwarderUploadForm } from "./_components/forwarder-upload-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/forwarder/upload/[token]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.forwarder.metaTitle };
}

export default async function ForwarderUploadPage({
  params,
}: PageProps<"/[lang]/forwarder/upload/[token]">) {
  const { lang, token } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.forwarder;

  const tokenRow = await prisma.forwarderUploadToken.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      label: true,
      expiresAt: true,
      revokedAt: true,
      uploadCount: true,
      lastUsedAt: true,
      order: {
        select: {
          id: true,
          reference: true,
          status: true,
          deletedAt: true,
          estimatedEta: true,
          trackingCarrier: true,
          trackingNumber: true,
          request: {
            select: {
              title: true,
              quantity: true,
              deliveryAddress: true,
              incoterm: true,
            },
          },
          factoryOrg: {
            select: { displayName: true, country: true, city: true },
          },
          clientOrg: {
            select: { displayName: true, country: true, city: true },
          },
        },
      },
    },
  });

  // Treat unknown / soft-deleted-order tokens as "not found" to avoid
  // leaking that a specific token string ever existed.
  if (!tokenRow || tokenRow.order.deletedAt) {
    return (
      <ForwarderShell logoLabel={t.brandSr}>
        <Notice
          tone="danger"
          title={t.invalidTitle}
          body={t.invalidBody}
        />
      </ForwarderShell>
    );
  }

  const now = new Date();
  const isRevoked = tokenRow.revokedAt !== null;
  const isExpired = tokenRow.expiresAt < now;

  return (
    <ForwarderShell logoLabel={t.brandSr}>
      <header className="flex flex-col gap-2 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t.eyebrow}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-headline tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-muted leading-relaxed max-w-prose">
          {t.body}
        </p>
      </header>

      <section className="rounded-lg border border-line bg-surface p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <HugeiconsIcon icon={PackageIcon} size={18} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
              {tokenRow.order.reference}
            </p>
            <h2 className="text-base font-semibold text-headline">
              {tokenRow.order.request.title}
            </h2>
            {tokenRow.label && (
              <p className="text-xs text-muted mt-0.5">{tokenRow.label}</p>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-line-subtle">
          <Detail label={t.factory}>
            {tokenRow.order.factoryOrg.displayName} ·{" "}
            {tokenRow.order.factoryOrg.city},{" "}
            {tokenRow.order.factoryOrg.country}
          </Detail>
          <Detail label={t.client}>
            {tokenRow.order.clientOrg.displayName} ·{" "}
            {tokenRow.order.clientOrg.country}
          </Detail>
          <Detail label={t.quantity}>
            {tokenRow.order.request.quantity}
          </Detail>
          <Detail label={t.incoterm}>
            {tokenRow.order.request.incoterm}
          </Detail>
          <Detail label={t.deliveryAddress}>
            {tokenRow.order.request.deliveryAddress}
          </Detail>
          {tokenRow.order.estimatedEta && (
            <Detail label={t.eta}>
              {formatDate(tokenRow.order.estimatedEta, lang, "medium")}
            </Detail>
          )}
        </dl>
      </section>

      {isRevoked ? (
        <Notice tone="danger" title={t.revokedTitle} body={t.revokedBody} />
      ) : isExpired ? (
        <Notice tone="danger" title={t.expiredTitle} body={t.expiredBody} />
      ) : (
        <>
          <section className="rounded-lg border border-line bg-surface p-5 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-2">
              {t.uploadTitle}
            </h2>
            <p className="text-xs text-muted mb-4 leading-relaxed max-w-prose">
              {t.uploadBody}
            </p>
            <ForwarderUploadForm token={tokenRow.token} />
            <p className="text-[11px] text-faint mt-3">
              {t.expiresOn.replace(
                "{date}",
                formatDate(tokenRow.expiresAt, lang, "medium"),
              )}
              {tokenRow.uploadCount > 0 && (
                <>
                  {" · "}
                  {t.alreadyUploaded.replace(
                    "{n}",
                    String(tokenRow.uploadCount),
                  )}
                </>
              )}
            </p>
          </section>
        </>
      )}

      <p className="text-[11px] text-faint text-center mt-12">
        {t.footerNote}
      </p>
    </ForwarderShell>
  );
}

function ForwarderShell({
  logoLabel,
  children,
}: {
  logoLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="border-b border-line-subtle">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4">
          <Logo height={28} />
          <span className="sr-only">{logoLabel}</span>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </dt>
      <dd className="text-sm text-fg sm:col-span-2 wrap-break-word">
        {children}
      </dd>
    </div>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: "success" | "danger";
  title: string;
  body: string;
}) {
  const Icon =
    tone === "success" ? CheckmarkCircle02Icon : AlertCircleIcon;
  return (
    <div
      className={
        tone === "success"
          ? "rounded-md border border-success-edge bg-success-soft px-4 py-3 flex items-start gap-3"
          : "rounded-md border border-danger-edge bg-danger-soft px-4 py-3 flex items-start gap-3"
      }
    >
      <HugeiconsIcon
        icon={Icon}
        size={16}
        strokeWidth={2}
        className={tone === "success" ? "text-success mt-0.5" : "text-danger mt-0.5"}
      />
      <div className="min-w-0">
        <p
          className={
            tone === "success"
              ? "text-sm font-semibold text-success"
              : "text-sm font-semibold text-danger"
          }
        >
          {title}
        </p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

