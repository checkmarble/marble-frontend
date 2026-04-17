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
  'flex flex-col gap-v2-xs bg-surface-card px-v2-md py-v2-sm rounded-lg border border-grey-border shadow-md min-w-52 w-max whitespace-nowrap';

/**
 * Locale-aware formatter for numeric values in chart tooltips and axes.
 * Uses the user's language for thousand separators and decimal points.
 */
export function formatChartNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Vertical space (in px) reserved at the bottom of a bar chart to fit the
 * x-axis tick labels and the legend strip below. Used as both `margin.bottom`
 * and `legend.translateY` to keep the two values coupled.
 */
export const CHART_LEGEND_OFFSET = 40;

export const CASE_ANALYTICS_COLORS = {
  primary: 'var(--color-purple-primary)',
  primaryLight: 'var(--color-purple-secondary)',
  secondary: 'var(--color-blue-58)',
  secondaryLight: 'var(--color-blue-96)',
  success: 'var(--color-green-primary)',
  warning: 'var(--color-yellow-primary)',
  danger: 'var(--color-red-primary)',
  // New tokens added for the Figma design pass
  yellow: 'var(--color-yellow-primary)',
  yellowLight: 'var(--color-yellow-secondary)',
  orange: 'var(--color-orange-primary)',
  orangeLight: 'var(--color-orange-secondary)',
  red: 'var(--color-red-secondary)',
  green: 'var(--color-green-secondary)',
  purple: 'var(--color-purple-primary)',
  purpleLight: 'var(--color-purple-secondary)',
} as const;

/** Corner radius applied to bars for the Figma rounded look. */
export const BAR_BORDER_RADIUS = 6;

/** Outline width drawn around each bar (in bar's own color). */
export const BAR_BORDER_WIDTH = 1;

/**
 * Builds a nivo `defs` linearGradient entry for a vertical gradient on a bar.
 * Top of the bar uses the color at opacity 0.8; bottom fades to 0.15.
 * Pair with `fill={[{ match: { id: '<key>' }, id: '<gradientId>' }]}` on ResponsiveBar.
 */
export function buildBarGradient(colorVar: string, id: string) {
  return {
    id,
    type: 'linearGradient' as const,
    colors: [
      { offset: 0, color: colorVar, opacity: 0.8 },
      { offset: 100, color: colorVar, opacity: 0.15 },
    ],
  };
}

const DEFAULT_Y_TICKS = [0, 200, 400, 600, 800, 1000];

/**
 * Computes 6 clean integer y-axis ticks from a list of raw numeric values.
 * The top tick is the data max rounded up to the nearest power-of-10 multiple
 * (5, 10, 25, 50, 100, 250, 500, 1000, ...). Returns a safe default for empty data.
 * Lifted from components/Cases/Overview/constants.ts::getYAxisTicksValues.
 */
export function getNiceYAxisTicks(values: number[]): number[] {
  if (values.length === 0) return DEFAULT_Y_TICKS;

  const maxValue = Math.max(...values);
  if (maxValue === 0) return DEFAULT_Y_TICKS;

  const highestPow10Divider = Math.max(10, Math.pow(10, Math.floor(Math.log10(maxValue))));
  const lastTickValue = Math.ceil(maxValue / highestPow10Divider) * highestPow10Divider;

  return Array.from({ length: 6 }, (_, i) => (lastTickValue / 5) * i);
}

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

/**
 * Localizes a backend AnalyticsBracketDto value ('0-2' | '3-10' | '11-30' | '31+')
 * to a human-readable, localized day-range label via the i18n t() function.
 * Unknown bracket values fall through unchanged so chart rendering never breaks.
 */
export function formatBracket(bracket: string, t: (key: string) => string): string {
  switch (bracket) {
    case '0-2':
      return t('cases:analytics.chart.bracket.0_2');
    case '3-10':
      return t('cases:analytics.chart.bracket.3_10');
    case '11-30':
      return t('cases:analytics.chart.bracket.11_30');
    case '31+':
      return t('cases:analytics.chart.bracket.over_30');
    default:
      return bracket;
  }
}
