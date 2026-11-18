import { closeScreeningReviewCaseFn } from '@app-builder/server-fns/screening-review';
import type {
  ScreeningReviewCloseCaseInput,
  ScreeningReviewDecisionResult,
} from '@app-builder/services/screening-review-decision';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Resolves `undefined` after a redirect: `useServerFn` has already navigated away. */
export function useCloseScreeningReviewCaseMutation() {
  const close = useServerFn(closeScreeningReviewCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ScreeningReviewCloseCaseInput): Promise<ScreeningReviewDecisionResult | undefined> =>
      close({ data: input }),
    // Runs even when the dock that started it has unmounted, unlike a per-call `onSuccess`. On an error
    // too: the dismissal can commit before the response fails. Not awaited, so the caller sees the
    // result before the refreshed page replaces the dock.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });
    },
  });
}
