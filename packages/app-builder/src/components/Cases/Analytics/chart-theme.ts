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
