import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { analyticsQuery } from '@app-builder/models/analytics';
import invariant from 'tiny-invariant';
import { z } from 'zod';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
  queryName: z.string(),
});

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsQueryAction({ params, request, context }) {
    try {
      const urlParams = urlParamsSchema.parse(params);
      invariant(urlParams.queryName, 'queryName is required');
      console.log('urlParams', urlParams);

      const body = await request.json();

      const queryParams = analyticsQuery.parse({
        ...body,
        scenarioId: urlParams.scenarioId,
      });

      // wait for a random time between 1 and 5 seconds
      // const randomTime = Math.floor(Math.random() * 5000) + 1000;
      // console.log('--------> randomTime', randomTime);
      // await new Promise((resolve) => setTimeout(resolve, randomTime));

      switch (urlParams.queryName) {
        case 'decision-outcomes-per-day': {
          const data = await context.authInfo.analytics.getDecisionOutcomesPerDay({
            ...queryParams,
            scenarioId: urlParams.scenarioId,
          });
          return {
            success: true,
            data,
          };
        }

        case 'decisions-score-distribution': {
          const data = await context.authInfo.analytics.getDecisionsScoreDistribution({
            ...queryParams,
            scenarioId: urlParams.scenarioId,
          });
          return {
            success: true,
            data,
          };
        }

        case 'rule-hit-table': {
          const data = await context.authInfo.analytics.getRuleHitTable({
            ...queryParams,
            scenarioId: urlParams.scenarioId,
          });
          return {
            success: true,
            data,
          };
        }

        case 'rule-vs-decision-outcome': {
          const data = await context.authInfo.analytics.getRuleVsDecisionOutcome({
            ...queryParams,
            scenarioId: urlParams.scenarioId,
          });
          return {
            success: true,
            data,
          };
        }

        case 'screening-hits-table': {
          const data = await context.authInfo.analytics.getScreeningHitsTable({
            ...queryParams,
            scenarioId: urlParams.scenarioId,
          });
          return {
            success: true,
            data,
          };
        }

        default: {
          return {
            success: false,
            errors: 'Invalid query name',
          };
        }
      }
    } catch (error) {
      console.error('error in analytics query', error);
      return { success: false, errors: 'Internal server error' };
    }
  },
);
