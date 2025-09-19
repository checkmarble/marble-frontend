import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptDecisionOutcomesPerDay,
  type DecisionOutcomesPerDay,
  type DecisionOutcomesPerDayQuery,
  fillMissingDays,
  legacyAnalytics,
  transformDecisionOutcomesPerDayQuery,
} from '@app-builder/models/analytics';

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
      const raw = await client.getDecisionOutcomesPerDay(parsed);
      const filled = fillMissingDays(raw, args.start, args.end);
      return adaptDecisionOutcomesPerDay.parse(filled);
    },
  });
}
