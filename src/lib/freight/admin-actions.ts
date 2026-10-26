"use server";

import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { estimateFreight, type FreightEstimate } from "./estimate";
import { parseFreightRequest } from "./request";

/**
 * The team's freight calculator (/admin/freight-calculator, and the agents'
 * /agent/freight-calculator): the same request and the same engine as the
 * public simulator, with the price returned to the screen instead of
 * e-mailed. Administrators and agents only — the rates stay on the server
 * for everybody else.
 *
 * Every export is an async server action — this file is covered by
 * `scripts/check-use-server.ts`.
 */
export async function calculateFreightAsAdmin(raw: unknown): Promise<FreightEstimate | { ok: false; reason: "invalid" }> {
  await requireRole(Role.ADMIN, Role.AGENT);
  const request = parseFreightRequest(raw);
  if (!request) return { ok: false, reason: "invalid" };
  return estimateFreight(request);
}
