import "server-only";
import { ThreadContextType } from "@prisma/client";
import { requireAuth } from "@/lib/permissions/guards";
import { canAccessThreadContext } from "@/lib/messaging/participants";
import { getOrCreateThread } from "@/lib/messaging/threads";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { MessageThread } from "./message-thread";

/**
 * Server wrapper that resolves access + lazy-creates the thread for a
 * given context, then mounts the client MessageThread. Render this inside
 * each detail page that needs in-line messaging — it keeps the per-page
 * boilerplate to a single line.
 */
export async function ContextThread({
  contextType,
  contextId,
  lang,
  title,
}: {
  contextType: ThreadContextType;
  contextId: string;
  lang: Locale;
  /** Optional override; defaults to the dict's context title. */
  title?: string;
}) {
  const user = await requireAuth();
  const allowed = await canAccessThreadContext(contextType, contextId, user);
  const dict = await getDictionary(lang);
  if (!allowed) return null;

  const thread = await getOrCreateThread(contextType, contextId, user.id);

  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
        {title ?? dict.messaging.sectionTitle}
      </h2>
      <p className="text-xs text-muted mb-3">
        {dict.messaging.contextHints[contextType]}
      </p>
      <MessageThread threadId={thread.id} />
    </section>
  );
}
