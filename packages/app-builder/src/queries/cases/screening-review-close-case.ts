import { closeScreeningReviewCaseFn } from '@app-builder/server-fns/screening-review';
import type {
  ScreeningReviewCloseCaseInput,
  ScreeningReviewDecisionResult,
} from '@app-builder/services/screening-review-decision';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Resolves `undefined` after a redirect: `useServerFn` has already navigated away. */
export function useCloseScreeningReviewCaseMutation() {
  const close = useServerFn(closeScreeningReviewCaseFn);
  return useMutation({
    mutationFn: async (input: ScreeningReviewCloseCaseInput): Promise<ScreeningReviewDecisionResult | undefined> =>
      close({ data: input }),
  });
}
