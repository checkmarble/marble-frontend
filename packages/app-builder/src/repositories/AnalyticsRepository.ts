import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import type { DateRange } from '@app-builder/models/analytics';
import {
  type AnalyticsQuery,
  adaptDecisionOutcomesPerDay,
  adaptDecisionsScoreDistribution,
  adaptRuleVsDecisionOutcome,
  type DecisionOutcomesPerPeriod,
  type DecisionsScoreDistribution,
  fillMissingDays,
  LimitDate,
  legacyAnalytics,
  mergeDateRanges,
  type RuleVsDecisionOutcome,
  transformAnalyticsQuery,
} from '@app-builder/models/analytics';
import {
  type AvailableFiltersRequest,
  type AvailableFiltersResponse,
  adaptAvailableFiltersResponse,
  transformAvailableFiltersRequest,
} from '@app-builder/models/analytics/available-filters';
import { adaptRuleHitTable, RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { adaptScreeningHitTable, ScreeningHitTableResponse } from '@app-builder/models/analytics/screening-hit';

import { compareAsc, compareDesc, differenceInDays } from 'date-fns';

type DateRangeLimits = {
  startDate: LimitDate;
  endDate: LimitDate;
};

function computeDateRangeLimits(parsedRanges: DateRange[]): DateRangeLimits {
  if (parsedRanges.length === 2) {
    const baseRange = parsedRanges[0]!;
    const compareRange = parsedRanges[1]!;
    const startDates = [baseRange.start, compareRange.start].sort(compareAsc);
    const endDates = [baseRange.end, compareRange.end].sort(compareDesc);

    const start = startDates[0]!;
    const end = endDates[0]!;

    return {
      startDate: {
        date: start,
        rangeId: start === baseRange.start ? 'base' : 'compare',
      },
      endDate: {
        date: end,
        rangeId: end === baseRange.end ? 'base' : 'compare',
      },
    };
  }

  const baseRange = parsedRanges[0]!;
  return {
    startDate: {
      date: baseRange.start,
      rangeId: 'base',
    },
    endDate: {
      date: baseRange.end,
      rangeId: 'base',
    },
  };
}

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
  getDecisionOutcomesPerDay(args: AnalyticsQuery): Promise<DecisionOutcomesPerPeriod | null>;
  getRuleHitTable(args: AnalyticsQuery): Promise<RuleHitTableResponse[] | null>;
  getScreeningHitsTable(args: AnalyticsQuery): Promise<ScreeningHitTableResponse[] | null>;
  getDecisionsScoreDistribution(args: AnalyticsQuery): Promise<DecisionsScoreDistribution | null>;
  getRuleVsDecisionOutcome(args: AnalyticsQuery): Promise<RuleVsDecisionOutcome[] | null>;
  getAvailableFilters(args: AvailableFiltersRequest): Promise<AvailableFiltersResponse>;
}

export function makeGetAnalyticsRepository() {
  return (client: MarbleCoreApi): AnalyticsRepository => ({
    // TODO: remove this once we have the new analytics
    legacyListAnalytics: async () => {
      const { analytics } = await client.legacyListAnalytics();

      return analytics.map(legacyAnalytics.adaptAnalytics);
    },

    getDecisionOutcomesPerDay: async (args: AnalyticsQuery): Promise<DecisionOutcomesPerPeriod | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');
      const [raw, rawCompare] = await Promise.all([
        client.getDecisionOutcomesPerDay(parsed[0]!),
        parsed[1] && client.getDecisionOutcomesPerDay(parsed[1]),
      ]);

      const merged = mergeDateRanges([raw, ...(rawCompare ? [rawCompare] : [])]);

      const { startDate, endDate } = computeDateRangeLimits(parsed);

      if (!merged.length) {
        merged.push({
          ...startDate,
          approve: 0,
          block_and_review: 0,
          decline: 0,
          review: 0,
        });
        merged.push({
          ...endDate,
          approve: 0,
          block_and_review: 0,
          decline: 0,
          review: 0,
        });
      }
      const rangeSize = differenceInDays(endDate.date, startDate.date);

      return adaptDecisionOutcomesPerDay(
        rangeSize === merged.length ? merged : fillMissingDays(merged, startDate, endDate),
      );
    },

    getRuleHitTable: async (args: AnalyticsQuery): Promise<RuleHitTableResponse[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      const raw = await client.getRuleHitTable(parsed[0]!);
      return adaptRuleHitTable(raw);
    },

    getScreeningHitsTable: async (args: AnalyticsQuery): Promise<ScreeningHitTableResponse[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      const raw = await client.getScreeningHits(parsed[0]!);
      return adaptScreeningHitTable(raw);
    },

    getDecisionsScoreDistribution: async (args: AnalyticsQuery): Promise<DecisionsScoreDistribution | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');
      return adaptDecisionsScoreDistribution(await client.getDecisionsScoreDistribution(parsed[0]!));
    },

    getRuleVsDecisionOutcome: async (args: AnalyticsQuery): Promise<RuleVsDecisionOutcome[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      return adaptRuleVsDecisionOutcome(await client.getRuleVsDecisionOutcome(parsed[0]!));
    },

    getAvailableFilters: async (args: AvailableFiltersRequest): Promise<AvailableFiltersResponse> => {
      return client
        .getAvailableFilters(transformAvailableFiltersRequest(args))
        .then((response) => adaptAvailableFiltersResponse(response));
    },
  });
}
