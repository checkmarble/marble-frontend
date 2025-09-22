import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptDecisionOutcomesPerDay,
  type DecisionOutcomesPerDay,
  type DecisionOutcomesPerDayQuery,
  fillMissingDays,
  legacyAnalytics,
  mergeDateRanges,
  transformDecisionOutcomesPerDayQuery,
} from '@app-builder/models/analytics';

import { compareAsc, compareDesc } from 'date-fns';

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
  getDecisionOutcomesPerDay(args: DecisionOutcomesPerDayQuery): Promise<DecisionOutcomesPerDay>;
}

export function makeGetAnalyticsRepository() {
  return (client: MarbleCoreApi): AnalyticsRepository => ({
    // TODO: remove this once we have the new analytics
    legacyListAnalytics: async () => {
      const { analytics } = await client.legacyListAnalytics();

      return analytics.map(legacyAnalytics.adaptAnalytics);
    },

    getDecisionOutcomesPerDay: async (args) => {
      const parsed = transformDecisionOutcomesPerDayQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');
      const [raw, rawCompare] = await Promise.all([
        client.getDecisionOutcomesPerDay(parsed[0]!),
        ...(parsed[1] ? [client.getDecisionOutcomesPerDay(parsed[1])] : []),
      ]);
      const merged = mergeDateRanges([raw, ...(rawCompare ? [rawCompare] : [])]);

      const startDate = args.compareDateRange
        ? [args.dateRange.start, args.compareDateRange.start].sort(compareAsc)[0]!
        : args.dateRange.start;
      const endDate = args.compareDateRange
        ? [args.dateRange.end, args.compareDateRange.end].sort(compareDesc)[0]!
        : args.dateRange.end;
      const filled = fillMissingDays(merged, startDate, endDate);

      return adaptDecisionOutcomesPerDay.parse(filled);
    },
  });
}
