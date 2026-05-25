import { SubRole } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";

type Props = {
  organizationId: string;
  locale: Locale;
};

/**
 * Read-only member list for an organisation. The "invite a member" flow
 * needs an email-invite handshake + accept page — deferred to a follow-up.
 * For now this surface lists current members so OWNERS can see who's on
 * the account.
 */
export async function MembersList({ organizationId, locale }: Props) {
  if (!isLocale(locale)) return null;
  const dict = await getDictionary(locale);

  const members = await prisma.user.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: [{ subRole: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      subRole: true,
      lastSeenAt: true,
    },
  });

  const subRoleLabel = (sub: SubRole): string => {
    switch (sub) {
      case SubRole.OWNER:
        return dict.settings.members.subRoleOwner;
      case SubRole.MEMBER:
        return dict.settings.members.subRoleMember;
      case SubRole.ACCOUNTANT:
        return dict.settings.members.subRoleAccountant;
      case SubRole.AGENT:
      case SubRole.SENIOR:
      case SubRole.SUPER:
        return sub;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-line-subtle rounded-md border border-line bg-subtle">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-fg truncate">
                {m.firstName} {m.lastName}
              </p>
              <p className="text-xs text-faint truncate">{m.email}</p>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-faint whitespace-nowrap">
              {subRoleLabel(m.subRole)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-faint">{dict.settings.members.inviteSoon}</p>
    </div>
  );
}
