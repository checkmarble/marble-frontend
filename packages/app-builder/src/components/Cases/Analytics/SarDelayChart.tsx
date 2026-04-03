import type { BarData, BucketCount, PeriodDuration } from '@app-builder/models/analytics/case-analytics';
import { ResponsiveBar } from '@nivo/bar';
import { useTranslation } from 'react-i18next';

import { CASE_ANALYTICS_COLORS, nivoTheme, tooltipStyle } from './chart-theme';

interface SarDelayChartProps {
  delayByPeriod: PeriodDuration[];
  delayDistribution: BucketCount[];
}

export function SarDelayChart({ delayByPeriod, delayDistribution }: SarDelayChartProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.sar.delay_title')}</span>

      <div className="flex flex-col gap-v2-lg xl:flex-row">
        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.sar.delay_by_period')}</span>
          <div className="flex-1">
            <ResponsiveBar<BarData<PeriodDuration>>
              data={delayByPeriod as BarData<PeriodDuration>[]}
              keys={['sumDays', 'maxDays', 'count']}
              indexBy="period"
              groupMode="grouped"
              enableLabel={false}
              padding={0.3}
              margin={{ top: 5, right: 5, bottom: 40, left: 50 }}
              colors={[
                CASE_ANALYTICS_COLORS.primary,
                CASE_ANALYTICS_COLORS.primaryLight,
                CASE_ANALYTICS_COLORS.secondary,
              ]}
              valueScale={{ type: 'linear' }}
              axisBottom={{
                tickRotation: -30,
                format: (v: string) => v,
              }}
              axisLeft={{}}
              tooltip={({ id, value, indexValue }) => (
                <div className={tooltipStyle}>
                  <span className="text-s text-grey-secondary">{indexValue}</span>
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
          </div>
        </div>

        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.sar.delay_distribution')}</span>
          <div className="flex-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
