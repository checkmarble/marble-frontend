import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { analyticsQuery } from '@app-builder/models/analytics';
import { z } from 'zod';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsQueryAction({ params, request, context }) {
    try {
      const urlParams = urlParamsSchema.parse(params);

      const body = await request.json();

      const queryParams = analyticsQuery.parse({
        ...body,
        scenarioId: urlParams.scenarioId,
      });

      const [decisionOutcomesPerDay, ruleHitTable] = await Promise.all([
        context.authInfo.analytics.getDecisionOutcomesPerDay({
          ...queryParams,
          scenarioId: urlParams.scenarioId,
        }),
        context.authInfo.analytics.getRuleHitTable({
          ...queryParams,
          scenarioId: urlParams.scenarioId,
        }),
      ]);

      return {
        success: true,
        data: {
          decisionOutcomesPerDay,
          ruleHitTable,
        },
      };
    } catch (error) {
      console.error('error in analytics query', error);
      return { success: false, errors: 'Internal server error' };
    }
  },
);
