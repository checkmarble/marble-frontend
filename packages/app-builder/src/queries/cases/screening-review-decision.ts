import { reviewScreeningReviewMatchFn } from '@app-builder/server-fns/screening-review';
import type {
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
