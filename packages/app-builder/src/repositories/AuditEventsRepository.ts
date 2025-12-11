import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AuditEvent, adaptAuditEvent, type ListAuditEventsFilters } from '@app-builder/models/audit-event';

export interface AuditEventsRepository {
  listAuditEvents(filters: ListAuditEventsFilters): Promise<AuditEvent[]>;
}

export function makeGetAuditEventsRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AuditEventsRepository => ({
    listAuditEvents: async (filters: ListAuditEventsFilters) => {
      const auditEvents = await marbleCoreApiClient.listAuditEvents(filters.from, filters.to, {
        userId: filters.userId,
        apiKeyId: filters.apiKeyId,
        table: filters.table,
        entityId: filters.entityId,
        after: filters.after,
      });

      return auditEvents.map(adaptAuditEvent);
    },
  });
}
