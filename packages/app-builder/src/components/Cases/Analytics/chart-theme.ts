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
  primary: '#8B5CF6',
  primaryLight: '#C4B5FD',
  secondary: '#3B82F6',
  secondaryLight: '#93C5FD',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;
