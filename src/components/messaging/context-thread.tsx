import "server-only";
import { ThreadContextType } from "@prisma/client";
import { requireAuth } from "@/lib/permissions/guards";
import { canAccessThreadContext } from "@/lib/messaging/participants";
import { getOrCreateThread } from "@/lib/messaging/threads";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { MaximizableThread } from "./maximizable-thread";

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
    <MaximizableThread
      threadId={thread.id}
      title={title ?? dict.messaging.sectionTitle}
      hint={dict.messaging.contextHints[contextType]}
      contextType={contextType}
    />
  );
}
