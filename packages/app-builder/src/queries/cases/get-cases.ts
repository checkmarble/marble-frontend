import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { Case, caseStatuses } from '@app-builder/models/cases';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import QueryString from 'qs';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

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
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  }),
]);

const stringableBooleanSchema = z.union([z.boolean(), z.enum(['true', 'false']).transform((val) => val === 'true')]);

export const filtersSchema = z.object({
  name: z.string().optional(),
  statuses: z.array(z.enum(caseStatuses)).optional(),
  includeSnoozed: stringableBooleanSchema.optional(),
  excludeAssigned: stringableBooleanSchema.optional(),
  assignee: z.string().optional(),
  dateRange: dateRangeSchema.optional(),
  tagId: z.string().optional(),
});

export type Filters = z.infer<typeof filtersSchema>;

const endpoint = (inboxId: string, qs: string) => getRoute('/ressources/cases/:inboxId/cases', { inboxId }) + qs;

export const useGetCasesQuery = (
  inboxId: string,
  filters: Filters | undefined,
  limit: number,
  order: 'ASC' | 'DESC',
) => {
  const navigate = useAgnosticNavigation();

  return useInfiniteQuery({
    queryKey: ['cases', 'get-cases', inboxId, filters, limit, order],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { ...filters, offsetId: pageParam, limit, order },
        { skipNulls: true, addQueryPrefix: true },
      );
      const response = await fetch(endpoint(inboxId, qs), {
        method: 'GET',
      });
      const responseData = (await response.json()) as { redirectTo: string } | { data: PaginatedResponse<Case> };

      if ('redirectTo' in responseData) {
        navigate(responseData.redirectTo);
        return { items: [], hasNextPage: false };
      }

      return responseData.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page, _pages) => {
      return page?.hasNextPage ? page.items[page.items.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
  });
};
