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

    const query: CaseAnalyticsQueryDto = {
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      timezone,
      ...(inboxId ? { inbox_id: inboxId } : {}),
      ...(userId ? { assigned_user_id: userId } : {}),
    };

    const { analytics } = context.authInfo;

    const logCatch = (name: string) => (err: unknown) => {
      console.error(`[case-analytics] ${name} failed:`, err);
      return name === 'sarCompleted' ? 0 : [];
    };

    // TODO: remove .catch() fallbacks once all backend endpoints are stable
    const [
      sarTotalCompleted,
      sarDelayByPeriod,
      sarDelayDistribution,
      alertCountByPeriod,
      falsePositiveRateByPeriod,
      caseDurationByPeriod,
      openCasesByAge,
    ] = await Promise.all([
      analytics.getCasesSarCompleted(query).catch(logCatch('sarCompleted')),
      analytics.getCasesSarDelay(query).catch(logCatch('sarDelay')),
      analytics.getCasesSarDelayDistribution(query).catch(logCatch('sarDelayDistribution')),
      analytics.getCasesCreated(query).catch(logCatch('casesCreated')),
      analytics.getCasesFalsePositiveRate(query).catch(logCatch('falsePositiveRate')),
      analytics.getCasesDuration(query).catch(logCatch('casesDuration')),
      analytics.getOpenCasesByAge(query).catch(logCatch('openCasesByAge')),
    ]);

    console.log('[case-analytics] query:', JSON.stringify(query));
    console.log(
      '[case-analytics] results:',
      JSON.stringify({
        sarTotalCompleted,
        sarDelayByPeriod: Array.isArray(sarDelayByPeriod) ? sarDelayByPeriod.length : 0,
        sarDelayDistribution: Array.isArray(sarDelayDistribution) ? sarDelayDistribution.length : 0,
        alertCountByPeriod: Array.isArray(alertCountByPeriod) ? alertCountByPeriod.length : 0,
        falsePositiveRateByPeriod: Array.isArray(falsePositiveRateByPeriod) ? falsePositiveRateByPeriod.length : 0,
        caseDurationByPeriod: Array.isArray(caseDurationByPeriod) ? caseDurationByPeriod.length : 0,
        openCasesByAge: Array.isArray(openCasesByAge) ? openCasesByAge.length : 0,
      }),
    );

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
