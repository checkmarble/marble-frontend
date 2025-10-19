import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type AnalyticsQuery,
  adaptDecisionOutcomesPerDay,
  type DecisionOutcomesPerPeriod,
  fillMissingDays,
  LimitDate,
  legacyAnalytics,
  mergeDateRanges,
  transformAnalyticsQuery,
} from '@app-builder/models/analytics';
import {
  type AvailableFiltersRequest,
  type AvailableFiltersResponse,
  adaptAvailableFiltersResponse,
  transformAvailableFiltersRequest,
} from '@app-builder/models/analytics/available-filters';
import { adaptRuleHitTable, RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';

import { compareAsc, compareDesc, differenceInDays } from 'date-fns';

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
  getDecisionOutcomesPerDay(args: AnalyticsQuery): Promise<DecisionOutcomesPerPeriod | null>;
  getRuleHitTable(args: AnalyticsQuery): Promise<RuleHitTableResponse[] | null>;
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
      args: AnalyticsQuery,
    ): Promise<DecisionOutcomesPerPeriod | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      try {
        const [raw, rawCompare] = await Promise.all([
          client.getDecisionOutcomesPerDay(parsed[0]!),
          ...(parsed[1] ? [client.getDecisionOutcomesPerDay(parsed[1])] : []),
        ]);

        const merged = mergeDateRanges([raw, ...(rawCompare ? [rawCompare] : [])]);

        const start =
          parsed.length === 2
            ? [parsed[0]!.start, parsed[1]!.start].sort(compareAsc)[0]!
            : parsed[0]!.start;
        const end =
          parsed.length === 2
            ? [parsed[0]!.end, parsed[1]!.end].sort(compareDesc)[0]!
            : parsed[0]!.end;

        const startDate: LimitDate = {
          date: start,
          rangeId: start === parsed[0]!.start ? 'base' : 'compare',
        };
        const endDate: LimitDate = {
          date: end,
          rangeId: end === parsed[0]!.end ? 'base' : 'compare',
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
        console.error('error in getDecisionOutcomesPerDay', error);
        return null;
      }
    },

    getRuleHitTable: async (args: AnalyticsQuery): Promise<RuleHitTableResponse[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      const raw = await client.getRuleHitTable(parsed[0]!);
      return adaptRuleHitTable(raw);
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
