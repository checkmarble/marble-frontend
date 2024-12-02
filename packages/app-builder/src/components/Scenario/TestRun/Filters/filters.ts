import { type IconName } from 'ui-icons';
import { match } from 'ts-pattern';

export const testRunsFilterNames = [
  'startedAfter',
  'statuses',
  'creator',
  'ref_version',
  'test_version',
] as const;

export type TestRunFilterName = (typeof testRunsFilterNames)[number];

export const getFilterIcon = (filterName: TestRunFilterName): IconName =>
  match<TestRunFilterName, IconName>(filterName)
    .with('startedAfter', () => 'calendar-month')
    .with('statuses', () => 'category')
    .with('creator', () => 'person')
    .with('ref_version', () => 'version')
    .with('test_version', () => 'version')
    .exhaustive();

export const getFilterTKey = (filterName: TestRunFilterName) =>
  match(filterName)
    .with(
      'startedAfter',
      () => 'scenarios:testrun.filters.started_after' as const,
    )
    .with('statuses', () => 'scenarios:testrun.filters.status' as const)
    .with('creator', () => 'scenarios:testrun.filters.creator' as const)
    .with('ref_version', () => 'scenarios:testrun.filters.ref_version' as const)
    .with(
      'test_version',
      () => 'scenarios:testrun.filters.test_version' as const,
    )
    .exhaustive();
