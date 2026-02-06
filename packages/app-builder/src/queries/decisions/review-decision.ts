import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const reviewDecisionPayloadSchema = z.object({
  decisionId: z.string(),
  reviewComment: z.string(),
  reviewStatus: z.enum(nonPendingReviewStatuses),
});

export type ReviewDecisionPayload = z.infer<typeof reviewDecisionPayloadSchema>;

const endpoint = getRoute('/ressources/cases/review-decision');

export const useReviewDecisionMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (payload: ReviewDecisionPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
