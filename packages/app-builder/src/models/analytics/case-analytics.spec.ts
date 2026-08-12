import { describe, expect, it } from 'vitest';
import {
  aggregateCaseSlaStatusByDate,
  aggregateFalsePositiveRate,
  aggregatePeriodCount,
  aggregatePeriodDuration,
  type CaseSlaStatusByDate,
  type FalsePositiveRate,
  type PeriodCount,
  type PeriodDuration,
} from './case-analytics';

describe('aggregatePeriodCount', () => {
  const items: PeriodCount[] = [
    { period: '2026-01-05', count: 2 },
    { period: '2026-01-20', count: 3 },
    { period: '2026-04-02', count: 7 },
  ];

  it('returns items untouched for the day bucket', () => {
    expect(aggregatePeriodCount(items, 'day')).toEqual(items);
  });

  it('sums counts into month buckets', () => {
    expect(aggregatePeriodCount(items, 'month')).toEqual([
      { period: '2026-01', count: 5 },
      { period: '2026-04', count: 7 },
    ]);
  });

  it('sums counts into quarter buckets', () => {
    expect(aggregatePeriodCount(items, 'quarter')).toEqual([
      { period: '2026-Q1', count: 5 },
      { period: '2026-Q2', count: 7 },
    ]);
  });

  it('sorts buckets chronologically regardless of input order', () => {
    const unordered: PeriodCount[] = [
      { period: '2026-12-01', count: 1 },
      { period: '2026-02-01', count: 2 },
    ];

    expect(aggregatePeriodCount(unordered, 'month').map((item) => item.period)).toEqual(['2026-02', '2026-12']);
  });

  it('does not mutate the input items', () => {
    const input: PeriodCount[] = [
      { period: '2026-01-05', count: 2 },
      { period: '2026-01-20', count: 3 },
    ];
    aggregatePeriodCount(input, 'month');

    expect(input).toEqual([
      { period: '2026-01-05', count: 2 },
      { period: '2026-01-20', count: 3 },
    ]);
  });
});

describe('aggregatePeriodDuration', () => {
  it('sums durations and counts but takes the max of maxDays', () => {
    const items: PeriodDuration[] = [
      { period: '2026-01-05', sumDays: 10, maxDays: 4, count: 3 },
      { period: '2026-01-20', sumDays: 5, maxDays: 9, count: 2 },
      { period: '2026-02-01', sumDays: 1, maxDays: 1, count: 1 },
    ];

    expect(aggregatePeriodDuration(items, 'month')).toEqual([
      { period: '2026-01', sumDays: 15, maxDays: 9, count: 5 },
      { period: '2026-02', sumDays: 1, maxDays: 1, count: 1 },
    ]);
  });
});

describe('aggregateFalsePositiveRate', () => {
  it('recomputes the rate from bucket totals rather than averaging daily rates', () => {
    // Averaging the daily rates would give (100 + 0) / 2 = 50%; the weighted rate is 1/100 = 1%.
    const items: FalsePositiveRate[] = [
      { period: '2026-01-05', rate: 100, fpCount: 1, closedCount: 1 },
      { period: '2026-01-20', rate: 0, fpCount: 0, closedCount: 99 },
    ];

    expect(aggregateFalsePositiveRate(items, 'month')).toEqual([
      { period: '2026-01', rate: 1, fpCount: 1, closedCount: 100 },
    ]);
  });

  it('yields a zero rate when nothing closed in the bucket', () => {
    const items: FalsePositiveRate[] = [
      { period: '2026-01-05', rate: 0, fpCount: 0, closedCount: 0 },
      { period: '2026-01-20', rate: 0, fpCount: 0, closedCount: 0 },
    ];

    expect(aggregateFalsePositiveRate(items, 'month')).toEqual([
      { period: '2026-01', rate: 0, fpCount: 0, closedCount: 0 },
    ]);
  });

  it('leaves daily rates as-is for the day bucket', () => {
    const items: FalsePositiveRate[] = [{ period: '2026-01-05', rate: 25, fpCount: 1, closedCount: 4 }];

    expect(aggregateFalsePositiveRate(items, 'day')).toEqual(items);
  });
});

describe('aggregateCaseSlaStatusByDate', () => {
  it('sums every SLA status and the derived total into buckets', () => {
    const items: CaseSlaStatusByDate[] = [
      { period: '2026-01-05', count: 6, completedWithinSla: 3, slaBreached: 2, stillOpenWithinSla: 1 },
      { period: '2026-01-20', count: 4, completedWithinSla: 1, slaBreached: 1, stillOpenWithinSla: 2 },
      { period: '2026-05-02', count: 1, completedWithinSla: 1, slaBreached: 0, stillOpenWithinSla: 0 },
    ];

    expect(aggregateCaseSlaStatusByDate(items, 'quarter')).toEqual([
      { period: '2026-Q1', count: 10, completedWithinSla: 4, slaBreached: 3, stillOpenWithinSla: 3 },
      { period: '2026-Q2', count: 1, completedWithinSla: 1, slaBreached: 0, stillOpenWithinSla: 0 },
    ]);
  });

  it('keeps count equal to the sum of the three statuses', () => {
    const items: CaseSlaStatusByDate[] = [
      { period: '2026-03-01', count: 3, completedWithinSla: 1, slaBreached: 1, stillOpenWithinSla: 1 },
      { period: '2026-03-15', count: 3, completedWithinSla: 2, slaBreached: 0, stillOpenWithinSla: 1 },
    ];

    const [bucket] = aggregateCaseSlaStatusByDate(items, 'month');

    expect(bucket?.count).toBe(
      (bucket?.completedWithinSla ?? 0) + (bucket?.slaBreached ?? 0) + (bucket?.stillOpenWithinSla ?? 0),
    );
  });
});
