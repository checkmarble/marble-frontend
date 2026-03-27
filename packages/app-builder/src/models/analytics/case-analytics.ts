export type TimeBucket = 'week' | 'month' | 'quarter' | 'year';

export interface CaseAnalyticsFilters {
  startDate: string;
  endDate: string;
  timeBucket: TimeBucket;
  inboxId?: string;
}

export interface PeriodDelay {
  [key: string]: string | number;
  period: string;
  avgDays: number;
  maxDays: number;
}

export interface BucketCount {
  [key: string]: string | number;
  bucket: string;
  count: number;
}

export interface PeriodCount {
  [key: string]: string | number;
  period: string;
  count: number;
}

export interface FalsePositiveRate {
  [key: string]: string | number;
  period: string;
  rate: number;
  fpCount: number;
  closedCount: number;
}

export interface SlaViolation {
  [key: string]: string | number;
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
