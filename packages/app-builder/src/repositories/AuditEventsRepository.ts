import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptAuditEvent,
  type ListAuditEventsFilters,
  type ListAuditEventsResponse,
} from '@app-builder/models/audit-event';

export interface AuditEventsRepository {
  listAuditEvents(filters: ListAuditEventsFilters): Promise<ListAuditEventsResponse>;
}

export function makeGetAuditEventsRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AuditEventsRepository => ({
    listAuditEvents: async (filters: ListAuditEventsFilters) => {
      const response = await marbleCoreApiClient.listAuditEvents(filters.from, filters.to, {
        userId: filters.userId,
        apiKeyId: filters.apiKeyId,
        table: filters.table,
        entityId: filters.entityId,
        limit: filters.limit,
        after: filters.after,
      });

      return {
        events: (response.events ?? []).map(adaptAuditEvent),
        hasNextPage: response.has_next_page ?? false,
      };
    },
  });
}
