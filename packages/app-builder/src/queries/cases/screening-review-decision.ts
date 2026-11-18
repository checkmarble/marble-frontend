import { reviewScreeningReviewMatchesFn, reviewScreeningReviewMatchFn } from '@app-builder/server-fns/screening-review';
import type {
  ScreeningReviewBatchInput,
  ScreeningReviewBatchResult,
  ScreeningReviewDecisionInput,
  ScreeningReviewDecisionResult,
} from '@app-builder/services/screening-review-decision';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Lets the request finish after the page unloads. */
const keepaliveFetch: typeof fetch = (input, init) => fetch(input, { ...init, keepalive: true });

/**
 * Resolves `undefined` after a redirect (expired session, lost entitlement): `useServerFn` has
 * already navigated away, and nothing was written.
 */
export function useScreeningReviewDecisionMutation() {
  const review = useServerFn(reviewScreeningReviewMatchFn);
  return useMutation({
    mutationFn: async ({
      input,
      keepalive = false,
    }: {
      input: ScreeningReviewDecisionInput;
      keepalive?: boolean;
    }): Promise<ScreeningReviewDecisionResult | undefined> =>
      review({ data: input, ...(keepalive ? { fetch: keepaliveFetch } : {}) }),
  });
}

/** Writes several decisions of one case in one request. Resolves `undefined` after a redirect. */
export function useScreeningReviewBatchDecisionMutation() {
  const review = useServerFn(reviewScreeningReviewMatchesFn);
  return useMutation({
    mutationFn: async ({
      input,
      keepalive = false,
    }: {
      input: ScreeningReviewBatchInput;
      keepalive?: boolean;
    }): Promise<ScreeningReviewBatchResult | undefined> =>
      review({ data: input, ...(keepalive ? { fetch: keepaliveFetch } : {}) }),
  });
}
