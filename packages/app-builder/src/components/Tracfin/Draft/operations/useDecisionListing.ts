import type { DetailedCaseDecision } from '@app-builder/models/cases';
import { useCaseDecisionsQuery } from '@app-builder/queries/cases/list-decisions';
import { useMemo } from 'react';

/**
 * The decisions of the case that the existing listing has loaded so far (cursor pagination, 200 per
 * page). `hasMore` is the server's word: a list is never presented as complete while it says more
 * exist. Disabled, it fetches nothing.
 */
export function useDecisionListing(caseId: string, enabled: boolean) {
  const query = useCaseDecisionsQuery(caseId, { enabled });
  const decisions = useMemo<DetailedCaseDecision[]>(
    () => query.data?.pages.flatMap((page) => page.decisions) ?? [],
    [query.data],
  );
  return {
    decisions,
    byId: useMemo(() => new Map(decisions.map((decision) => [decision.id, decision])), [decisions]),
    hasMore: query.hasNextPage,
    loadMore: () => void query.fetchNextPage(),
    isLoading: query.isPending && enabled,
    isLoadingMore: query.isFetchingNextPage,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
