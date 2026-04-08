import type { BarData, BucketCount, PeriodDuration } from '@app-builder/models/analytics/case-analytics';
import { useFormatLanguage } from '@app-builder/utils/format';
import { ResponsiveBar } from '@nivo/bar';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartEmptyState } from './ChartEmptyState';
import {
  CASE_ANALYTICS_COLORS,
  formatPeriodTick,
  formatPeriodTooltip,
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

  const sameYear = useMemo(() => isSamePeriodYear(caseDurationByPeriod.map((d) => d.period)), [caseDurationByPeriod]);
  const xTickValues = useMemo(() => getXTickValues(caseDurationByPeriod, 'period'), [caseDurationByPeriod]);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.processing.title')}</span>

      <div className="flex flex-col gap-v2-lg xl:flex-row">
        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.processing.duration_by_period')}</span>
          <div className="flex-1">
            {caseDurationByPeriod.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<PeriodDuration>>
                data={caseDurationByPeriod as BarData<PeriodDuration>[]}
                keys={['sumDays', 'maxDays', 'count']}
                indexBy="period"
                groupMode="grouped"
                enableLabel={false}
                padding={0.3}
                margin={{ top: 5, right: 5, bottom: 40, left: 50 }}
                colors={[
                  CASE_ANALYTICS_COLORS.success,
                  CASE_ANALYTICS_COLORS.secondaryLight,
                  CASE_ANALYTICS_COLORS.secondary,
                ]}
                valueScale={{ type: 'linear' }}
                axisBottom={{
                  tickRotation: -30,
                  tickValues: xTickValues,
                  format: (value: string) => formatPeriodTick(value, language, sameYear),
                }}
                axisLeft={{}}
                tooltip={({ id, value, indexValue }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-secondary">
                      {formatPeriodTooltip(String(indexValue), language)}
                    </span>
                    <span className="text-s font-semibold">
                      {t(`cases:analytics.chart.${String(id)}`)}: {value}
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
                    translateY: 40,
                  },
                ]}
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
                margin={{ top: 5, right: 20, bottom: 24, left: 90 }}
                colors={[CASE_ANALYTICS_COLORS.secondary]}
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
