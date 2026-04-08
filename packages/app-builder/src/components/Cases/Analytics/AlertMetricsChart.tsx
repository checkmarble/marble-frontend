import type { BarData, FalsePositiveRate, PeriodCount } from '@app-builder/models/analytics/case-analytics';
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

interface AlertMetricsChartProps {
  alertCountByPeriod: PeriodCount[];
  falsePositiveRateByPeriod: FalsePositiveRate[];
}

export function AlertMetricsChart({ alertCountByPeriod, falsePositiveRateByPeriod }: AlertMetricsChartProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();

  const alertSameYear = useMemo(() => isSamePeriodYear(alertCountByPeriod.map((d) => d.period)), [alertCountByPeriod]);
  const alertXTickValues = useMemo(() => getXTickValues(alertCountByPeriod, 'period'), [alertCountByPeriod]);

  const fpSameYear = useMemo(
    () => isSamePeriodYear(falsePositiveRateByPeriod.map((d) => d.period)),
    [falsePositiveRateByPeriod],
  );
  const fpXTickValues = useMemo(() => getXTickValues(falsePositiveRateByPeriod, 'period'), [falsePositiveRateByPeriod]);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.alerts.title')}</span>

      <div className="flex flex-col gap-v2-lg xl:flex-row">
        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.alerts.count_by_period')}</span>
          <div className="flex-1">
            {alertCountByPeriod.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<PeriodCount>>
                data={alertCountByPeriod as BarData<PeriodCount>[]}
                keys={['count']}
                indexBy="period"
                enableLabel={false}
                padding={0.3}
                margin={{ top: 5, right: 5, bottom: 40, left: 50 }}
                colors={[CASE_ANALYTICS_COLORS.secondary]}
                valueScale={{ type: 'linear' }}
                axisBottom={{
                  tickRotation: -30,
                  tickValues: alertXTickValues,
                  format: (value: string) => formatPeriodTick(value, language, alertSameYear),
                }}
                axisLeft={{}}
                tooltip={({ indexValue, value }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-secondary">
                      {formatPeriodTooltip(String(indexValue), language)}
                    </span>
                    <span className="text-s font-semibold">
                      {t('cases:analytics.alerts.count_label')}: {value}
                    </span>
                  </div>
                )}
                theme={nivoTheme}
              />
            )}
          </div>
        </div>

        <div className="flex min-h-64 flex-1 flex-col gap-v2-xs">
          <span className="text-xs text-grey-secondary">{t('cases:analytics.alerts.fp_rate_by_period')}</span>
          <div className="flex-1">
            {falsePositiveRateByPeriod.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveBar<BarData<FalsePositiveRate>>
                data={falsePositiveRateByPeriod as BarData<FalsePositiveRate>[]}
                keys={['rate']}
                indexBy="period"
                enableLabel={false}
                padding={0.3}
                margin={{ top: 5, right: 5, bottom: 40, left: 40 }}
                colors={[CASE_ANALYTICS_COLORS.warning]}
                valueScale={{ type: 'linear', min: 0, max: 100 }}
                gridYValues={[0, 25, 50, 75, 100]}
                axisBottom={{
                  tickRotation: -30,
                  tickValues: fpXTickValues,
                  format: (value: string) => formatPeriodTick(value, language, fpSameYear),
                }}
                axisLeft={{
                  tickValues: [0, 25, 50, 75, 100],
                  format: (v: number) => `${v}%`,
                }}
                tooltip={({ data }) => (
                  <div className={tooltipStyle}>
                    <span className="text-s text-grey-secondary">{formatPeriodTooltip(data.period, language)}</span>
                    <span className="text-s font-semibold">
                      {t('cases:analytics.alerts.fp_rate')}: {data.rate}%
                    </span>
                    <span className="text-xs text-grey-secondary">
                      {data.fpCount} / {data.closedCount} {t('cases:analytics.alerts.closed')}
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
