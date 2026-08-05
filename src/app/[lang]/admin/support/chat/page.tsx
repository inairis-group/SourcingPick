import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listGuestConversations } from "@/lib/support/guest-chat";
import { GuestChatInbox } from "./_components/chat-inbox";

/**
 * Public-chat queue — the team side of the marketing-site widget.
 *
 * Kept separate from the support-ticket queue at /admin/support: those are
 * raised by authenticated customers and carry an org, a requester and a status
 * machine. These are anonymous pre-sales enquiries with none of that, and
 * folding them together would mean nullable columns on both sides.
 *
 * The bridge between the two is escalation: once a visitor's email resolves to
 * a real account, the conversation can become a ticket — or, for a buyer with
 * an order, a dispute.
 */
export default async function AdminGuestChatPage({
  params,
}: PageProps<"/[lang]/admin/support/chat">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);
  const t = dict.admin.guestChat;

  const conversations = await listGuestConversations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-headline text-2xl font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="text-muted mt-1 max-w-2xl text-sm">{t.description}</p>
      </header>

      {/* Server-rendered for the first paint, then kept current by the client
          component — a pre-sales chat that only updates on reload is a chat
          the visitor has already given up on. */}
      <GuestChatInbox
        initial={conversations}
        lang={lang}
        copy={t as unknown as Record<string, string>}
        teamLabels={t.teams}
        statusLabels={t.statuses}
      />
    </div>
  );
}
