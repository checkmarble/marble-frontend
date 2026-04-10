import { useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';

import { formatChartNumber } from './chart-theme';

interface SarReportsGaugeProps {
  total: number;
}

export function SarReportsGauge({ total }: SarReportsGaugeProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();

  return (
    <div className="bg-surface-card border-grey-border flex h-full flex-col items-center justify-center gap-v2-xs rounded-v2-lg border p-v2-lg">
      <span className="text-s text-grey-secondary">{t('cases:analytics.sar.completed_title')}</span>
      <span className="text-6xl font-bold tracking-tight text-purple-primary">
        {formatChartNumber(total, language)}
      </span>
      <span className="text-s font-medium text-grey-secondary">{t('cases:analytics.sar.reports')}</span>
    </div>
  );
}
