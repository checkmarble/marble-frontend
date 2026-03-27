import { useTranslation } from 'react-i18next';

interface SarReportsGaugeProps {
  total: number;
}

export function SarReportsGauge({ total }: SarReportsGaugeProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="bg-surface-card border-grey-border flex flex-col gap-v2-sm rounded-v2-lg border p-v2-md">
      <span className="text-s font-medium">{t('cases:analytics.sar.completed_title')}</span>
      <div className="flex items-baseline gap-v2-xs">
        <span className="text-4xl font-bold text-purple-primary">{total}</span>
        <span className="text-s text-grey-secondary">{t('cases:analytics.sar.reports')}</span>
      </div>
    </div>
  );
}
