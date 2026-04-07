import type { BarDatum } from '@nivo/bar';
import type {
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

export interface BucketCount {
  bucket: string;
  count: number;
}

export interface PeriodCount {
  period: string;
  count: number;
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
    rate: closedCount > 0 ? Math.round((fpCount / closedCount) * 1000) / 10 : 0,
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

export function aggregatePeriodDuration(items: PeriodDuration[], bucket: TimeBucket): PeriodDuration[] {
  if (bucket === 'day') return items;
  const map = new Map<string, PeriodDuration>();
  for (const item of items) {
    const key = getBucketKey(item.period, bucket);
    const existing = map.get(key);
    if (existing) {
      existing.sumDays += item.sumDays;
      existing.count += item.count;
      existing.maxDays = Math.max(existing.maxDays, item.maxDays);
    } else {
      map.set(key, { period: key, sumDays: item.sumDays, maxDays: item.maxDays, count: item.count });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export function aggregatePeriodCount(items: PeriodCount[], bucket: TimeBucket): PeriodCount[] {
  if (bucket === 'day') return items;
  const map = new Map<string, PeriodCount>();
  for (const item of items) {
    const key = getBucketKey(item.period, bucket);
    const existing = map.get(key);
    if (existing) {
      existing.count += item.count;
    } else {
      map.set(key, { period: key, count: item.count });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export function aggregateFalsePositiveRate(items: FalsePositiveRate[], bucket: TimeBucket): FalsePositiveRate[] {
  if (bucket === 'day') return items;
  const map = new Map<string, FalsePositiveRate>();
  for (const item of items) {
    const key = getBucketKey(item.period, bucket);
    const existing = map.get(key);
    if (existing) {
      existing.fpCount += item.fpCount;
      existing.closedCount += item.closedCount;
    } else {
      map.set(key, { period: key, rate: 0, fpCount: item.fpCount, closedCount: item.closedCount });
    }
  }
  // Recompute rate from totals (weighted aggregation, not average of averages)
  return Array.from(map.values())
    .map((item) => ({
      ...item,
      rate: item.closedCount > 0 ? Math.round((item.fpCount / item.closedCount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

// endregion
