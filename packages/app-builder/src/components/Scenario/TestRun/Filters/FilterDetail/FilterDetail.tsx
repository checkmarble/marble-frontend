import { assertNever } from 'typescript-utils';

import { type TestRunFilterName } from '../filters';
import { TestRunsDateRangeFilter } from './TestRunsDateRangeFilter';
import { StatusesFilter } from './StatusesFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: TestRunFilterName;
}) {
  switch (filterName) {
    case 'dateRange':
      return <TestRunsDateRangeFilter />;
    case 'statuses':
      return <StatusesFilter />;
    default:
      assertNever('[CasesFilter] unknown filter:', filterName);
  }
}
