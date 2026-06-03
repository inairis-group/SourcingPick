import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireAuth } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { NewSupportTicketForm } from "./_components/new-support-ticket-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/support/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.support.newTitle };
}

export default async function NewSupportTicketPage({
  params,
}: PageProps<"/[lang]/support/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireAuth();
  if (user.role === Role.ADMIN) {
    redirect(`/${lang}/admin/support`);
  }
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/messages`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.support.backToMessages}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.support.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.support.newTitle}
        </h1>
        <p className="text-sm text-muted max-w-prose">
          {dict.support.newDescription}
        </p>
      </header>

      <NewSupportTicketForm />
    </div>
  );
}
