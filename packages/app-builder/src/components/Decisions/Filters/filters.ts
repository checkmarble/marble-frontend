import { assertNever } from 'typescript-utils';
import { AltRoute, CalendarMonth, Category, Scenarios } from 'ui-icons';

export const decisionFilterNames = [
  'dateRange',
  'scenarioId',
  'outcome',
  'triggerObject',
] as const;

export type DecisionFilterName = (typeof decisionFilterNames)[number];

export function getFilterIcon(filterName: DecisionFilterName) {
  switch (filterName) {
    case 'dateRange':
      return CalendarMonth;
    case 'scenarioId':
      return Scenarios;
    case 'outcome':
      return Category;
    case 'triggerObject':
      return AltRoute;
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}

export function getFilterTKey(filterName: DecisionFilterName) {
  switch (filterName) {
    case 'dateRange':
      return 'decisions:created_at';
    case 'scenarioId':
      return 'decisions:scenario.name';
    case 'outcome':
      return 'decisions:outcome';
    case 'triggerObject':
      return 'decisions:trigger_object.type';
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
