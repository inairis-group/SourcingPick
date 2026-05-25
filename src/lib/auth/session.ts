import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client";

/**
 * Returns the active session (or null) — thin wrapper around Auth.js `auth()`
 * for places that prefer a tidier name.
 */
export async function getSession() {
  return auth();
}

/**
 * Returns the active user with their organization joined, or null. Use this
 * in pages/layouts/actions that need domain fields (role, subRole, orgId)
 * beyond what's in the JWT session.
 */
export async function getCurrentUser(): Promise<(User & { organization: { id: string; type: string; displayName: string } }) | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email, deletedAt: null },
    include: {
      organization: { select: { id: true, type: true, displayName: true } },
    },
  });
}
