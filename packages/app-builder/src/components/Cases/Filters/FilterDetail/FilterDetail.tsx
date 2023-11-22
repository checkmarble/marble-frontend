import { assertNever } from 'typescript-utils';

import { type CasesFilterName } from '../filters';
import { CasesDateRangeFilter } from './CasesDateRangeFilter';
import { StatusesFilter } from './StatusesFilter';

export function FilterDetail({ filterName }: { filterName: CasesFilterName }) {
  switch (filterName) {
    case 'dateRange':
      return <CasesDateRangeFilter />;
    case 'statuses':
      return <StatusesFilter />;
    default:
      assertNever('[CasesFilter] unknown filter:', filterName);
  }
}
