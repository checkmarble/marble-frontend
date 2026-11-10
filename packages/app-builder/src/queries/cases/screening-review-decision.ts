import { reviewScreeningReviewMatchFn } from '@app-builder/server-fns/screening-review';
import type { ScreeningReviewDecisionInput } from '@app-builder/services/screening-review-decision';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Lets the request finish after the page unloads. */
const keepaliveFetch: typeof fetch = (input, init) => fetch(input, { ...init, keepalive: true });

export function useScreeningReviewDecisionMutation() {
  const review = useServerFn(reviewScreeningReviewMatchFn);
  return useMutation({
    mutationFn: ({ input, keepalive = false }: { input: ScreeningReviewDecisionInput; keepalive?: boolean }) =>
      review({ data: input, ...(keepalive ? { fetch: keepaliveFetch } : {}) }),
  });
}
