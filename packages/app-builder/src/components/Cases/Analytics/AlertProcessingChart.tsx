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
  BAR_BORDER_RADIUS,
  BAR_BORDER_WIDTH,
  buildBarGradient,
  CASE_ANALYTICS_COLORS,
  formatBracket,
  formatChartNumber,
  formatPeriodTick,
  formatPeriodTooltip,
  getNiceYAxisTicks,
  getXTickValues,
  isSamePeriodYear,
  nivoTheme,
  tooltipStyle,
} from './chart-theme';

interface AlertProcessingChartProps {
  caseDurationByPeriod: PeriodDuration[];
  openCasesByAge: BucketCount[];
}

export function AlertProcessingChart({ caseDurationByPeriod, openCasesByAge }: AlertProcessingChartProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();

  const chartData = useMemo(() => caseDurationByPeriod.map(toPeriodAverage), [caseDurationByPeriod]);
  const sameYear = useMemo(() => isSamePeriodYear(chartData.map((d) => d.period)), [chartData]);
  const xTickValues = useMemo(() => getXTickValues(chartData, 'period'), [chartData]);

  const yTicks = useMemo(() => getNiceYAxisTicks(chartData.flatMap((d) => [d.avgDays, d.maxDays])), [chartData]);

  const openCasesYTicks = useMemo(() => getNiceYAxisTicks(openCasesByAge.map((d) => d.count)), [openCasesByAge]);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.processing.title')}</span>

      <div className="flex flex-col gap-v2-lg xl:flex-row">
        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.processing.duration_by_period')}</span>
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
                innerPadding={2}
                margin={{ top: 5, right: 5, bottom: 60, left: 50 }}
                colors={[CASE_ANALYTICS_COLORS.success, CASE_ANALYTICS_COLORS.secondary]}
                borderRadius={BAR_BORDER_RADIUS}
                borderWidth={BAR_BORDER_WIDTH}
                borderColor={{ from: 'color' }}
                defs={[
                  buildBarGradient(CASE_ANALYTICS_COLORS.success, 'grad-duration-avg'),
                  buildBarGradient(CASE_ANALYTICS_COLORS.secondary, 'grad-duration-max'),
                ]}
                fill={[
                  { match: { id: 'avgDays' }, id: 'grad-duration-avg' },
                  { match: { id: 'maxDays' }, id: 'grad-duration-max' },
                ]}
                valueScale={{ type: 'linear', min: 0, max: yTicks[yTicks.length - 1] }}
                axisBottom={{
                  tickRotation: 0,
                  tickValues: xTickValues,
                  format: (value: string) => formatPeriodTick(value, language, sameYear),
                }}
                axisLeft={{
                  tickValues: yTicks,
                  format: (v: number) => formatChartNumber(v, language),
                }}
                legendLabel={(datum) => t(`cases:analytics.chart.${String(datum.id)}`)}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    itemWidth: 110,
                    itemHeight: 20,
                    translateY: 56,
                    symbolShape: 'circle',
                    symbolSize: 10,
                  },
                ]}
                tooltip={({ id, value, indexValue, data }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-primary font-semibold">
                      {formatPeriodTooltip(String(indexValue), language)}
                    </span>
                    <div className="flex items-center justify-between gap-v2-md">
                      <span className="text-s text-grey-secondary">{t(`cases:analytics.chart.${String(id)}`)}</span>
                      <span className="text-s text-grey-primary font-semibold">
                        {formatChartNumber(value, language)} {t('cases:analytics.chart.days')}
                      </span>
                    </div>
                    <span className="text-xs text-grey-secondary">
                      {formatChartNumber(data.count, language)} {t('cases:analytics.chart.cases_lower')}
                    </span>
                  </div>
                )}
                theme={nivoTheme}
              />
            )}
          </div>
        </div>

        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.processing.open_by_age')}</span>
          <div className="flex-1">
            {openCasesByAge.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<BucketCount>>
                data={openCasesByAge as BarData<BucketCount>[]}
                keys={['count']}
                indexBy="bucket"
                layout="horizontal"
                enableLabel={false}
                padding={0.4}
                margin={{ top: 5, right: 20, bottom: 40, left: 90 }}
                colors={[CASE_ANALYTICS_COLORS.secondary]}
                borderRadius={BAR_BORDER_RADIUS}
                borderWidth={BAR_BORDER_WIDTH}
                borderColor={{ from: 'color' }}
                defs={[buildBarGradient(CASE_ANALYTICS_COLORS.secondary, 'grad-open-cases')]}
                fill={[{ match: { id: 'count' }, id: 'grad-open-cases' }]}
                valueScale={{ type: 'linear', min: 0, max: openCasesYTicks[openCasesYTicks.length - 1] }}
                axisBottom={{
                  tickValues: openCasesYTicks,
                  format: (v: number) => formatChartNumber(v, language),
                }}
                axisLeft={{
                  format: (v: string) => formatBracket(v, t),
                }}
                tooltip={({ indexValue, value }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-primary font-semibold">
                      {formatBracket(String(indexValue), t)}
                    </span>
                    <div className="flex items-center justify-between gap-v2-md">
                      <span className="text-s text-grey-secondary">{t('cases:analytics.chart.cases_lower')}</span>
                      <span className="text-s text-grey-primary font-semibold">
                        {formatChartNumber(value, language)}
                      </span>
                    </div>
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
