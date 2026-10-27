import type { getAuditLog } from "@/server/open/audit"

export type AuditPage = Awaited<ReturnType<typeof getAuditLog>>
export type AuditRow = AuditPage["rows"][number]

export interface AuditFilters {
  actorUserId?: string
  entityType?: string
  entityId?: string
}
