import { enqueueReviewFn } from '@app-builder/server-fns/cases';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useEnqueueCaseReviewMutation() {
  const enqueueReview = useServerFn(enqueueReviewFn);

  return useMutation({
    mutationFn: async (caseId: string) => {
      await enqueueReview({ data: { caseId } });
    },
  });
}
