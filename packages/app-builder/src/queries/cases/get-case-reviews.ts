import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import { listCaseReviewsFn } from '@app-builder/server-fns/cases';
import { type Query, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type ReviewsQuery = Query<AiCaseReviewListItem[], Error, AiCaseReviewListItem[], (string | undefined)[]>;

type UseCaseReviewsQueryOptions = {
  refetchInterval?: number | false | ((query: ReviewsQuery) => number | false | undefined);
};

export function useCaseReviewsQuery(caseId: string, options?: UseCaseReviewsQueryOptions) {
  const listCaseReviews = useServerFn(listCaseReviewsFn);

  return useQuery({
    queryKey: ['cases', caseId, 'reviews'],
    queryFn: async () => {
      const result = await (listCaseReviews({ data: { caseId } }) as Promise<{ reviews: AiCaseReviewListItem[] }>);
      return result.reviews;
    },
    enabled: !!caseId,
    refetchInterval: options?.refetchInterval,
  });
}
