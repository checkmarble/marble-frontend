import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

export const casesFilterNames = ['dateRange', 'statuses'] as const;

export type CasesFilterName = (typeof casesFilterNames)[number];

export function getFilterIcon(filterName: CasesFilterName): IconName {
  switch (filterName) {
    case 'dateRange':
      return 'calendar-month';
    case 'statuses':
      return 'category';
    default:
      assertNever('[CasesFilterName] unknown filter:', filterName);
  }
}

export function getFilterTKey(filterName: CasesFilterName) {
  switch (filterName) {
    case 'dateRange':
      return 'cases:case.date';
    case 'statuses':
      return 'cases:case.status';
    default:
      assertNever('[CasesFilterName] unknown filter:', filterName);
  }
}
