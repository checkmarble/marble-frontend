import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { listScreeningReviewPageFn } from '@app-builder/server-fns/screening-review';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useScreeningReviewPageQuery(limit: 25 | 50 | 100, cursor: string | null, inboxId = MY_INBOX_ID) {
  const listPage = useServerFn(listScreeningReviewPageFn);
  return useQuery({
    queryKey: ['cases', 'screening-review', inboxId, limit, cursor],
    queryFn: () => listPage({ data: { limit, cursor, inboxId } }),
    // Previous pages stay visible during pagination, but never across inbox changes.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === inboxId ? previousData : undefined,
    refetchOnWindowFocus: true,
  });
}
