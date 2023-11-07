import { assertNever } from 'typescript-utils';
import { AltRoute, CalendarMonth, Category, Scenarios } from 'ui-icons';

export const decisionFilters = [
  'dateRange',
  'scenarioId',
  'outcome',
  'triggerObject',
] as const;

export type DecisionFilter = (typeof decisionFilters)[number];

export function getFilterIcon(filter: DecisionFilter) {
  switch (filter) {
    case 'dateRange':
      return CalendarMonth;
    case 'scenarioId':
      return Scenarios;
    case 'outcome':
      return Category;
    case 'triggerObject':
      return AltRoute;
    default:
      assertNever('[DecisionFilter] unknwon filter:', filter);
  }
}

export function getFilterTKey(filter: DecisionFilter) {
  switch (filter) {
    case 'dateRange':
      return 'decisions:created_at';
    case 'scenarioId':
      return 'decisions:scenario.name';
    case 'outcome':
      return 'decisions:outcome';
    case 'triggerObject':
      return 'decisions:trigger_object.type';
    default:
      assertNever('[DecisionFilter] unknwon filter:', filter);
  }
}
