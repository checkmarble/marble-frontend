import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Calendar } from 'ui-design-system';

import { useStartedAfterFilter } from '../TestRunsFiltersContext';

export function StartedAfterFilter() {
  const { startedAfter, setStartedAfter } = useStartedAfterFilter();
  const language = useFormatLanguage();

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={startedAfter}
        onSelect={setStartedAfter}
        locale={getDateFnsLocale(language)}
      />
    </div>
  );
}
