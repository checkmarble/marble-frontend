import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { DateRangeFilter } from '@app-builder/components/Filters';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';

import { useDateRangeFilter } from '../CaseHistoryFiltersContext';

export function CaseHistoryDateRangeFilter() {
  const { t } = useTranslation(casesI18n);
  const { dateRange, setDateRange } = useDateRangeFilter();

  return (
    <DateRangeFilter.Root
      dateRangeFilter={dateRange}
      setDateRangeFilter={setDateRange}
      className="grid"
    >
      <DateRangeFilter.FromNowPicker
        title={t('cases:filters.date_range.title')}
      />
      <Separator className="bg-grey-90" decorative orientation="vertical" />
      <DateRangeFilter.Calendar />
      <Separator
        className="bg-grey-90 col-span-3"
        decorative
        orientation="horizontal"
      />
      <DateRangeFilter.Summary className="col-span-3 row-span-1" />
    </DateRangeFilter.Root>
  );
}
