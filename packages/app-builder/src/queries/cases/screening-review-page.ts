import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { ScreeningReviewFilter } from '@app-builder/models/screening-review';
import { listScreeningReviewPageFn } from '@app-builder/server-fns/screening-review';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export interface ScreeningReviewPageParams {
  limit: 25 | 50 | 100;
  cursor: string | null;
  inboxId?: string;
  filter?: ScreeningReviewFilter;
  name?: string;
}

export function useScreeningReviewPageQuery({
  limit,
  cursor,
  inboxId = MY_INBOX_ID,
  filter = 'to_review',
  name,
}: ScreeningReviewPageParams) {
  const listPage = useServerFn(listScreeningReviewPageFn);
  return useQuery({
    queryKey: ['cases', 'screening-review', inboxId, filter, name ?? '', limit, cursor],
    queryFn: () => listPage({ data: { limit, cursor, inboxId, filter, ...(name ? { name } : {}) } }),
    // Previous results stay visible while the next ones load, but never across inbox changes.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === inboxId ? previousData : undefined,
    refetchOnWindowFocus: true,
  });
}
