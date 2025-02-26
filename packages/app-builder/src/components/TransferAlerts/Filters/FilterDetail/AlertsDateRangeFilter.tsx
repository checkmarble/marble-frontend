import { DateRangeFilter } from '@app-builder/components/Filters';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';

import { alertsI18n } from '../../alerts-i18n';
import { useDateRangeFilter } from '../AlertsFiltersContext';

export function AlertsDateRangeFilter() {
  const { t } = useTranslation(alertsI18n);
  const { dateRange, setDateRange } = useDateRangeFilter();

  return (
    <DateRangeFilter.Root
      dateRangeFilter={dateRange}
      setDateRangeFilter={setDateRange}
      className="grid"
    >
      <DateRangeFilter.FromNowPicker title={t('transfercheck:alerts.filters.date_range.title')} />
      <Separator className="bg-grey-90" decorative orientation="vertical" />
      <DateRangeFilter.Calendar />
      <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
      <DateRangeFilter.Summary className="col-span-3 row-span-1" />
    </DateRangeFilter.Root>
  );
}
