import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { TFunction } from 'i18next';
import { z } from 'zod/v4';

const MAX_THRESHOLD = 10000;

const schemaType = z.object({
  scoreReviewThreshold: z.coerce.number<number>(),
  scoreBlockAndReviewThreshold: z.coerce.number<number>(),
  scoreDeclineThreshold: z.coerce.number<number>(),
});

export type EditScoreThresholdsPayload = z.infer<typeof schemaType>;

export function buildEditScoreThresholdsPayloadSchema(t: TFunction<['common', 'scenarios']>): typeof schemaType {
  return z
    .object({
      scoreReviewThreshold: z.coerce
        .number<number>({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
      scoreBlockAndReviewThreshold: z.coerce
        .number<number>({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
      scoreDeclineThreshold: z.coerce
        .number<number>({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
    })
    .superRefine(({ scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold }, ctx) => {
      if (scoreBlockAndReviewThreshold < scoreReviewThreshold) {
        ctx.issues.push({
          code: 'custom',
          path: ['scoreBlockAndReviewThreshold'],
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: scoreReviewThreshold },
          }),
          input: '',
        });
      }
      if (scoreDeclineThreshold < scoreBlockAndReviewThreshold) {
        ctx.issues.push({
          code: 'custom',
          path: ['scoreDeclineThreshold'],
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: scoreBlockAndReviewThreshold },
          }),
          input: '',
        });
      }
    });
}

const endpoint = (iterationId: string) =>
  getRoute('/ressources/scenarios/iteration/:iterationId/edit-score-thresholds', { iterationId });

export const useEditScoreThresholdsMutation = (iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'edit-score-thresholds'],
    mutationFn: async (data: EditScoreThresholdsPayload) => {
      const response = await fetch(endpoint(iterationId), {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
