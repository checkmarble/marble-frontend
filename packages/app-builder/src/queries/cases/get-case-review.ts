import { type CaseReview } from '@app-builder/models/cases';
import { getCaseReviewFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useCaseReviewQuery(caseId: string, reviewId: string) {
  const getCaseReview = useServerFn(getCaseReviewFn);

  return useQuery({
    queryKey: ['cases', caseId, 'review', reviewId],
    queryFn: async () => {
      const result = await (getCaseReview({ data: { caseId, reviewId } }) as Promise<{ review: CaseReview }>);
      return result.review;
    },
    enabled: !!caseId && !!reviewId,
  });
}
