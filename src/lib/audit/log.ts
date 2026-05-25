import "server-only";
import { AuditLevel, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Append-only audit log writer.
 *
 * Every sensitive action — auth events, KYC decisions, escrow movements,
 * commission overrides, role changes — should call this. The Admin audit
 * viewer (Phase 6) reads from this table; never deleted, never updated.
 *
 * Action naming convention: dot-separated namespaces, lowercase, past-tense:
 *   "auth.login"           "auth.login_failed"     "auth.2fa_verified"
 *   "kyc.submitted"        "kyc.validated"         "kyc.flagged"
 *   "request.assigned"     "request.status_changed"
 *   "quote.sent_to_client" "quote.margin_overridden"
 *   "escrow.funded"        "escrow.released"       "escrow.admin_override"
 *   "settings.commission_changed"
 */
export type AuditEntry = {
  actorUserId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  level?: AuditLevel;
};

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      payload: entry.payload ?? undefined,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      level: entry.level ?? AuditLevel.INFO,
    },
  });
}
