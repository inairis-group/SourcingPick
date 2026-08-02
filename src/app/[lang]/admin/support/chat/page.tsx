import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { listGuestConversations } from "@/lib/support/guest-chat";
import { GuestReplyForm } from "./_components/reply-form";
import { cn } from "@/lib/utils";

/**
 * Public-chat queue — the team side of the marketing-site widget.
 *
 * Kept separate from the support-ticket queue at /admin/support: those are
 * raised by authenticated customers and carry an org, a requester and a
 * status machine. These are anonymous pre-sales enquiries with none of that,
 * and folding them together would mean nullable columns on both sides.
 *
 * Unhandled first — an unanswered visitor is the only thing here with a clock
 * on it.
 */
export default async function AdminGuestChatPage({
  params,
}: PageProps<"/[lang]/admin/support/chat">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);
  const t = dict.marketing.contact as unknown as Record<string, string>;

  const conversations = await listGuestConversations();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-headline mb-6 text-2xl font-bold tracking-tight">
        {t.chatQueueTitle}
      </h1>

      {conversations.length === 0 ? (
        <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
          {t.chatQueueEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((c) => (
            <article
              key={c.id}
              className="border-line bg-surface rounded-lg border p-5"
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-headline text-sm font-semibold">
                    {c.name}
                  </p>
                  {/* The email is the only way to reach them if they close the
                      tab — the token lives in their browser, not ours. */}
                  <p className="text-muted font-mono text-xs">{c.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-faint text-xs uppercase">
                    {c.locale}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium",
                      c.handledAt
                        ? "border-line bg-subtle text-muted"
                        : "border-warning-edge bg-warning-soft text-warning",
                    )}
                  >
                    {c.handledAt ? t.chatHandled : t.chatUnhandled}
                  </span>
                </div>
              </header>

              <ol className="flex flex-col gap-2">
                {c.messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.fromTeam
                        ? "bg-info-soft text-info self-end"
                        : "bg-subtle text-fg self-start",
                    )}
                  >
                    <p className="text-[10px] opacity-70">
                      {m.fromTeam ? t.chatTeam : c.name} ·{" "}
                      {formatDate(m.createdAt, lang)}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ol>

              <GuestReplyForm
                conversationId={c.id}
                label={t.chatReplyLabel}
                send={t.chatSend}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
