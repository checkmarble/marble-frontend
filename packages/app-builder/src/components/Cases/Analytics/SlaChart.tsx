import type { BarData, CaseSlaStatusByDate } from '@app-builder/models/analytics/case-analytics';
import { toPercent } from '@app-builder/models/analytics/case-analytics';
import { useFormatLanguage } from '@app-builder/utils/format';
import { ResponsiveBar } from '@nivo/bar';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartEmptyState } from './ChartEmptyState';
import {
  BAR_BORDER_RADIUS,
  BAR_BORDER_WIDTH,
  buildBarGradient,
  CASE_ANALYTICS_COLORS,
  formatChartNumber,
  formatPeriodTick,
  formatPeriodTooltip,
  getNiceYAxisTicks,
  getXTickValues,
  isSamePeriodYear,
  nivoTheme,
  tooltipStyle,
} from './chart-theme';
import { SegmentedToggle } from './SegmentedToggle';

type DisplayMode = 'value' | 'percent';

const DISPLAY_MODES = ['value', 'percent'] as const;

/** Bottom-to-top stacking order: resolved in time, still on track, then breached. */
const STACK_KEYS = ['completedWithinSla', 'stillOpenWithinSla', 'slaBreached'] as const;

const PERCENT_TICKS = [0, 25, 50, 75, 100];

interface SlaChartDatum {
  period: string;
  completedWithinSla: number;
  stillOpenWithinSla: number;
  slaBreached: number;
}

interface SlaChartProps {
  caseSlaStatusByDate: CaseSlaStatusByDate[];
}

export function SlaChart({ caseSlaStatusByDate }: SlaChartProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('value');

  const chartData = useMemo((): SlaChartDatum[] => {
    return caseSlaStatusByDate.map((item) => {
      if (displayMode === 'value') {
        return {
          period: item.period,
          completedWithinSla: item.completedWithinSla,
          stillOpenWithinSla: item.stillOpenWithinSla,
          slaBreached: item.slaBreached,
        };
      }
      // Percentages are shares of every case counted for the period, so the bar always reaches 100%.
      return {
        period: item.period,
        completedWithinSla: toPercent(item.completedWithinSla, item.count),
        stillOpenWithinSla: toPercent(item.stillOpenWithinSla, item.count),
        slaBreached: toPercent(item.slaBreached, item.count),
      };
    });
  }, [caseSlaStatusByDate, displayMode]);

  const sameYear = useMemo(() => isSamePeriodYear(chartData.map((d) => d.period)), [chartData]);
  const xTickValues = useMemo(() => getXTickValues(chartData, 'period'), [chartData]);
  const yTicks = useMemo(() => {
    if (displayMode === 'percent') return PERCENT_TICKS;
    return getNiceYAxisTicks(chartData.map((d) => STACK_KEYS.reduce((total, key) => total + d[key], 0)));
  }, [chartData, displayMode]);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-md rounded-lg border p-md">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <span className="text-s font-medium">{t('cases:analytics.sla.title')}</span>
        <SegmentedToggle
          options={DISPLAY_MODES}
          value={displayMode}
          onChange={setDisplayMode}
          getLabel={(mode) => t(`cases:analytics.sla.display.${mode}`)}
        />
      </div>

      <div className="min-h-64">
        {chartData.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveBar<BarData<SlaChartDatum>>
            data={chartData as BarData<SlaChartDatum>[]}
            keys={[...STACK_KEYS]}
            indexBy="period"
            groupMode="stacked"
            enableLabel={false}
            padding={0.3}
            margin={{ top: 5, right: 5, bottom: 60, left: 50 }}
            colors={[CASE_ANALYTICS_COLORS.green, CASE_ANALYTICS_COLORS.yellow, CASE_ANALYTICS_COLORS.orange]}
            borderRadius={BAR_BORDER_RADIUS}
            borderWidth={BAR_BORDER_WIDTH}
            borderColor={{ from: 'color' }}
            defs={[
              buildBarGradient(CASE_ANALYTICS_COLORS.green, 'grad-sla-completed'),
              buildBarGradient(CASE_ANALYTICS_COLORS.yellow, 'grad-sla-open'),
              buildBarGradient(CASE_ANALYTICS_COLORS.orange, 'grad-sla-breached'),
            ]}
            fill={[
              { match: { id: 'completedWithinSla' }, id: 'grad-sla-completed' },
              { match: { id: 'stillOpenWithinSla' }, id: 'grad-sla-open' },
              { match: { id: 'slaBreached' }, id: 'grad-sla-breached' },
            ]}
            valueScale={{ type: 'linear', min: 0, max: yTicks[yTicks.length - 1] }}
            gridYValues={yTicks}
            axisBottom={{
              tickRotation: 0,
              tickValues: xTickValues,
              format: (value: string) => formatPeriodTick(value, language, sameYear),
            }}
            axisLeft={{
              tickValues: yTicks,
              format: (v: number) => (displayMode === 'percent' ? `${v}%` : formatChartNumber(v, language)),
            }}
            legendLabel={(datum) => t(`cases:analytics.chart.${String(datum.id)}`)}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom',
                direction: 'row',
                itemWidth: 200,
                itemHeight: 20,
                translateY: 56,
                symbolShape: 'circle',
                symbolSize: 10,
              },
            ]}
            tooltip={({ data }) => (
              <div className={tooltipStyle}>
                <span className="text-s text-grey-primary font-semibold">
                  {formatPeriodTooltip(data.period, language)}
                </span>
                {STACK_KEYS.map((key) => (
                  <div key={key} className="flex items-center justify-between gap-md">
                    <span className="text-s text-grey-secondary">{t(`cases:analytics.chart.${key}`)}</span>
                    <span className="text-s text-grey-primary font-semibold">
                      {formatChartNumber(Number(data[key] ?? 0), language)}
                      {displayMode === 'percent' ? '%' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
            theme={nivoTheme}
          />
        )}
      </div>
    </div>
  );
}
