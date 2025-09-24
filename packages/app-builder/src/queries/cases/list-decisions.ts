import { DetailedCaseDecision } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useInfiniteQuery } from '@tanstack/react-query';

const endpoint = (caseId: string, qs: string) =>
  getRoute('/ressources/cases/:caseId/decisions', {
    caseId: fromUUIDtoSUUID(caseId),
  }) + qs;

export function useCaseDecisionsQuery(caseId: string) {
  const queryKey = ['cases', 'list-decisions', caseId] as const;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const qsWithPageParam = pageParam ? `?cursorId=${pageParam}` : '';
      const response = await fetch(endpoint(caseId, qsWithPageParam), {
        method: 'GET',
      });

      return response.json() as Promise<{
        decisions: DetailedCaseDecision[];
        pagination: { hasMore: boolean; cursorId: string | null };
      }>;
    },
    initialPageParam: null as string | number | null,
    getNextPageParam: (lastPage, _pages) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.cursorId : null;
    },
  });
}
