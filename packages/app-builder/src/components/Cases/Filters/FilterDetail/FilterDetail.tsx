import { match } from 'ts-pattern';

import { type CasesFilterName } from '../filters';
import { CasesDateRangeFilter } from './CasesDateRangeFilter';
import { CasesExcludeAssignedFilter } from './CasesExcludeAssignedFilter';
import { CasesSnoozedFilter } from './CasesSnoozedFilter';
import { ClosedCasesFilter } from './ClosedCasesFilter';

export const FilterDetail = ({ filterName }: { filterName: CasesFilterName }) => {
  return match(filterName)
    .with('dateRange', () => <CasesDateRangeFilter />)
    .with('statuses', () => <ClosedCasesFilter />)
    .with('includeSnoozed', () => <CasesSnoozedFilter />)
    .with('excludeAssigned', () => <CasesExcludeAssignedFilter />)
    .exhaustive();
};
