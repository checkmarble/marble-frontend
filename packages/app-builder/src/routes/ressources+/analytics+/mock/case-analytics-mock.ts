import type {
  BucketCount,
  CaseAnalyticsResponse,
  FalsePositiveRate,
  PeriodCount,
  PeriodDelay,
  SlaViolation,
  TimeBucket,
} from '@app-builder/models/analytics/case-analytics';
import { eachMonthOfInterval, eachQuarterOfInterval, eachWeekOfInterval, eachYearOfInterval, format } from 'date-fns';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getPeriodLabels(start: Date, end: Date, timeBucket: TimeBucket): string[] {
  switch (timeBucket) {
    case 'week':
      return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((d) => format(d, 'yyyy-MM-dd'));
    case 'month':
      return eachMonthOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM'));
    case 'quarter':
      return eachQuarterOfInterval({ start, end }).map((d) => {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        return `${d.getFullYear()}-Q${q}`;
      });
    case 'year':
      return eachYearOfInterval({ start, end }).map((d) => format(d, 'yyyy'));
  }
}

export function generateCaseAnalyticsMock(
  startDate: string,
  endDate: string,
  timeBucket: TimeBucket,
): CaseAnalyticsResponse {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const rand = seededRandom(42);

  const periods = getPeriodLabels(start, end, timeBucket);

  const sarTotalCompleted = Math.floor(80 + rand() * 120);

  const sarDelayByPeriod: PeriodDelay[] = periods.map((period) => ({
    period,
    avgDays: Math.round((3 + rand() * 12) * 10) / 10,
    maxDays: Math.floor(15 + rand() * 30),
  }));

  const sarDelayDistribution: BucketCount[] = [
    { bucket: '< 3 days', count: Math.floor(20 + rand() * 40) },
    { bucket: '3-10 days', count: Math.floor(30 + rand() * 50) },
    { bucket: '11-30 days', count: Math.floor(10 + rand() * 30) },
    { bucket: '> 30 days', count: Math.floor(5 + rand() * 15) },
  ];

  const alertCountByPeriod: PeriodCount[] = periods.map((period) => ({
    period,
    count: Math.floor(50 + rand() * 200),
  }));

  const falsePositiveRateByPeriod: FalsePositiveRate[] = periods.map((period) => {
    const closedCount = Math.floor(40 + rand() * 160);
    const fpCount = Math.floor(closedCount * (0.3 + rand() * 0.4));
    return {
      period,
      rate: Math.round((fpCount / closedCount) * 1000) / 10,
      fpCount,
      closedCount,
    };
  });

  const caseDurationByPeriod: PeriodDelay[] = periods.map((period) => ({
    period,
    avgDays: Math.round((2 + rand() * 8) * 10) / 10,
    maxDays: Math.floor(10 + rand() * 25),
  }));

  const openCasesByAge: BucketCount[] = [
    { bucket: '< 7 days', count: Math.floor(30 + rand() * 60) },
    { bucket: '7-30 days', count: Math.floor(20 + rand() * 40) },
    { bucket: '31-90 days', count: Math.floor(10 + rand() * 20) },
    { bucket: '> 90 days', count: Math.floor(5 + rand() * 15) },
  ];

  const casesAboveSla: SlaViolation[] = periods.map((period) => {
    const totalCount = Math.floor(40 + rand() * 100);
    return {
      period,
      aboveCount: Math.floor(totalCount * (0.05 + rand() * 0.15)),
      totalCount,
    };
  });

  return {
    sarTotalCompleted,
    sarDelayByPeriod,
    sarDelayDistribution,
    alertCountByPeriod,
    falsePositiveRateByPeriod,
    caseDurationByPeriod,
    openCasesByAge,
    casesAboveSla,
  };
}
