"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdminScope, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Server actions for granting / revoking admin scopes on a user.
 * Gated behind the USERS scope — only the people who can edit users
 * can re-jig their permissions. SUPER admins can always do this
 * (hasAdminScope short-circuits SUPER).
 *
 * Edge cases enforced server-side:
 *   - Target must be an ADMIN. Granting scopes to a CLIENT / FACTORY /
 *     AGENT is a no-op (they never enter the requireAdminScope path).
 *   - You can't strip yourself of USERS while logged in — would lock
 *     yourself out of this very page.
 *   - At least one user must keep SUPER at all times — prevents a
 *     reckless click from leaving the platform with no super-admin.
 */

export type ScopeResult = { ok: true } | { ok: false; error: string };

const UpdateSchema = z.object({
  scopes: z.array(z.nativeEnum(AdminScope)).max(20),
});

export async function updateAdminScopesAction(
  userId: string,
  input: { scopes: AdminScope[] },
): Promise<ScopeResult> {
  const actor = await requireAdminScope(AdminScope.USERS);
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid scopes payload." };
  }
  const requested = unique(parsed.data.scopes);

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, adminScopes: true },
  });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role !== Role.ADMIN) {
    return {
      ok: false,
      error: "Only admins can hold permission scopes.",
    };
  }

  // Self-lockout guards.
  if (target.id === actor.id) {
    if (!requested.includes(AdminScope.USERS) && !requested.includes(AdminScope.SUPER)) {
      return {
        ok: false,
        error:
          "You can't remove your own USERS scope — that would lock you out of this page. Ask another admin to do it.",
      };
    }
  }

  // Last-SUPER guard. If the target currently has SUPER and the
  // requested scopes don't, count remaining SUPERs *after* this change.
  if (
    target.adminScopes.includes(AdminScope.SUPER) &&
    !requested.includes(AdminScope.SUPER)
  ) {
    const otherSupers = await prisma.user.count({
      where: {
        id: { not: target.id },
        role: Role.ADMIN,
        adminScopes: { has: AdminScope.SUPER },
        deletedAt: null,
      },
    });
    if (otherSupers === 0) {
      return {
        ok: false,
        error:
          "At least one super-admin must remain. Promote another admin to SUPER first.",
      };
    }
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { adminScopes: { set: requested } },
  });

  await writeAuditLog({
    actorUserId: actor.id,
    action: "admin.scopes_updated",
    targetType: "User",
    targetId: target.id,
    payload: {
      from: target.adminScopes,
      to: requested,
    },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/users", "page");
  revalidatePath("/[lang]/admin/users/[id]", "page");
  return { ok: true };
}

function unique<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}
