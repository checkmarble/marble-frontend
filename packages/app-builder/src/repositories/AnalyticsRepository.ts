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
import {
  type AvailableFiltersRequest,
  type AvailableFiltersResponse,
  adaptAvailableFiltersResponse,
  transformAvailableFiltersRequest,
} from '@app-builder/models/analytics/available-filters';

import { compareAsc, compareDesc, differenceInDays } from 'date-fns';

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
  getDecisionOutcomesPerDay(
    args: DecisionOutcomesPerDayQuery,
  ): Promise<DecisionOutcomesPerPeriod | null>;
  getAvailableFilters(args: AvailableFiltersRequest): Promise<AvailableFiltersResponse>;
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

      console.log('parsed', parsed);
      try {
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
        const rangeSize = differenceInDays(end, start);

        return adaptDecisionOutcomesPerDay(
          rangeSize === merged.length ? merged : fillMissingDays(merged, startDate, endDate),
        );
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getAvailableFilters: async (
      args: AvailableFiltersRequest,
    ): Promise<AvailableFiltersResponse> => {
      return client
        .getAvailableFilters(transformAvailableFiltersRequest(args))
        .then((response) => adaptAvailableFiltersResponse(response));
    },
  });
}
