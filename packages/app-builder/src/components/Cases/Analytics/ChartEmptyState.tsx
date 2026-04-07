import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function ChartEmptyState() {
  const { t } = useTranslation(['cases']);

  return (
    <div className="border-grey-border bg-grey-background-light flex h-full min-h-48 flex-col items-center justify-center gap-v2-xs rounded-v2-md border border-dashed p-v2-md">
      <Icon icon="analytics" className="text-grey-secondary size-6" />
      <span className="text-s text-grey-secondary text-center">{t('cases:analytics.chart.empty_state')}</span>
    </div>
  );
}
