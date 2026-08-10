import type { BarDatum } from '@nivo/bar';
import type {
  CaseSlaStatusByDateResponseDto,
  CasesCreatedResponseDto,
  CasesDurationResponseDto,
  CasesFalsePositiveRateResponseDto,
  OpenCasesByAgeResponseDto,
  SarDelayDistributionResponseDto,
  SarDelayResponseDto,
} from 'marble-api';

export interface CaseAnalyticsFilters {
  startDate: string;
  endDate: string;
  inboxId?: string;
  userId?: string;
}

export interface PeriodDuration {
  period: string;
  sumDays: number;
  maxDays: number;
  count: number;
}

/**
 * Derived from PeriodDuration for chart display: the frontend computes the
 * average from the aggregated raw sums so that weighted averages are correct
 * across any time bucket (day/month/quarter).
 */
export interface PeriodAverage {
  period: string;
  avgDays: number;
  maxDays: number;
  count: number;
}

export function toPeriodAverage(item: PeriodDuration): PeriodAverage {
  return {
    period: item.period,
    avgDays: item.count > 0 ? Math.round((item.sumDays / item.count) * 10) / 10 : 0,
    maxDays: item.maxDays,
    count: item.count,
  };
}

export interface BucketCount {
  bucket: string;
  count: number;
}

export interface PeriodCount {
  period: string;
  count: number;
}

export interface CaseSlaStatusByDate {
  period: string;
  count: number;
  completedWithinSla: number;
  slaBreached: number;
  stillOpenWithinSla: number;
}

export interface FalsePositiveRate {
  period: string;
  rate: number;
  fpCount: number;
  closedCount: number;
}

export interface CaseAnalyticsResponse {
  sarTotalCompleted: number;
  sarDelayByPeriod: PeriodDuration[];
  sarDelayDistribution: BucketCount[];
  alertCountByPeriod: PeriodCount[];
  falsePositiveRateByPeriod: FalsePositiveRate[];
  caseDurationByPeriod: PeriodDuration[];
  openCasesByAge: BucketCount[];
  caseSlaStatusByDate: CaseSlaStatusByDate[];
}

/**
 * Share of `part` in `total`, as a percentage rounded to one decimal. Returns 0 when `total` is 0.
 */
export function toPercent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

// Adapters

export function adaptSarDelay(dto: SarDelayResponseDto): PeriodDuration {
  return {
    period: dto.date,
    sumDays: dto.sum_days,
    maxDays: dto.max_days,
    count: dto.count_sars,
  };
}

export function adaptSarDelayDistribution(dto: SarDelayDistributionResponseDto): BucketCount {
  return {
    bucket: dto.bracket,
    count: dto.count,
  };
}

export function adaptCasesCreated(dto: CasesCreatedResponseDto): PeriodCount {
  return {
    period: dto.date,
    count: dto.count,
  };
}

export function adaptFalsePositiveRate(dto: CasesFalsePositiveRateResponseDto): FalsePositiveRate {
  const closedCount = dto.total_closed;
  const fpCount = dto.false_positives;
  return {
    period: dto.date,
    rate: toPercent(fpCount, closedCount),
    fpCount,
    closedCount,
  };
}

export function adaptCasesDuration(dto: CasesDurationResponseDto): PeriodDuration {
  return {
    period: dto.date,
    sumDays: dto.sum_days,
    maxDays: dto.max_days,
    count: dto.count_cases,
  };
}

export function adaptOpenCasesByAge(dto: OpenCasesByAgeResponseDto): BucketCount {
  return {
    bucket: dto.bracket,
    count: dto.count,
  };
}

export function adaptCaseSlaStatusByDate(dto: CaseSlaStatusByDateResponseDto): CaseSlaStatusByDate {
  return {
    period: dto.date,
    count: dto.completed_within_sla + dto.sla_breached + dto.still_open_within_sla,
    completedWithinSla: dto.completed_within_sla,
    slaBreached: dto.sla_breached,
    stillOpenWithinSla: dto.still_open_within_sla,
  };
}

/**
 * Helper type to satisfy nivo's BarDatum constraint at call sites.
 * Use: `data={items as BarData<PeriodDuration>[]}`
 */
export type BarData<T> = T & BarDatum;

// region: Time bucket aggregation

export type TimeBucket = 'day' | 'month' | 'quarter';

/**
 * Returns a stable bucket key for the given ISO date string and granularity.
 * - day: 'YYYY-MM-DD'
 * - month: 'YYYY-MM'
 * - quarter: 'YYYY-Q[1-4]'
 */
function getBucketKey(isoDate: string, bucket: TimeBucket): string {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  switch (bucket) {
    case 'day':
      return isoDate.slice(0, 10);
    case 'month':
      return `${year}-${String(month).padStart(2, '0')}`;
    case 'quarter':
      return `${year}-Q${Math.ceil(month / 3)}`;
  }
}

/**
 * Collapses period-keyed series into `bucket` granularity, chronologically sorted.
 *
 * `merge` folds a later item into the bucket accumulated so far and owns every field but `period`,
 * which is always the bucket key. Neither the input array nor its items are mutated. The day bucket
 * is already at target granularity, so items are returned as-is.
 */
function aggregateByBucket<T extends { period: string }>(
  items: T[],
  bucket: TimeBucket,
  merge: (accumulated: T, item: T) => T,
): T[] {
  if (bucket === 'day') return items;
  const map = new Map<string, T>();
  for (const item of items) {
    const period = getBucketKey(item.period, bucket);
    const accumulated = map.get(period);
    map.set(period, { ...(accumulated ? merge(accumulated, item) : item), period });
  }
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export function aggregatePeriodDuration(items: PeriodDuration[], bucket: TimeBucket): PeriodDuration[] {
  return aggregateByBucket(items, bucket, (accumulated, item) => ({
    ...accumulated,
    sumDays: accumulated.sumDays + item.sumDays,
    maxDays: Math.max(accumulated.maxDays, item.maxDays),
    count: accumulated.count + item.count,
  }));
}

export function aggregatePeriodCount(items: PeriodCount[], bucket: TimeBucket): PeriodCount[] {
  return aggregateByBucket(items, bucket, (accumulated, item) => ({
    ...accumulated,
    count: accumulated.count + item.count,
  }));
}

export function aggregateFalsePositiveRate(items: FalsePositiveRate[], bucket: TimeBucket): FalsePositiveRate[] {
  // Rate is recomputed from the bucket totals (weighted aggregation, not average of averages).
  return aggregateByBucket(items, bucket, (accumulated, item) => ({
    ...accumulated,
    fpCount: accumulated.fpCount + item.fpCount,
    closedCount: accumulated.closedCount + item.closedCount,
  })).map((item) => ({ ...item, rate: toPercent(item.fpCount, item.closedCount) }));
}

export function aggregateCaseSlaStatusByDate(items: CaseSlaStatusByDate[], bucket: TimeBucket): CaseSlaStatusByDate[] {
  return aggregateByBucket(items, bucket, (accumulated, item) => ({
    ...accumulated,
    count: accumulated.count + item.count,
    completedWithinSla: accumulated.completedWithinSla + item.completedWithinSla,
    slaBreached: accumulated.slaBreached + item.slaBreached,
    stillOpenWithinSla: accumulated.stillOpenWithinSla + item.stillOpenWithinSla,
  }));
}

// endregion
