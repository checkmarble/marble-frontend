import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptDecisionOutcomesPerDay,
  type DecisionOutcomesPerDayQuery,
  type DecisionOutcomesPerPeriod,
  fillMissingDays,
  LimitDate,
  legacyAnalytics,
  mergeDateRanges,
  transformDecisionOutcomesPerDayQuery,
} from '@app-builder/models/analytics';

import { compareAsc, compareDesc, differenceInDays } from 'date-fns';

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
  getDecisionOutcomesPerDay(
    args: DecisionOutcomesPerDayQuery,
  ): Promise<DecisionOutcomesPerPeriod | null>;
}

export function makeGetAnalyticsRepository() {
  return (client: MarbleCoreApi): AnalyticsRepository => ({
    // TODO: remove this once we have the new analytics
    legacyListAnalytics: async () => {
      const { analytics } = await client.legacyListAnalytics();

      return analytics.map(legacyAnalytics.adaptAnalytics);
    },

    getDecisionOutcomesPerDay: async (
      args: DecisionOutcomesPerDayQuery,
    ): Promise<DecisionOutcomesPerPeriod | null> => {
      const parsed = transformDecisionOutcomesPerDayQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      const [raw, rawCompare] = await Promise.all([
        client.getDecisionOutcomesPerDay(parsed[0]!),
        ...(parsed[1] ? [client.getDecisionOutcomesPerDay(parsed[1])] : []),
      ]);
      const merged = mergeDateRanges([raw, ...(rawCompare ? [rawCompare] : [])]);

      const start = args.compareDateRange
        ? [args.dateRange.start, args.compareDateRange.start].sort(compareAsc)[0]!
        : args.dateRange.start;
      const end = args.compareDateRange
        ? [args.dateRange.end, args.compareDateRange.end].sort(compareDesc)[0]!
        : args.dateRange.end;

      const startDate: LimitDate = {
        date: start,
        rangeId: start === args.dateRange.start ? 'base' : 'compare',
      };
      const endDate: LimitDate = {
        date: end,
        rangeId: end === args.dateRange.end ? 'base' : 'compare',
      };

      const rangeSize = differenceInDays(end, start);
      if (!merged.length) return null;

      if (rangeSize !== merged.length) {
        return adaptDecisionOutcomesPerDay(fillMissingDays(merged, startDate, endDate));
      }
      return adaptDecisionOutcomesPerDay(merged);
    },
  });
}
