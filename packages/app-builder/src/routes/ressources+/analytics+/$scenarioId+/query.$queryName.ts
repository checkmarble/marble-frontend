import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import type { DecisionOutcomesAbsolute, DecisionOutcomesPerPeriod } from '@app-builder/models/analytics';
import { analyticsQuery } from '@app-builder/models/analytics';
import type { DecisionsScoreDistribution } from '@app-builder/models/analytics/decisions-score-distribution';
import type { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import type { RuleVsDecisionOutcome } from '@app-builder/models/analytics/rule-vs-decision-outcome';
import type { ScreeningHitTableResponse } from '@app-builder/models/analytics/screening-hit';
import { addDays, format } from 'date-fns';
import invariant from 'tiny-invariant';
import { z } from 'zod';

// LOCAL MOCK: set to true to render the detection analytics page without a
// running backend. Flip to false to restore live API calls.
const USE_MOCK = false;

// region: mock helpers

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

function buildMockDecisions(queryName: string): {
  success: boolean;
  data: unknown;
} {
  const rand = mulberry32(42);

  switch (queryName) {
    case 'decision-outcomes-per-day': {
      const days: string[] = [];
      const start = addDays(new Date(), -30);
      for (let i = 0; i <= 30; i++) {
        days.push(format(addDays(start, i), 'yyyy-MM-dd'));
      }

      const makeRow = (date: string): DecisionOutcomesAbsolute => {
        const approve = Math.round(rand() * 20);
        const decline = Math.round(rand() * 15);
        const review = Math.round(rand() * 10);
        const blockAndReview = Math.round(rand() * 5);
        return {
          rangeId: 'base',
          date,
          approve,
          decline,
          review,
          blockAndReview,
          total: approve + decline + review + blockAndReview,
        };
      };

      const absoluteData = days.map(makeRow);
      const ratioData = absoluteData.map((d) => {
        const total = d.total || 1;
        return {
          rangeId: d.rangeId,
          date: d.date,
          approve: Math.round((d.approve / total) * 100),
          decline: Math.round((d.decline / total) * 100),
          review: Math.round((d.review / total) * 100),
          blockAndReview: Math.round((d.blockAndReview / total) * 100),
        };
      });

      const weeklyAbsolute: DecisionOutcomesAbsolute[] = [];
      for (let i = 0; i < absoluteData.length; i += 7) {
        const chunk = absoluteData.slice(i, i + 7);
        weeklyAbsolute.push({
          rangeId: 'base',
          date: chunk[0]!.date,
          approve: chunk.reduce((s, d) => s + d.approve, 0),
          decline: chunk.reduce((s, d) => s + d.decline, 0),
          review: chunk.reduce((s, d) => s + d.review, 0),
          blockAndReview: chunk.reduce((s, d) => s + d.blockAndReview, 0),
          total: chunk.reduce((s, d) => s + (d.total ?? 0), 0),
        });
      }

      const data: DecisionOutcomesPerPeriod = {
        daily: {
          data: { absolute: absoluteData, ratio: ratioData },
          gridXValues: days.filter((_, i) => i % 5 === 0),
        },
        weekly: {
          data: {
            absolute: weeklyAbsolute,
            ratio: weeklyAbsolute.map((d) => {
              const total = d.total || 1;
              return {
                rangeId: d.rangeId,
                date: d.date,
                approve: Math.round((d.approve / total) * 100),
                decline: Math.round((d.decline / total) * 100),
                review: Math.round((d.review / total) * 100),
                blockAndReview: Math.round((d.blockAndReview / total) * 100),
              };
            }),
          },
          gridXValues: weeklyAbsolute.map((d) => d.date),
        },
        monthly: {
          data: {
            absolute: [
              {
                rangeId: 'base',
                date: days[0]!,
                approve: absoluteData.reduce((s, d) => s + d.approve, 0),
                decline: absoluteData.reduce((s, d) => s + d.decline, 0),
                review: absoluteData.reduce((s, d) => s + d.review, 0),
                blockAndReview: absoluteData.reduce((s, d) => s + d.blockAndReview, 0),
                total: absoluteData.reduce((s, d) => s + (d.total ?? 0), 0),
              },
            ],
            ratio: [
              {
                rangeId: 'base',
                date: days[0]!,
                approve: 40,
                decline: 30,
                review: 20,
                blockAndReview: 10,
              },
            ],
          },
          gridXValues: [days[0]!],
        },
        metadata: {
          start: days[0]!,
          end: days[days.length - 1]!,
          totalDecisions: absoluteData.reduce((s, d) => s + (d.total ?? 0), 0),
        },
      };

      return { success: true, data };
    }

    case 'decisions-score-distribution': {
      const data: DecisionsScoreDistribution = Array.from({ length: 20 }, (_, i) => ({
        x: i * 5,
        y: Math.round(rand() * 15),
      }));
      return { success: true, data };
    }

    case 'rule-hit-table': {
      const ruleNames = ['High amount transfer', 'Multiple countries', 'Velocity check', 'PEP screening', 'Age < 18'];
      const data: RuleHitTableResponse[] = ruleNames.map((name) => ({
        ruleName: name,
        hitCount: { value: Math.round(10 + rand() * 200) },
        hitRatio: { value: Math.round(rand() * 100) / 100 },
        distinctPivots: { value: Math.round(5 + rand() * 50) },
        falsePositiveRatio: { value: Math.round(rand() * 100) / 100 },
        repeatRatio: { value: Math.round(rand() * 100) / 100 },
      }));
      return { success: true, data };
    }

    case 'rule-vs-decision-outcome': {
      const ruleNames = ['High amount transfer', 'Multiple countries', 'Velocity check', 'PEP screening'];
      const data: RuleVsDecisionOutcome[] = ruleNames.map((rule) => {
        const approve = Math.round(rand() * 40);
        const decline = Math.round(rand() * 30);
        const review = Math.round(rand() * 20);
        const blockAndReview = Math.round(rand() * 10);
        const total = approve + decline + review + blockAndReview;
        return {
          rule,
          approve: total ? Math.round((approve / total) * 100) : 0,
          decline: total ? Math.round((decline / total) * 100) : 0,
          review: total ? Math.round((review / total) * 100) : 0,
          blockAndReview: total ? Math.round((blockAndReview / total) * 100) : 0,
          unknown: 0,
          total,
        };
      });
      return { success: true, data };
    }

    case 'screening-hits-table': {
      const data: ScreeningHitTableResponse[] = [
        {
          configId: 'cfg-1',
          name: 'OFAC SDN list',
          execs: Math.round(500 + rand() * 2000),
          hits: Math.round(10 + rand() * 50),
          hitRatio: Math.round(rand() * 100) / 100,
          avgHitsPerScreening: Math.round((1 + rand() * 3) * 10) / 10,
        },
        {
          configId: 'cfg-2',
          name: 'EU sanctions list',
          execs: Math.round(300 + rand() * 1500),
          hits: Math.round(5 + rand() * 30),
          hitRatio: Math.round(rand() * 100) / 100,
          avgHitsPerScreening: Math.round((1 + rand() * 2) * 10) / 10,
        },
      ];
      return { success: true, data };
    }

    default:
      return { success: false, data: null };
  }
}

// endregion

const urlParamsSchema = z.object({
  scenarioId: z.uuid(),
  queryName: z.string(),
});

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsQueryAction({ params, request, context }) {
    try {
      const urlParams = urlParamsSchema.parse(params);
      invariant(urlParams.queryName, 'queryName is required');

      if (USE_MOCK) {
        return buildMockDecisions(urlParams.queryName);
      }

      const body = await request.json();

      const queryParams = analyticsQuery.parse({
        ...body,
        scenarioId: urlParams.scenarioId,
      });

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
