import {
  type BarData,
  type BucketCount,
  type PeriodAverage,
  type PeriodDuration,
  toPeriodAverage,
} from '@app-builder/models/analytics/case-analytics';
import { useFormatLanguage } from '@app-builder/utils/format';
import { ResponsiveBar } from '@nivo/bar';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartEmptyState } from './ChartEmptyState';
import {
  CASE_ANALYTICS_COLORS,
  CHART_LEGEND_OFFSET,
  formatPeriodTick,
  formatPeriodTooltip,
  getXTickValues,
  isSamePeriodYear,
  nivoTheme,
  tooltipStyle,
} from './chart-theme';

interface SarDelayChartProps {
  delayByPeriod: PeriodDuration[];
  delayDistribution: BucketCount[];
}

export function SarDelayChart({ delayByPeriod, delayDistribution }: SarDelayChartProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();

  const chartData = useMemo(() => delayByPeriod.map(toPeriodAverage), [delayByPeriod]);
  const sameYear = useMemo(() => isSamePeriodYear(chartData.map((d) => d.period)), [chartData]);
  const xTickValues = useMemo(() => getXTickValues(chartData, 'period'), [chartData]);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.sar.delay_title')}</span>

      <div className="flex flex-col gap-v2-lg xl:flex-row">
        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.sar.delay_by_period')}</span>
          <div className="flex-1">
            {chartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<PeriodAverage>>
                data={chartData as BarData<PeriodAverage>[]}
                keys={['avgDays', 'maxDays']}
                indexBy="period"
                groupMode="grouped"
                enableLabel={false}
                padding={0.3}
                margin={{ top: 5, right: 5, bottom: CHART_LEGEND_OFFSET, left: 50 }}
                colors={[CASE_ANALYTICS_COLORS.primary, CASE_ANALYTICS_COLORS.primaryLight]}
                valueScale={{ type: 'linear' }}
                axisBottom={{
                  tickRotation: -30,
                  tickValues: xTickValues,
                  format: (value: string) => formatPeriodTick(value, language, sameYear),
                }}
                axisLeft={{}}
                tooltip={({ id, value, indexValue, data }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-secondary">
                      {formatPeriodTooltip(String(indexValue), language)}
                    </span>
                    <span className="text-s font-semibold">
                      {t(`cases:analytics.chart.${String(id)}`)}: {value} {t('cases:analytics.chart.days')}
                    </span>
                    <span className="text-xs text-grey-secondary">
                      {data.count} {t('cases:analytics.sar.reports')}
                    </span>
                  </div>
                )}
                theme={nivoTheme}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    itemWidth: 100,
                    itemHeight: 20,
                    translateY: CHART_LEGEND_OFFSET,
                  },
                ]}
              />
            )}
          </div>
        </div>

        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.sar.delay_distribution')}</span>
          <div className="flex-1">
            {delayDistribution.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<BucketCount>>
                data={delayDistribution as BarData<BucketCount>[]}
                keys={['count']}
                indexBy="bucket"
                layout="horizontal"
                enableLabel={false}
                padding={0.4}
                margin={{ top: 5, right: 20, bottom: 24, left: 90 }}
                colors={[CASE_ANALYTICS_COLORS.primary]}
                valueScale={{ type: 'linear' }}
                axisLeft={{
                  format: (v: string) => v,
                }}
                tooltip={({ indexValue, value }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s">
                      {indexValue}: <strong>{value}</strong>
                    </span>
                  </div>
                )}
                theme={nivoTheme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
