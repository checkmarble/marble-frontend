import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

// LOCAL MOCK: disable real backend calls and return fixture data so the design
// pass can be reviewed without a running marblecore backend. Flip this to
// `false` (or remove the `if (USE_MOCK)` branch) to restore live data.
const USE_MOCK = false;

/**
 * Deterministic pseudo-random generator seeded on a string (so reloads are stable).
 */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(hash) || 1;
}

function enumerateDays(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function buildMock(startDate: string, endDate: string) {
  const rand = mulberry32(hashString(`${startDate}|${endDate}`));
  const days = enumerateDays(startDate, endDate);

  // SAR delay per day: avg ~6–12 days, max ~12–20 days
  // (close enough ratios to stay readable in the side-by-side grouped layout)
  const sarDelayByPeriod = days.map((day) => {
    const count = Math.max(1, Math.round(1 + rand() * 6));
    const avg = 5 + rand() * 7;
    const max = avg + 4 + rand() * 6;
    return {
      period: day,
      sumDays: Math.round(avg * count * 10) / 10,
      maxDays: Math.round(max * 10) / 10,
      count,
    };
  });

  // Brackets match the backend AnalyticsBracketDto enum: "0-2" | "3-10" | "11-30" | "31+"
  const sarDelayDistribution = [
    { bucket: '0-2', count: 18 + Math.round(rand() * 10) },
    { bucket: '3-10', count: 32 + Math.round(rand() * 20) },
    { bucket: '11-30', count: 14 + Math.round(rand() * 10) },
    { bucket: '31+', count: 6 + Math.round(rand() * 6) },
  ];

  const alertCountByPeriod = days.map((day) => ({
    period: day,
    count: Math.round(5 + rand() * 25),
  }));

  const falsePositiveRateByPeriod = days.map((day) => {
    const closedCount = Math.round(20 + rand() * 40);
    const fpCount = Math.round(closedCount * (0.15 + rand() * 0.45));
    const rate = closedCount > 0 ? Math.round((fpCount / closedCount) * 1000) / 10 : 0;
    return { period: day, rate, fpCount, closedCount };
  });

  // Case duration: avg ~4–8 days, max ~6–12 days (same readability constraint)
  const caseDurationByPeriod = days.map((day) => {
    const count = Math.max(1, Math.round(2 + rand() * 10));
    const avg = 3 + rand() * 5;
    const max = avg + 2 + rand() * 5;
    return {
      period: day,
      sumDays: Math.round(avg * count * 10) / 10,
      maxDays: Math.round(max * 10) / 10,
      count,
    };
  });

  const openCasesByAge = [
    { bucket: '0-2', count: 42 + Math.round(rand() * 20) },
    { bucket: '3-10', count: 28 + Math.round(rand() * 15) },
    { bucket: '11-30', count: 16 + Math.round(rand() * 10) },
    { bucket: '31+', count: 7 + Math.round(rand() * 8) },
  ];

  const sarTotalCompleted = 120 + Math.round(rand() * 80);

  return {
    sarTotalCompleted,
    sarDelayByPeriod,
    sarDelayDistribution,
    alertCountByPeriod,
    falsePositiveRateByPeriod,
    caseDurationByPeriod,
    openCasesByAge,
  };
}

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

    if (USE_MOCK) {
      return { caseAnalytics: buildMock(startDate, endDate) };
    }

    const endDateMidnight = new Date(endDate);
    endDateMidnight.setUTCDate(endDateMidnight.getUTCDate() + 1);

    const query = {
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
