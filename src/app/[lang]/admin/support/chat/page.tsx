import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listGuestConversations } from "@/lib/support/guest-chat";
import { GuestChatQueue } from "./_components/chat-queue";

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

      {/* Rendered on the server for the first paint, then kept current by
          the client component — a pre-sales chat that only updates on
          reload is a chat the visitor has already given up on. */}
      <GuestChatQueue initial={conversations} lang={lang} copy={t} />
    </div>
  );
}
