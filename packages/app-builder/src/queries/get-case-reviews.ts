import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import { listCaseReviewsFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useCaseReviewsQuery(caseId: string) {
  const listCaseReviews = useServerFn(listCaseReviewsFn);

  return useQuery({
    queryKey: ['cases', caseId, 'reviews'],
    queryFn: async () => {
      const result = await (listCaseReviews({ data: { caseId } }) as Promise<{ reviews: AiCaseReviewListItem[] }>);
      return result.reviews;
    },
    enabled: !!caseId,
  });
}
