import type { BarData, SlaViolation } from '@app-builder/models/analytics/case-analytics';
import { ResponsiveBar } from '@nivo/bar';
import { useTranslation } from 'react-i18next';

import { CalloutV2 } from '../../Callout';
import { CASE_ANALYTICS_COLORS, nivoTheme, tooltipStyle } from './chart-theme';

interface CasesAboveSlaChartProps {
  casesAboveSla: SlaViolation[];
}

export function CasesAboveSlaChart({ casesAboveSla }: CasesAboveSlaChartProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-md rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.sla.title')}</span>

      <CalloutV2>{t('cases:analytics.sla.mock_notice')}</CalloutV2>

      <div className="flex min-h-64 flex-col gap-v2-xs">
        <span className="text-xs text-grey-secondary">{t('cases:analytics.sla.violations_by_period')}</span>
        <div className="flex-1">
          <ResponsiveBar<BarData<SlaViolation>>
            data={casesAboveSla as BarData<SlaViolation>[]}
            keys={['aboveCount']}
            indexBy="period"
            enableLabel={false}
            padding={0.3}
            margin={{ top: 5, right: 5, bottom: 40, left: 50 }}
            colors={[CASE_ANALYTICS_COLORS.danger]}
            valueScale={{ type: 'linear' }}
            axisBottom={{ tickRotation: -30 }}
            axisLeft={{}}
            tooltip={({ data }) => (
              <div className={tooltipStyle}>
                <span className="text-s text-grey-secondary">{data.period}</span>
                <span className="text-s font-semibold">
                  {data.aboveCount} / {data.totalCount} {t('cases:analytics.sla.above_sla')}
                </span>
              </div>
            )}
            theme={nivoTheme}
          />
        </div>
      </div>
    </div>
  );
}
