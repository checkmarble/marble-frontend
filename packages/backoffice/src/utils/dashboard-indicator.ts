import type { DashboardIndicator, DashboardRecentRecord } from 'marble-api';

export type DashboardMeasure = 'all' | 'new';
export type SeriesPoint = { start: string; end: string; value: number | null; partial: boolean };

export type IndicatorSummary = {
  total: number;
  series: Record<DashboardMeasure, SeriesPoint[]>;
  /** Listed population change between the first and last weeks with known history. */
  netChange: { value: number; since: string } | null;
  /** Records created during the period; `complete` is false when some weeks have no history. */
  created: { value: number; complete: boolean } | null;
  hints: Record<DashboardMeasure, string[]>;
  recent:
    | { kind: 'records'; items: DashboardRecentRecord[]; someDatesUnknown: boolean }
    | { kind: 'none'; reason: 'no-records' | 'no-known-dates' };
};

export function summarizeIndicator(indicator: DashboardIndicator): IndicatorSummary {
  const series = {
    all: indicator.weeks.map((week) => ({ start: week.start, end: week.end, value: week.all, partial: week.partial })),
    new: indicator.weeks.map((week) => ({ start: week.start, end: week.end, value: week.new, partial: week.partial })),
  };
  const knownAll = series.all.flatMap((point) => (point.value === null ? [] : [{ ...point, value: point.value }]));
  const firstAll = knownAll[0];
  const lastAll = knownAll.at(-1);
  const knownNew = series.new.flatMap((point) => (point.value === null ? [] : [point.value]));

  return {
    total: indicator.total,
    series,
    netChange:
      firstAll && lastAll && knownAll.length > 1
        ? { value: lastAll.value - firstAll.value, since: firstAll.start }
        : null,
    created:
      knownNew.length > 0
        ? { value: knownNew.reduce((sum, value) => sum + value, 0), complete: knownNew.length === series.new.length }
        : null,
    hints: { all: hintLines(indicator, 'all'), new: hintLines(indicator, 'new') },
    recent:
      indicator.recent.length > 0
        ? {
            kind: 'records',
            items: indicator.recent,
            someDatesUnknown: indicator.recent_has_unknown && indicator.recent.length < 3,
          }
        : { kind: 'none', reason: indicator.total === 0 ? 'no-records' : 'no-known-dates' },
  };
}

function hintLines(indicator: DashboardIndicator, measure: DashboardMeasure): string[] {
  const hasGaps = indicator.weeks.some((week) => week[measure] === null);
  const hasPartialWeeks = indicator.weeks.some((week) => week.partial);
  const coverageSince = measure === 'all' ? indicator.coverage.all_since : indicator.coverage.new_since;
  return [
    hasGaps ? 'Shaded weeks have no audit history: unknown, not zero.' : null,
    hasGaps && coverageSince
      ? `Reliable ${measure === 'all' ? 'population' : 'creation'} history from ${formatDateTime(coverageSince)} UTC.`
      : null,
    hasGaps && !coverageSince ? 'Historical audit coverage has not been established.' : null,
    hasPartialWeeks
      ? `${measure === 'all' ? 'Hollow points' : 'Lighter bars'} mark partial weeks at the range, coverage, or current-week boundary.`
      : null,
  ].filter((line) => line !== null);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat('en-GB').format(value);
}

export function formatSigned(value: number) {
  return `${value > 0 ? '+' : value < 0 ? '−' : '±'}${formatCount(Math.abs(value))}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(
    new Date(value),
  );
}
