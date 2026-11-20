import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { ScreeningReviewFilter } from '@app-builder/models/screening-review';
import { listScreeningReviewPageFn } from '@app-builder/server-fns/screening-review';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const SCREENING_REVIEW_PAGE_SIZE = 50;

export interface ScreeningReviewPageParams {
  inboxId?: string;
  filter?: ScreeningReviewFilter;
  name?: string;
}

export function useScreeningReviewPageQuery({
  inboxId = MY_INBOX_ID,
  filter = 'to_review',
  name,
}: ScreeningReviewPageParams) {
  const listPage = useServerFn(listScreeningReviewPageFn);
  return useInfiniteQuery({
    queryKey: ['cases', 'screening-review', inboxId, filter, name ?? ''],
    queryFn: ({ pageParam }) =>
      listPage({
        data: { limit: SCREENING_REVIEW_PAGE_SIZE, cursor: pageParam, inboxId, filter, ...(name ? { name } : {}) },
      }),
    initialPageParam: null as string | null,
    // A failed page has no cursor: Retry reads it again.
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Previous results stay visible while the next ones load, but never across inbox changes.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === inboxId ? previousData : undefined,
    refetchOnWindowFocus: true,
  });
}
