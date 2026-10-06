import { summarizeIndicator } from '@bo/utils/dashboard-indicator';
import type { DashboardIndicator } from 'marble-api';
import { describe, expect, it } from 'vitest';

const week = (start: string, all: number | null, created: number | null, partial = false) => ({
  start,
  end: start,
  all,
  new: created,
  partial,
});

const indicator: DashboardIndicator = {
  total: 12,
  coverage: { all_since: '2026-09-14T00:00:00Z', new_since: null },
  weeks: [
    week('2026-09-07T00:00:00Z', null, null),
    week('2026-09-14T00:00:00Z', 8, 0, true),
    week('2026-09-21T00:00:00Z', 10, 2),
    week('2026-09-28T00:00:00Z', 12, 2, true),
  ],
  recent: [{ id: 'org-1', name: 'Acme', created_at: '2026-09-29T10:00:00Z' }],
  recent_has_unknown: true,
};

describe('summarizeIndicator', () => {
  it('keeps unknown history distinct from a true zero', () => {
    const summary = summarizeIndicator(indicator);
    expect(summary.series.all.map((point) => point.value)).toEqual([null, 8, 10, 12]);
    expect(summary.series.new.map((point) => point.value)).toEqual([null, 0, 2, 2]);
  });

  it('measures net change across known weeks and flags created counts with missing weeks', () => {
    const summary = summarizeIndicator(indicator);
    expect(summary.netChange).toEqual({ value: 4, since: '2026-09-14T00:00:00Z' });
    expect(summary.created).toEqual({ value: 4, complete: false });
  });

  it('reports no change or creations without enough history', () => {
    const summary = summarizeIndicator({ ...indicator, weeks: [week('2026-09-28T00:00:00Z', 12, null)] });
    expect(summary.netChange).toBeNull();
    expect(summary.created).toBeNull();
  });

  it('explains gaps, coverage and partial weeks per measure', () => {
    const { hints } = summarizeIndicator(indicator);
    expect(hints.all).toEqual([
      'Shaded weeks have no audit history: unknown, not zero.',
      'Reliable population history from 14 Sept 2026, 00:00 UTC.',
      'Hollow points mark partial weeks at the range, coverage, or current-week boundary.',
    ]);
    expect(hints.new).toContain('Historical audit coverage has not been established.');
    expect(summarizeIndicator({ ...indicator, weeks: [week('2026-09-28T00:00:00Z', 1, 1)] }).hints.all).toEqual([]);
  });

  it('only flags unknown creation dates when fewer than three records are shown', () => {
    expect(summarizeIndicator(indicator).recent).toMatchObject({ kind: 'records', someDatesUnknown: true });
    const recent = [1, 2, 3].map((i) => ({ id: `org-${i}`, name: `Org ${i}`, created_at: '2026-09-29T10:00:00Z' }));
    expect(summarizeIndicator({ ...indicator, recent }).recent).toMatchObject({ someDatesUnknown: false });
    expect(summarizeIndicator({ ...indicator, recent: [] }).recent).toEqual({
      kind: 'none',
      reason: 'no-known-dates',
    });
    expect(summarizeIndicator({ ...indicator, total: 0, recent: [] }).recent).toEqual({
      kind: 'none',
      reason: 'no-records',
    });
  });
});
