import { DateRangeFilter } from '@app-builder/components/Filters';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useDateRangeFilter } from '../DecisionFiltersContext';

export function DecisionsDateRangeFilter() {
  const { t } = useTranslation(decisionsI18n);
  const { dateRange, setDateRange } = useDateRangeFilter();

  return (
    <DateRangeFilter.Root
      dateRangeFilter={dateRange}
      setDateRangeFilter={setDateRange}
      className="grid"
    >
      <DateRangeFilter.FromNowPicker
        title={t('decisions:filters.date_range.title')}
      />
      <Separator className="bg-grey-10" decorative orientation="vertical" />
      <DateRangeFilter.Calendar />
      <Separator
        className="bg-grey-10 col-span-3"
        decorative
        orientation="horizontal"
      />
      <DateRangeFilter.Summary className="col-span-3 row-span-1" />
    </DateRangeFilter.Root>
  );
}
