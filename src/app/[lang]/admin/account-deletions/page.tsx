import { notFound } from "next/navigation";
import { AdminScope, DeletionRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { DeletionQueue } from "./_components/deletion-queue";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/account-deletions">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.accountDeletions.title };
}

export default async function AdminAccountDeletionsPage({
  params,
}: PageProps<"/[lang]/admin/account-deletions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.USERS);
  const dict = await getDictionary(lang);

  const requests = await prisma.accountDeletionRequest.findMany({
    where: { status: DeletionRequestStatus.PENDING },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      reason: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          organization: { select: { displayName: true } },
        },
      },
    },
  });

  const rows = requests.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
    userName: `${r.user.firstName} ${r.user.lastName}`.trim(),
    userEmail: r.user.email,
    userRole: r.user.role,
    orgName: r.user.organization.displayName,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.accountDeletions.eyebrow}
        title={dict.admin.accountDeletions.title}
        description={dict.admin.accountDeletions.description}
      />
      <DeletionQueue rows={rows} />
    </div>
  );
}
