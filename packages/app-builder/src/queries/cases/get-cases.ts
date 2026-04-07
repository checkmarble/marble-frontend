import { type Case } from '@app-builder/models/cases';
import { type PaginatedResponse } from '@app-builder/models/pagination';
import { type Filters, filtersSchema } from '@app-builder/schemas/cases';
import { getCasesFn } from '@app-builder/server-fns/cases';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { filtersSchema, type Filters };

export const useGetCasesQuery = (
  inboxId: string,
  filters: Filters | undefined,
  limit: number,
  order: 'ASC' | 'DESC',
) => {
  const getCases = useServerFn(getCasesFn);

  return useInfiniteQuery({
    queryKey: ['cases', 'get-cases', inboxId, filters, limit, order],
    queryFn: async ({ pageParam }) => {
      const result = await getCases({
        data: {
          inboxId,
          ...(filters ?? {}),
          offsetId: pageParam ?? undefined,
          limit,
          order,
        },
      });
      return result as PaginatedResponse<Case>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page, _pages) => {
      return page?.hasNextPage ? page.items[page.items.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
  });
};
