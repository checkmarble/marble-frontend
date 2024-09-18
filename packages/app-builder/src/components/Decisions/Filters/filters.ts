import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

export const decisionFilterNames = [
  'dateRange',
  'scenarioId',
  'triggerObject',
  'outcomeAndReviewStatus',
  'caseInboxId',
  'hasCase',
  'pivotValue',
  'scheduledExecutionId',
] as const;

export type DecisionFilterName = (typeof decisionFilterNames)[number];

export function getFilterIcon(filterName: DecisionFilterName): IconName {
  switch (filterName) {
    case 'dateRange':
      return 'calendar-month';
    case 'scenarioId':
      return 'scenarios';
    case 'caseInboxId':
      return 'inbox';
    case 'outcomeAndReviewStatus':
      return 'category';
    case 'triggerObject':
      return 'alt-route';
    case 'hasCase':
      return 'case-manager';
    case 'pivotValue':
      return 'tree-schema';
    case 'scheduledExecutionId':
      return 'scheduled-execution';
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
    case 'caseInboxId':
      return 'decisions:filters.inbox';
    case 'outcomeAndReviewStatus':
      return 'decisions:outcome';
    case 'triggerObject':
      return 'decisions:trigger_object.type';
    case 'hasCase':
      return 'decisions:filters.has_case';
    case 'pivotValue':
      return 'decisions:filters.pivot_value';
    case 'scheduledExecutionId':
      return 'decisions:filters.scheduled_execution';
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
