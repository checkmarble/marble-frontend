import { type IconName } from 'ui-icons';
import { match } from 'ts-pattern';

export const testRunsFilterNames = [
  'dateRange',
  'statuses',
  // 'phantom',
  // 'creator',
] as const;

export type TestRunFilterName = (typeof testRunsFilterNames)[number];

export const getFilterIcon = (filterName: TestRunFilterName): IconName =>
  match<TestRunFilterName, IconName>(filterName)
    .with('dateRange', () => 'calendar-month')
    .with('statuses', () => 'category')
    // .with('phantom', () => 'linked-services') // TODO: change to a better icon
    // .with('creator', () => 'users') // TODO: change to a better icon
    .exhaustive();

export const getFilterTKey = (filterName: TestRunFilterName) =>
  match(filterName)
    .with('dateRange', () => 'scenarios:testrun.filters.period' as const)
    .with('statuses', () => 'scenarios:testrun.filters.status' as const)
    // .with('phantom', () => 'scenarios:testrun.filters.version' as const)
    // .with('creator', () => 'scenarios:testrun.filters.creator' as const)
    .exhaustive();
