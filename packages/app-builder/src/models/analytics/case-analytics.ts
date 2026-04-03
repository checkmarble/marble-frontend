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
