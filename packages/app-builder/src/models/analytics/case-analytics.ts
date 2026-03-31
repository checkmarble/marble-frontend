import type { BarDatum } from '@nivo/bar';

export type TimeBucket = 'week' | 'month' | 'quarter' | 'year';

export interface CaseAnalyticsFilters {
  startDate: string;
  endDate: string;
  timeBucket: TimeBucket;
  inboxId?: string;
}

export interface PeriodDelay {
  period: string;
  avgDays: number;
  maxDays: number;
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

export interface SlaViolation {
  period: string;
  aboveCount: number;
  totalCount: number;
}

export interface CaseAnalyticsResponse {
  // SAR
  sarTotalCompleted: number;
  sarDelayByPeriod: PeriodDelay[];
  sarDelayDistribution: BucketCount[];
  // Alerts
  alertCountByPeriod: PeriodCount[];
  falsePositiveRateByPeriod: FalsePositiveRate[];
  // Processing
  caseDurationByPeriod: PeriodDelay[];
  openCasesByAge: BucketCount[];
  // SLA (mocked)
  casesAboveSla: SlaViolation[];
}

/**
 * Helper type to satisfy nivo's BarDatum constraint at call sites.
 * Use: `data={items as BarData<PeriodDelay>[]}`
 */
export type BarData<T> = T & BarDatum;
