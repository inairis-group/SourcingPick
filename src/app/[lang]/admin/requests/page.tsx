import { notFound } from "next/navigation";
import { Role, SourcingRequestOrigin, SourcingStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { DispatchTable } from "./_components/dispatch-table";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.dispatch.title };
}

export default async function AdminRequestsPage({
  params,
}: PageProps<"/[lang]/admin/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);

  const [requests, agents] = await Promise.all([
    prisma.sourcingRequest.findMany({
      where: {
        // Marketplace-synthetic requests live in this table too — keep them
        // out of the dispatch queue regardless of status.
        origin: SourcingRequestOrigin.SOURCING_FLOW,
        status: {
          in: [SourcingStatus.REQUEST_RECEIVED, SourcingStatus.ASSIGNED],
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        reference: true,
        title: true,
        category: true,
        quantity: true,
        budgetCents: true,
        deadline: true,
        createdAt: true,
        assignedAt: true,
        sourcingRegion: true,
        status: true,
        agentId: true,
        clientOrg: { select: { displayName: true, country: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.AGENT, deletedAt: null },
      orderBy: [{ subRole: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subRole: true,
        _count: {
          select: {
            agentForRequests: {
              where: {
                status: {
                  notIn: [
                    SourcingStatus.COMPLETED,
                    SourcingStatus.CANCELLED,
                    SourcingStatus.QUOTE_REJECTED,
                  ],
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const agentOptions = agents.map((a) => ({
    id: a.id,
    name: `${a.firstName} ${a.lastName}`,
    email: a.email,
    subRole: a.subRole,
    activeLoad: a._count.agentForRequests,
    // Spec §Acteurs caps senior at 15 + junior at 10. We surface those.
    maxLoad: a.subRole === "SENIOR" ? 15 : 10,
  }));

  return <DispatchTable requests={requests} agents={agentOptions} />;
}
