import { assertNever } from 'typescript-utils';

import { type CaseHistoryFilterFilterName } from '../filters';
import { CaseHistoryDateRangeFilter } from './CaseHistoryDateRangeFilter';
import { EventTypeFilter } from './EventTypeFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: CaseHistoryFilterFilterName;
}) {
  switch (filterName) {
    case 'dateRange':
      return <CaseHistoryDateRangeFilter />;
    case 'caseEventTypes':
      return <EventTypeFilter />;
    default:
      assertNever('[CaseHistoryFilter] unknown filter:', filterName);
  }
}
