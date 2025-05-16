import { match } from 'ts-pattern';

import { type CasesFilterName } from '../filters';
import { CasesDateRangeFilter } from './CasesDateRangeFilter';
import { CasesSnoozedFilter } from './CasesSnoozedFilter';
import { StatusesFilter } from './StatusesFilter';

export const FilterDetail = ({ filterName }: { filterName: CasesFilterName }) => {
  return match(filterName)
    .with('dateRange', () => <CasesDateRangeFilter />)
    .with('statuses', () => <StatusesFilter />)
    .with('includeSnoozed', () => <CasesSnoozedFilter />)
    .exhaustive();
};
