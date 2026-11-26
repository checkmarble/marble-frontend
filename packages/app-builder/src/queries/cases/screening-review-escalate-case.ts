import { escalateScreeningReviewCaseFn } from '@app-builder/server-fns/screening-review';
import type { ScreeningReviewEscalateResult } from '@app-builder/services/screening-review-decision';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Resolves `undefined` after a redirect: `useServerFn` has already navigated away. */
export function useEscalateScreeningReviewCaseMutation() {
  const escalate = useServerFn(escalateScreeningReviewCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { caseId: string }): Promise<ScreeningReviewEscalateResult | undefined> =>
      escalate({ data: input }),
    // As for Close case: runs even once the dock that started it has unmounted, and on an error too.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });
    },
  });
}
