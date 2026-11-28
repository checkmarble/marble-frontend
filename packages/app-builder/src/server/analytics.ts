import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type AnalyticsQuery,
  adaptDecisionOutcomesPerDay,
  adaptDecisionsScoreDistribution,
  adaptRuleVsDecisionOutcome,
  type DateRange,
  type DecisionOutcomesPerPeriod,
  type DecisionsScoreDistribution,
  fillMissingDays,
  type LimitDate,
  mergeDateRanges,
  type RuleVsDecisionOutcome,
  transformAnalyticsQuery,
} from '@app-builder/models/analytics';
import { adaptRuleHitTable, type RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { adaptScreeningHitTable, type ScreeningHitTableResponse } from '@app-builder/models/analytics/screening-hit';
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

type AnalyticsQueryDto = ReturnType<typeof transformAnalyticsQuery.parse>[number];

/** The requested range, then the comparison range when one is set. */
function parseRanges(args: AnalyticsQuery): [AnalyticsQueryDto, ...AnalyticsQueryDto[]] {
  const [current, ...comparison] = transformAnalyticsQuery.parse(args);
  if (!current) throw new Error('No date range provided');
  return [current, ...comparison];
}

export async function getDecisionOutcomesPerDay(
  api: MarbleCoreApi,
  args: AnalyticsQuery,
): Promise<DecisionOutcomesPerPeriod> {
  const parsed = parseRanges(args);
  const [raw, rawCompare] = await Promise.all([
    api.getDecisionOutcomesPerDay(parsed[0]),
    parsed[1] && api.getDecisionOutcomesPerDay(parsed[1]),
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
}

export async function getRuleHitTable(api: MarbleCoreApi, args: AnalyticsQuery): Promise<RuleHitTableResponse[]> {
  const parsed = parseRanges(args);

  const [raw, rawCompare] = await Promise.all([
    api.getRuleHitTable(parsed[0]),
    parsed[1] && api.getRuleHitTable(parsed[1]),
  ]);

  return adaptRuleHitTable(raw, rawCompare);
}

export async function getScreeningHitsTable(
  api: MarbleCoreApi,
  args: AnalyticsQuery,
): Promise<ScreeningHitTableResponse[]> {
  const parsed = parseRanges(args);

  const raw = await api.getScreeningHits(parsed[0]);
  return adaptScreeningHitTable(raw);
}

export async function getDecisionsScoreDistribution(
  api: MarbleCoreApi,
  args: AnalyticsQuery,
): Promise<DecisionsScoreDistribution> {
  const parsed = parseRanges(args);
  return adaptDecisionsScoreDistribution(await api.getDecisionsScoreDistribution(parsed[0]));
}

export async function getRuleVsDecisionOutcome(
  api: MarbleCoreApi,
  args: AnalyticsQuery,
): Promise<RuleVsDecisionOutcome[]> {
  const parsed = parseRanges(args);

  return adaptRuleVsDecisionOutcome(await api.getRuleVsDecisionOutcome(parsed[0]));
}
