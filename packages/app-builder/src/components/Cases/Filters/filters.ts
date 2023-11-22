import { assertNever } from 'typescript-utils';
import { CalendarMonth, Category } from 'ui-icons';

export const casesFilterNames = ['dateRange', 'statuses'] as const;

export type CasesFilterName = (typeof casesFilterNames)[number];

export function getFilterIcon(filterName: CasesFilterName) {
  switch (filterName) {
    case 'dateRange':
      return CalendarMonth;
    case 'statuses':
      return Category;
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
