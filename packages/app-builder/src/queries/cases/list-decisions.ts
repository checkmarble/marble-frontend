import { type DetailedCaseDecision } from '@app-builder/models/cases';
import { listCaseDecisionsFn } from '@app-builder/server-fns/cases';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useCallback } from 'react';

const caseDecisionsQueryKey = ['cases', 'list-decisions'] as const;

export function useInvalidateCaseDecisions() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: caseDecisionsQueryKey });
  }, [queryClient]);
}

export function useCaseDecisionsQuery(caseId: string) {
  const listCaseDecisions = useServerFn(listCaseDecisionsFn);
  const queryKey = [...caseDecisionsQueryKey, caseId] as const;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      return listCaseDecisions({
        data: { caseId, cursorId: pageParam ?? undefined },
      }) as Promise<{
        decisions: DetailedCaseDecision[];
        pagination: { hasMore: boolean; cursorId: string | null };
      }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage, _pages) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.cursorId : null;
    },
  });
}
