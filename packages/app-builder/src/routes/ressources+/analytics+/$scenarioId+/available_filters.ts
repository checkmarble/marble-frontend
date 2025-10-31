import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { dateRangeFilterSchema } from '@app-builder/models/analytics';
import { z } from 'zod/v4';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

const queryParamsSchema = z.object({
  ranges: z.array(dateRangeFilterSchema).min(1),
});

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsAvailableFiltersAction({ params, request, context }) {
    try {
      const urlParams = urlParamsSchema.parse(params);
      const body = await request.json();
      const queryParams = queryParamsSchema.parse(body);
      const availableFilters = await context.authInfo.analytics.getAvailableFilters({
        scenarioId: urlParams.scenarioId,
        ranges: queryParams.ranges,
      });
      return { success: true, data: availableFilters };
    } catch (_error) {
      return { success: false, errors: ['Internal server error'] };
    }
  },
);
