import { match } from 'ts-pattern';

import { type CasesFilterName } from '../filters';
import { CasesAssigneeFilter } from './CasesAssigneeFilter';
import { CasesDateRangeFilter } from './CasesDateRangeFilter';
import { CasesExcludeAssignedFilter } from './CasesExcludeAssignedFilter';
import { CasesSnoozedFilter } from './CasesSnoozedFilter';
import { ClosedCasesFilter } from './ClosedCasesFilter';

export const FilterDetail = ({
  filterName,
  close,
}: {
  filterName: CasesFilterName;
  close: () => void;
}) =>
  match(filterName)
    .with('dateRange', () => <CasesDateRangeFilter />)
    .with('statuses', () => <ClosedCasesFilter close={close} />)
    .with('includeSnoozed', () => <CasesSnoozedFilter close={close} />)
    .with('excludeAssigned', () => <CasesExcludeAssignedFilter close={close} />)
    .with('assignee', () => <CasesAssigneeFilter close={close} />)
    .exhaustive();
