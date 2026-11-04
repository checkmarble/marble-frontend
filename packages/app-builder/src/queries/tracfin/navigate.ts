import type { TracfinSelection } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { navigateTracfinFn } from '@app-builder/server-fns/tracfin';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';
import { shouldRetryTracfinQuery } from './retry';

/**
 * Candidate records for one step of a selection, a page at a time. `data.pages` keeps the pages as
 * the server returned them and `hasNextPage` tells whether more exist: a page is never "the" list.
 */
export const useTracfinNavigationQuery = (
  caseId: string,
  selection: TracfinSelection,
  stepId: string,
  options?: { enabled?: boolean; limit?: number },
) => {
  const navigate = useServerFn(navigateTracfinFn);
  const limit = options?.limit;

  return useInfiniteQuery({
    queryKey: tracfinKeys.navigation(caseId, selection, stepId, limit),
    queryFn: async ({ pageParam }) => {
      const page = unwrapTracfinResult(
        await navigate({
          data: {
            caseId,
            body: {
              selection,
              step_id: stepId,
              ...(pageParam ? { cursor: pageParam } : {}),
              ...(limit ? { limit } : {}),
            },
          },
        }),
      );
      // Silently stopping here would present a truncated list as complete.
      if (page.has_next_page && !page.next_cursor) {
        throw new Error('TRACFIN navigation announced a next page without a cursor');
      }
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.has_next_page ? lastPage.next_cursor : undefined),
    // Cursors belong to the sequence of pages that produced them.
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
    retry: shouldRetryTracfinQuery,
  });
};
