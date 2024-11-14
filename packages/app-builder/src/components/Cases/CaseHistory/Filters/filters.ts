import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

export const caseHistoryFilterNames = ['dateRange', 'caseEventTypes'] as const;

export type CaseHistoryFilterFilterName =
  (typeof caseHistoryFilterNames)[number];

export function getFilterIcon(
  filterName: CaseHistoryFilterFilterName,
): IconName {
  switch (filterName) {
    case 'dateRange':
      return 'calendar-month';
    case 'caseEventTypes':
      return 'category';
    default:
      assertNever('[CasesFilterName] unknown filter:', filterName);
  }
}

export function getFilterTKey(filterName: CaseHistoryFilterFilterName) {
  switch (filterName) {
    case 'dateRange':
      return 'cases:case_detail.history.filter.date';
    case 'caseEventTypes':
      return 'cases:case_detail.history.filter.event_type';
    default:
      assertNever('[CasesFilterName] unknown filter:', filterName);
  }
}
