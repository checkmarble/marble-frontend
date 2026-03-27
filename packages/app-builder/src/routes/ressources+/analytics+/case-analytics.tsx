import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import type { TimeBucket } from '@app-builder/models/analytics/case-analytics';
import { subMonths } from 'date-fns';

import { generateCaseAnalyticsMock } from './mock/case-analytics-mock';

const validTimeBuckets: TimeBucket[] = ['week', 'month', 'quarter', 'year'];

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function caseAnalyticsLoader({ request }) {
    const url = new URL(request.url);

    const startDate = url.searchParams.get('startDate') ?? subMonths(new Date(), 6).toISOString().slice(0, 10);
    const endDate = url.searchParams.get('endDate') ?? new Date().toISOString().slice(0, 10);
    const timeBucketParam = url.searchParams.get('timeBucket') ?? 'month';
    const timeBucket = validTimeBuckets.includes(timeBucketParam as TimeBucket)
      ? (timeBucketParam as TimeBucket)
      : 'month';

    // TODO: Replace with real API call when backend is ready
    // const inboxId = url.searchParams.get('inboxId') ?? undefined;
    const data = generateCaseAnalyticsMock(startDate, endDate, timeBucket);

    return { caseAnalytics: data };
  },
);
