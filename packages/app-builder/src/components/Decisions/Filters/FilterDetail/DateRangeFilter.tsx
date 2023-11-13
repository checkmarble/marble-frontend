import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTime } from '@app-builder/utils/format';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, type DateRange } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useDateRangeFilter } from '../DecisionFiltersContext';

export function DateRangeFilter() {
  const {
    i18n: { language },
  } = useTranslation(decisionsI18n);
  const {
    dateRange: { startDate, endDate },
    setDateRange,
  } = useDateRangeFilter();

  const from = startDate ? new Date(startDate) : undefined;
  const to = endDate ? new Date(endDate) : undefined;
  const selected = from || to ? { from, to } : undefined;

  const onSelect = useCallback(
    (range?: DateRange) => {
      const startDate = range?.from?.toISOString() ?? '';
      const endDate = range?.to?.toISOString() ?? '';

      setDateRange({
        startDate,
        endDate,
      });
    },
    [setDateRange]
  );

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={onSelect}
          defaultMonth={from}
          locale={getDateFnsLocale(language)}
        />
      </div>
      <div className="border-t-grey-10 grid grid-cols-[1fr_max-content_1fr] gap-1 border-t p-4">
        <span
          className={clsx(
            'border-grey-10 h-10 w-fit justify-self-end rounded border p-2',
            from ? 'text-grey-100' : 'text-grey-50'
          )}
        >
          {from
            ? formatDateTime(from, {
                language,
                timeStyle: undefined,
              })
            : '--/--/----'}
        </span>
        <span className="text-l self-center">&#x2192;</span>
        <span
          className={clsx(
            'border-grey-10  h-10 w-fit rounded border p-2',
            to ? 'text-grey-100' : 'text-grey-50'
          )}
        >
          {to
            ? formatDateTime(to, { language, timeStyle: undefined })
            : '--/--/----'}
        </span>
      </div>
    </div>
  );
}
