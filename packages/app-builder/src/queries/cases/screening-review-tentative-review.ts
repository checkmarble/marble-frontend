import { submitScreeningReviewTentativeReviewFn } from '@app-builder/server-fns/screening-review';
import type {
  ScreeningReviewDecisionResult,
  ScreeningReviewTentativeReviewInput,
} from '@app-builder/services/screening-review-decision';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { keepaliveFetch } from './screening-review-decision';

export function useScreeningReviewTentativeReviewMutation() {
  const submit = useServerFn(submitScreeningReviewTentativeReviewFn);
  return useMutation({
    mutationFn: async ({
      input,
      keepalive = false,
    }: {
      input: ScreeningReviewTentativeReviewInput;
      keepalive?: boolean;
    }): Promise<ScreeningReviewDecisionResult | undefined> =>
      submit({ data: input, ...(keepalive ? { fetch: keepaliveFetch } : {}) }),
  });
}
