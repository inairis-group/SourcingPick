"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  PackageIcon,
  Store01Icon,
  ChartLineData01Icon,
  Building01Icon,
  UserGroup02Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { SupportTopicKind } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { useDictionary } from "@/lib/i18n/client-provider";
import type { SupportTopicView } from "@/lib/support/queries";
import { cn } from "@/lib/utils";

/**
 * Server-component-safe topic card — no client state, just rendering.
 * The dict hook is sync and works in RSC because of our client-provider
 * pattern (read via component prop on the server).
 *
 * Kept dumb on purpose: the admin-side topic picker lives in
 * `support-admin-controls` so this card stays focused on display.
 */
const ICONS: Record<SupportTopicKind, typeof ShoppingBag01Icon> = {
  ORDER: PackageIcon,
  SOURCING_REQUEST: ShoppingBag01Icon,
  MARKETPLACE_PRODUCT: Store01Icon,
  AUCTION: ChartLineData01Icon,
  CLIENT_ORG: Building01Icon,
  FACTORY_ORG: Building01Icon,
  AGENT: UserGroup02Icon,
};

export function SupportTopicCard({ topic }: { topic: SupportTopicView }) {
  const dict = useDictionary();
  const t = dict.support;
  const Icon = ICONS[topic.kind];

  const body = (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          topic.missing
            ? "bg-subtle text-faint"
            : "bg-brand-50 text-brand-700",
        )}
      >
        <HugeiconsIcon
          icon={topic.missing ? AlertCircleIcon : Icon}
          size={18}
          strokeWidth={1.5}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">
          {t.topicKinds[topic.kind]}
        </p>
        <p
          className={cn(
            "text-sm font-semibold leading-snug",
            topic.missing ? "text-muted line-through" : "text-headline",
          )}
        >
          {topic.title}
        </p>
        {!topic.missing && topic.subtitle && (
          <p className="text-xs text-muted mt-0.5 truncate">
            {topic.subtitle}
          </p>
        )}
        {topic.missing && (
          <p className="text-xs text-warning mt-0.5">{t.topicMissing}</p>
        )}
      </div>
      {topic.href && !topic.missing && (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          strokeWidth={1.5}
          className="text-faint mt-1 shrink-0 rtl:rotate-180"
        />
      )}
    </div>
  );

  if (topic.missing || !topic.href) {
    return <div className="mb-4">{body}</div>;
  }

  return (
    <Link
      href={topic.href}
      variant="muted"
      className="block mb-4 hover:opacity-90 transition-opacity duration-fast"
    >
      {body}
    </Link>
  );
}
