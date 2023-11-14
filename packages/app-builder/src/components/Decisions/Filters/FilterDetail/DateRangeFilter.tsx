import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTime } from '@app-builder/utils/format';
import { clsx } from 'clsx';
import { add, formatDistanceStrict } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Calendar, type DateRange } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import {
  type DecisionFiltersForm,
  fromNowDurations,
  useDateRangeFilter,
} from '../DecisionFiltersContext';

function adaptDateRange(dateRange: DecisionFiltersForm['dateRange']) {
  const from =
    dateRange.type === 'static' && dateRange.startDate
      ? new Date(dateRange.startDate)
      : undefined;
  const to =
    dateRange.type === 'static' && dateRange.endDate
      ? new Date(dateRange.endDate)
      : undefined;
  const selected = from || to ? { from, to } : undefined;

  return selected;
}

const date = new Date();
function formatDuration(duration: string, language: string) {
  return formatDistanceStrict(
    add(date, Temporal.Duration.from(duration)),
    date,
    {
      addSuffix: true,
      locale: getDateFnsLocale(language),
    }
  );
}

export function DateRangeFilter() {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);
  const { dateRange, setDateRange } = useDateRangeFilter();

  const selected = adaptDateRange(dateRange);
  const onSelect = useCallback(
    (range?: DateRange) => {
      const startDate = range?.from?.toISOString() ?? '';
      const endDate = range?.to?.toISOString() ?? '';

      setDateRange({
        type: 'static',
        startDate,
        endDate,
      });
    },
    [setDateRange]
  );

  const onFromNowSelect = useCallback(
    (fromNow: string) => {
      setDateRange({
        type: 'dynamic',
        fromNow,
      });
    },
    [setDateRange]
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <div className="border-r-grey-10 flex flex-col gap-4 border-r p-4">
          <div className="flex items-center">
            <p className="text-grey-25 text-s font-normal first-letter:capitalize">
              {t('decisions:filters.date_range.title')}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {fromNowDurations.map((duration) => (
              <button
                key={duration.toString()}
                onClick={() => {
                  onFromNowSelect(duration);
                }}
                className="text-s hover:bg-purple-05 active:bg-purple-10 bg-grey-00 text-grey-100 border-grey-00 flex h-10 items-center rounded border p-2 outline-none hover:text-purple-100 focus:border-purple-100"
              >
                {formatDuration(duration, language)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={onSelect}
            defaultMonth={selected?.from}
            locale={getDateFnsLocale(language)}
          />
        </div>
      </div>
      <div className="border-t-grey-10 border-t p-4">
        <Summary dateRange={dateRange} language={language} />
      </div>
    </div>
  );
}

function Summary({
  dateRange,
  language,
}: {
  dateRange: DecisionFiltersForm['dateRange'];
  language: string;
}) {
  if (dateRange.type === 'dynamic') {
    return (
      <div className="flex h-10 w-full items-center justify-center">
        <span className="text-grey-100">
          {formatDuration(dateRange.fromNow, language)}
        </span>
      </div>
    );
  }

  const selected = adaptDateRange(dateRange);
  const from = selected?.from;
  const to = selected?.to;

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr] gap-1">
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
  );
}
