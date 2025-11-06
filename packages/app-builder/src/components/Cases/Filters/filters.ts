import { type ParseKeys } from 'i18next';
import { match } from 'ts-pattern';
import { type IconName } from 'ui-icons';

export const casesFilterNames = ['dateRange', 'statuses', 'includeSnoozed', 'excludeAssigned', 'assignee'] as const;

export type CasesFilterName = (typeof casesFilterNames)[number];

export const casesSimpleFilterNames = ['includeSnoozed', 'excludeAssigned', 'statuses'] as const;

export type CasesSimpleFilterName = (typeof casesSimpleFilterNames)[number];

export const getFilterIcon = (filterName: CasesFilterName) =>
  match<CasesFilterName, IconName>(filterName)
    .with('dateRange', () => 'calendar-month')
    .with('statuses', () => 'checked')
    .with('includeSnoozed', () => 'snooze')
    .with('excludeAssigned', () => 'person')
    .with('assignee', () => 'person')
    .exhaustive();

export const getFilterTKey = (filterName: CasesFilterName) =>
  match<CasesFilterName, ParseKeys<['cases']>>(filterName)
    .with('dateRange', () => 'cases:case.date')
    .with('statuses', () => 'cases:filter.closed_only.label')
    .with('includeSnoozed', () => 'cases:filter.include_snoozed.label')
    .with('excludeAssigned', () => 'cases:filter.exclude_assigned.label')
    .with('assignee', () => 'cases:filter.assignee.label')
    .exhaustive();
