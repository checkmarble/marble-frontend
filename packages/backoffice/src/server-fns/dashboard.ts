import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { dashboardMonthsSchema } from '@bo/schemas/dashboard';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';
import { z } from 'zod/v4';

export const getDashboardMetricsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .validator(z.object({ months: dashboardMonthsSchema }))
  .handler(async ({ context, data }) =>
    marblecoreApi.getDashboardMetrics({ months: data.months }, { baseUrl: env.API_BASE_URL, fetch: context.authFetch }),
  );
