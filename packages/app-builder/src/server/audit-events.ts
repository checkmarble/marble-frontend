import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptAuditEvent,
  type ListAuditEventsFilters,
  type ListAuditEventsResponse,
} from '@app-builder/models/audit-event';

export async function listAuditEvents(
  api: MarbleCoreApi,
  filters: ListAuditEventsFilters,
): Promise<ListAuditEventsResponse> {
  const response = await api.listAuditEvents({
    $from: filters.from,
    to: filters.to,
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
}
