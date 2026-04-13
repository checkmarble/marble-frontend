import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import type { CaseAnalyticsQueryDto } from 'marble-api';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function caseAnalyticsLoader({ request, context }) {
    const url = new URL(request.url);

    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const timezone = url.searchParams.get('timezone') ?? 'UTC';
    const inboxId = url.searchParams.get('inboxId') ?? undefined;
    const userId = url.searchParams.get('userId') ?? undefined;

    if (!startDate || !endDate) {
      throw new Response('startDate and endDate are required', {
        status: 400,
      });
    }

    const endDateMidnight = new Date(endDate);
    endDateMidnight.setUTCDate(endDateMidnight.getUTCDate() + 1);

    const query: CaseAnalyticsQueryDto = {
      start: new Date(startDate).toISOString(),
      end: endDateMidnight.toISOString(),
      timezone,
      ...(inboxId ? { inbox_id: inboxId } : {}),
      ...(userId ? { assigned_user_id: userId } : {}),
    };

    const { analytics } = context.authInfo;

    const [
      sarTotalCompleted,
      sarDelayByPeriod,
      sarDelayDistribution,
      alertCountByPeriod,
      falsePositiveRateByPeriod,
      caseDurationByPeriod,
      openCasesByAge,
    ] = await Promise.all([
      analytics.getCasesSarCompleted(query),
      analytics.getCasesSarDelay(query),
      analytics.getCasesSarDelayDistribution(query),
      analytics.getCasesCreated(query),
      analytics.getCasesFalsePositiveRate(query),
      analytics.getCasesDuration(query),
      analytics.getOpenCasesByAge(query),
    ]);

    return {
      caseAnalytics: {
        sarTotalCompleted,
        sarDelayByPeriod,
        sarDelayDistribution,
        alertCountByPeriod,
        falsePositiveRateByPeriod,
        caseDurationByPeriod,
        openCasesByAge,
      },
    };
  },
);
