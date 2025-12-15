import { type AuditEvent } from '@app-builder/models/audit-event';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import QueryString from 'qs';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dynamic'),
    fromNow: z.string().refine((value) => {
      try {
        Temporal.Duration.from(value);
        return true;
      } catch {
        return false;
      }
    }),
  }),
  z.object({
    type: z.literal('static'),
    startDate: z.string(),
    endDate: z.string(),
  }),
]);

export const auditEventsFiltersSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  userId: z.string().optional(),
  apiKeyId: z.string().optional(),
  table: z.string().optional(),
  entityId: z.string().optional(),
});

export type AuditEventsFilters = z.infer<typeof auditEventsFiltersSchema>;

// TODO: Add 'table' filter when we have an endpoint to list available tables
// Note: 'userId' and 'apiKeyId' are mutually exclusive - handled in UI
export const auditEventsFilterNames = ['dateRange', 'userId', 'apiKeyId', 'entityId'] as const;
export type AuditEventsFilterName = (typeof auditEventsFilterNames)[number];

type AuditEventsResponse = {
  events: AuditEvent[];
  hasNextPage: boolean;
};

const endpoint = getRoute('/ressources/settings/audit-events');

export const useGetAuditEventsQuery = (filters: AuditEventsFilters | undefined, limit: number) => {
  return useInfiniteQuery({
    queryKey: ['audit-events', 'list', filters, limit],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { ...filters, limit, after: pageParam },
        { skipNulls: true, addQueryPrefix: true },
      );
      const response = await fetch(endpoint + qs, {
        method: 'GET',
      });
      const responseData = (await response.json()) as { data: AuditEventsResponse };

      return responseData.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) => {
      return page?.hasNextPage ? page.events[page.events.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
  });
};
