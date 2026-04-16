import { type AuditEventsFilters } from '@app-builder/schemas/settings';
import { getAuditEventsFn } from '@app-builder/server-fns/settings';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

// TODO: Add 'table' filter when we have an endpoint to list available tables
// Note: 'userId' and 'apiKeyId' are mutually exclusive - handled in UI
export const auditEventsFilterNames = ['dateRange', 'userId', 'apiKeyId', 'entityId'] as const;
export type AuditEventsFilterName = (typeof auditEventsFilterNames)[number];

export const useGetAuditEventsQuery = (filters: AuditEventsFilters | undefined, limit: number) => {
  const getAuditEvents = useServerFn(getAuditEventsFn);

  return useInfiniteQuery({
    queryKey: ['audit-events', 'list', filters, limit],
    queryFn: async ({ pageParam }) => {
      return getAuditEvents({
        data: {
          ...filters,
          limit,
          after: pageParam ?? undefined,
        },
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) => {
      return page?.hasNextPage ? page.events[page.events.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
};
