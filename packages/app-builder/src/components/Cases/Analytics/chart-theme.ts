export const nivoTheme = {
  text: { fill: 'var(--color-grey-secondary)' },
  axis: { ticks: { text: { fill: 'var(--color-grey-secondary)' } } },
  legends: { text: { fill: 'var(--color-grey-secondary)' } },
  grid: {
    line: {
      stroke: 'var(--color-grey-border)',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
};

export const tooltipStyle =
  'flex flex-col gap-v2-xs bg-surface-card p-v2-sm rounded-lg border border-grey-border shadow-sm';

export const CASE_ANALYTICS_COLORS = {
  primary: 'var(--color-purple-primary)',
  primaryLight: 'var(--color-purple-secondary)',
  secondary: 'var(--color-blue-58)',
  secondaryLight: 'var(--color-blue-96)',
  success: 'var(--color-green-primary)',
  warning: 'var(--color-yellow-primary)',
  danger: 'var(--color-red-primary)',
} as const;

/**
 * Formats a period key (YYYY-MM-DD / YYYY-MM / YYYY-Q[1-4]) to a short, localized axis tick label.
 * Year is included only when the date range spans multiple years.
 */
export function formatPeriodTick(period: string, language: string, isSameYear: boolean): string {
  // Quarter: 'YYYY-Q[1-4]'
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarterMatch) {
    const [, year, q] = quarterMatch;
    return isSameYear ? `Q${q}` : `Q${q} ${year}`;
  }

  // Month: 'YYYY-MM'
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString(language, {
      month: 'short',
      year: isSameYear ? undefined : 'numeric',
    });
  }

  // Day: 'YYYY-MM-DD' (or any parseable ISO date)
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
    year: isSameYear ? undefined : 'numeric',
  });
}

/**
 * Longer form of the period label for tooltip display.
 */
export function formatPeriodTooltip(period: string, language: string): string {
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarterMatch) {
    const [, year, q] = quarterMatch;
    return `Q${q} ${year}`;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString(language, { month: 'long', year: 'numeric' });
  }

  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Picks a subset of tick values to keep the x-axis readable at small chart widths.
 * Keeps the first/last and thins out the middle when there are many points.
 */
export function getXTickValues<T>(data: T[], indexBy: keyof T): string[] {
  if (data.length === 0) return [];
  const values = data.map((d) => String(d[indexBy]));
  if (values.length <= 8) return values;
  // Keep every Nth value, always including the first and last
  const step = Math.ceil(values.length / 8);
  const picked = values.filter((_, i) => i % step === 0);
  const last = values[values.length - 1];
  if (last && picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}

/**
 * Determines whether all periods in the dataset fall within the same year.
 * Used to decide whether tick labels should include the year.
 */
export function isSamePeriodYear(periods: string[]): boolean {
  if (periods.length === 0) return true;
  const years = new Set(periods.map((p) => p.slice(0, 4)));
  return years.size === 1;
}
