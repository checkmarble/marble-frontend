import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

import { alertsI18n } from '../../alerts-i18n';
import { useMessageFilter } from '../AlertsFiltersContext';

export function MessageFilter({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation(alertsI18n);
  const { messageFilter, setMessageFilter } = useMessageFilter();

  return (
    <form className="flex grow items-center">
      <Input
        className="w-full max-w-md"
        disabled={disabled}
        type="search"
        aria-label={t('transfercheck:alerts.search.placeholder')}
        placeholder={t('transfercheck:alerts.search.placeholder')}
        startAdornment="search"
        value={messageFilter ?? ''}
        onChange={(event) => {
          setMessageFilter(event.target.value || null);
        }}
      />
    </form>
  );
}
