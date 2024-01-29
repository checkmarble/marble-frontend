import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

export const decisionFilterNames = [
  'dateRange',
  'scenarioId',
  'outcome',
  'triggerObject',
  'hasCase',
] as const;

export type DecisionFilterName = (typeof decisionFilterNames)[number];

export function getFilterIcon(filterName: DecisionFilterName): IconName {
  switch (filterName) {
    case 'dateRange':
      return 'calendar-month';
    case 'scenarioId':
      return 'scenarios';
    case 'outcome':
      return 'category';
    case 'triggerObject':
      return 'alt-route';
    case 'hasCase':
      return 'case-manager';
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
    case 'hasCase':
      return 'decisions:filters.has_case';
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
