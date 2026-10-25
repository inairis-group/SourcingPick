import { notFound } from "next/navigation";
import { AdminScope, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { ADMIN_SCOPE_DOC } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { AdminScopeEditor } from "./_components/scope-editor";
import { StartDirectButton } from "@/components/messaging/start-direct-button";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/users/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const u = await prisma.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  return { title: u ? `${u.firstName} ${u.lastName}` : "User" };
}

export default async function AdminUserDetailPage({
  params,
}: PageProps<"/[lang]/admin/users/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const actor = await requireAdminScope(AdminScope.USERS);
  const dict = await getDictionary(lang);
  const t = dict.admin.users;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      subRole: true,
      adminScopes: true,
      twoFactorEnabled: true,
      lastSeenAt: true,
      createdAt: true,
      organization: { select: { displayName: true, type: true, clientCode: true } },
    },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/users`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {t.backToList}
      </Link>

      <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {user.role} · {user.subRole}
          </p>
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-muted">
            {user.email} · {user.organization.displayName}
            {user.organization.clientCode && <span className="font-mono"> · {user.organization.clientCode}</span>}
          </p>
          <p className="text-xs text-faint mt-1">
            {t.createdOn} {formatDate(user.createdAt, lang, "medium")}
            {user.lastSeenAt && (
              <>
                {" · "}
                {t.lastSeenOn} {formatDate(user.lastSeenAt, lang, "medium")}
              </>
            )}
            {" · "}
            {user.twoFactorEnabled ? t.twoFaOn : t.twoFaOff}
          </p>
        </div>
        {/* Partner #30: admin needs to be able to message any user
            directly without going through a request/order context. */}
        {user.id !== actor.id && <StartDirectButton otherUserId={user.id} />}
      </header>

      {user.role === Role.ADMIN ? (
        <section className="rounded-lg border border-line bg-surface p-5 mb-6">
          <h2 className="text-sm font-semibold text-headline mb-1">
            {t.scopesTitle}
          </h2>
          <p className="text-xs text-muted mb-4">{t.scopesBody}</p>
          <AdminScopeEditor
            userId={user.id}
            isSelf={user.id === actor.id}
            initial={user.adminScopes}
            scopeDoc={ADMIN_SCOPE_DOC}
            labels={{
              SUPER: t.scopes.SUPER,
              KYC: t.scopes.KYC,
              MARKETPLACE: t.scopes.MARKETPLACE,
              FINANCE: t.scopes.FINANCE,
              SUPPORT: t.scopes.SUPPORT,
              DISPUTES: t.scopes.DISPUTES,
              REQUESTS: t.scopes.REQUESTS,
              USERS: t.scopes.USERS,
              WEBHOOKS: t.scopes.WEBHOOKS,
              SETTINGS: t.scopes.SETTINGS,
              AGENTS: t.scopes.AGENTS,
              AUDIT: t.scopes.AUDIT,
            }}
            ui={{
              saveCta: t.scopesSaveCta,
              superHint: t.scopesSuperHint,
              surfacesLabel: t.scopesSurfacesLabel,
            }}
          />
        </section>
      ) : (
        <div className="rounded-lg border border-line bg-subtle/40 p-5 text-sm text-muted">
          {t.notAdminBody}
        </div>
      )}
    </div>
  );
}
