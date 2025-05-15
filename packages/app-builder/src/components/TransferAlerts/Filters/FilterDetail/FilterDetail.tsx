import { assertNever } from 'typescript-utils';

import type { AlertsFilterName } from '../filters';
import { AlertsDateRangeFilter } from './AlertsDateRangeFilter';
import { StatusesFilter } from './StatusesFilter';

export function FilterDetail({ filterName }: { filterName: AlertsFilterName }) {
  switch (filterName) {
    case 'dateRange':
      return <AlertsDateRangeFilter />;
    case 'statuses':
      return <StatusesFilter />;
    default:
      assertNever('[CasesFilter] unknown filter:', filterName);
  }
}
