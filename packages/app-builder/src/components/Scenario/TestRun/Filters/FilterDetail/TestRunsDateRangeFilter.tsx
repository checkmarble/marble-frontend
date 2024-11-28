import { DateRangeFilter } from '@app-builder/components/Filters';
import { Separator } from 'ui-design-system';
import { useDateRangeFilter } from '../TestRunsFiltersContext';

export function TestRunsDateRangeFilter() {
  const { dateRange, setDateRange } = useDateRangeFilter();

  return (
    <DateRangeFilter.Root
      dateRangeFilter={dateRange}
      setDateRangeFilter={setDateRange}
      className="grid"
    >
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
