import { adminSession } from "@/lib/admin-auth.functions";

export type Role = "admin" | "agent" | "client";
export type Account = { id: string; name: string; email: string; role: Role };

type Snapshot = { ready: boolean; user: Account | null };

let current: Snapshot | null = null;
let pending: Promise<Snapshot> | null = null;

function normalize(session: { ready: boolean; user: { id: string; name: string; email: string; role: string } | null }): Snapshot {
  if (!session.user) return { ready: session.ready, user: null };
  const role: Role = session.user.role === "agent" || session.user.role === "client" ? session.user.role : "admin";
  return { ready: session.ready, user: { ...session.user, role } };
}

export function peekSession() {
  return current;
}

export function clearSession() {
  current = null;
  pending = null;
}

export function loadSession(force = false) {
  if (!force && current) return Promise.resolve(current);
  if (!force && pending) return pending;
  const request = adminSession()
    .then((session) => {
      const snapshot = normalize(session);
      current = snapshot.user ? snapshot : null;
      return snapshot;
    })
    .finally(() => {
      if (pending === request) pending = null;
    });
  pending = request;
  return request;
}
