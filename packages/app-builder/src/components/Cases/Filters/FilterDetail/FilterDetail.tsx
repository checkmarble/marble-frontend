import { match } from 'ts-pattern';

import { type CasesFilterName } from '../filters';
import { CasesDateRangeFilter } from './CasesDateRangeFilter';
import { StatusesFilter } from './StatusesFilter';

export const FilterDetail = ({ filterName }: { filterName: CasesFilterName }) =>
  match(filterName)
    .with('dateRange', () => <CasesDateRangeFilter />)
    .with('statuses', () => <StatusesFilter />)
    .exhaustive();
