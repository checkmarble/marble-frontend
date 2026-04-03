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
import {
  adaptCasesCreated,
  adaptCasesDuration,
  adaptFalsePositiveRate,
  adaptOpenCasesByAge,
  adaptSarDelay,
  adaptSarDelayDistribution,
  type BucketCount,
  type FalsePositiveRate,
  type PeriodCount,
  type PeriodDuration,
} from '@app-builder/models/analytics/case-analytics';
import { adaptCaseStatusByInbox, CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { adaptCaseStatusByDate, CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { adaptRuleHitTable, RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { adaptScreeningHitTable, ScreeningHitTableResponse } from '@app-builder/models/analytics/screening-hit';
import { compareAsc, compareDesc, differenceInDays } from 'date-fns';
import type { CaseAnalyticsQueryDto } from 'marble-api';

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
  getDecisionsScoreDistribution(args: AnalyticsQuery): Promise<DecisionsScoreDistribution>;
  getRuleVsDecisionOutcome(args: AnalyticsQuery): Promise<RuleVsDecisionOutcome[] | null>;
  getCaseStatusByDate(): Promise<CaseStatusByDateResponse[] | null>;
  getCaseStatusByInbox(): Promise<CaseStatusByInboxResponse[] | null>;
  getAvailableFilters(args: AvailableFiltersRequest): Promise<AvailableFiltersResponse>;
  getCasesSarCompleted(query: CaseAnalyticsQueryDto): Promise<number>;
  getCasesSarDelay(query: CaseAnalyticsQueryDto): Promise<PeriodDuration[]>;
  getCasesSarDelayDistribution(query: CaseAnalyticsQueryDto): Promise<BucketCount[]>;
  getCasesCreated(query: CaseAnalyticsQueryDto): Promise<PeriodCount[]>;
  getCasesFalsePositiveRate(query: CaseAnalyticsQueryDto): Promise<FalsePositiveRate[]>;
  getCasesDuration(query: CaseAnalyticsQueryDto): Promise<PeriodDuration[]>;
  getOpenCasesByAge(query: CaseAnalyticsQueryDto): Promise<BucketCount[]>;
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

      const [raw, rawCompare] = await Promise.all([
        client.getRuleHitTable(parsed[0]!),
        parsed[1] && client.getRuleHitTable(parsed[1]),
      ]);

      return adaptRuleHitTable(raw, rawCompare);
    },

    getScreeningHitsTable: async (args: AnalyticsQuery): Promise<ScreeningHitTableResponse[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      const raw = await client.getScreeningHits(parsed[0]!);
      return adaptScreeningHitTable(raw);
    },

    getDecisionsScoreDistribution: async (args: AnalyticsQuery): Promise<DecisionsScoreDistribution> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');
      return adaptDecisionsScoreDistribution(await client.getDecisionsScoreDistribution(parsed[0]!));
    },

    getRuleVsDecisionOutcome: async (args: AnalyticsQuery): Promise<RuleVsDecisionOutcome[] | null> => {
      const parsed = transformAnalyticsQuery.parse(args);
      if (!parsed.length) throw new Error('No date range provided');

      return adaptRuleVsDecisionOutcome(await client.getRuleVsDecisionOutcome(parsed[0]!));
    },

    getCaseStatusByDate: async (): Promise<CaseStatusByDateResponse[] | null> => {
      return (await client.getCaseStatusByDate()).map(adaptCaseStatusByDate);
    },

    getCaseStatusByInbox: async (): Promise<CaseStatusByInboxResponse[] | null> => {
      return (await client.getCaseStatusByInbox()).map(adaptCaseStatusByInbox);
    },

    getAvailableFilters: async (args: AvailableFiltersRequest): Promise<AvailableFiltersResponse> => {
      return client
        .getAvailableFilters(transformAvailableFiltersRequest(args))
        .then((response) => adaptAvailableFiltersResponse(response));
    },

    getCasesSarCompleted: async (query: CaseAnalyticsQueryDto): Promise<number> => {
      const result = await client.getCasesAnalyticsSarCompleted(query);
      return result?.count ?? 0;
    },

    getCasesSarDelay: async (query: CaseAnalyticsQueryDto): Promise<PeriodDuration[]> => {
      const result = await client.getCasesAnalyticsSarDelay(query);
      return (result ?? []).map(adaptSarDelay);
    },

    getCasesSarDelayDistribution: async (query: CaseAnalyticsQueryDto): Promise<BucketCount[]> => {
      const result = await client.getCasesAnalyticsSarDelayDistribution(query);
      return (result ?? []).map(adaptSarDelayDistribution);
    },

    getCasesCreated: async (query: CaseAnalyticsQueryDto): Promise<PeriodCount[]> => {
      const result = await client.getCasesAnalyticsCasesCreated(query);
      return (result ?? []).map(adaptCasesCreated);
    },

    getCasesFalsePositiveRate: async (query: CaseAnalyticsQueryDto): Promise<FalsePositiveRate[]> => {
      const result = await client.getCasesAnalyticsFalsePositiveRate(query);
      return (result ?? []).map(adaptFalsePositiveRate);
    },

    getCasesDuration: async (query: CaseAnalyticsQueryDto): Promise<PeriodDuration[]> => {
      const result = await client.getCasesAnalyticsCasesDuration(query);
      return (result ?? []).map(adaptCasesDuration);
    },

    getOpenCasesByAge: async (query: CaseAnalyticsQueryDto): Promise<BucketCount[]> => {
      const result = await client.getCasesAnalyticsOpenCasesByAge(query);
      return (result ?? []).map(adaptOpenCasesByAge);
    },
  });
}
