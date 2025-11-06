import { match } from 'ts-pattern';
import { type IconName } from 'ui-icons';

export const testRunsFilterNames = ['startedAfter', 'statuses', 'creators', 'ref_versions', 'test_versions'] as const;

export type TestRunFilterName = (typeof testRunsFilterNames)[number];

export const getFilterIcon = (filterName: TestRunFilterName): IconName =>
  match<TestRunFilterName, IconName>(filterName)
    .with('startedAfter', () => 'calendar-month')
    .with('statuses', () => 'category')
    .with('creators', () => 'person')
    .with('ref_versions', () => 'version')
    .with('test_versions', () => 'version')
    .exhaustive();

export const getFilterTKey = (filterName: TestRunFilterName) =>
  match(filterName)
    .with('startedAfter', () => 'scenarios:testrun.filters.started_after' as const)
    .with('statuses', () => 'scenarios:testrun.filters.status' as const)
    .with('creators', () => 'scenarios:testrun.filters.creator' as const)
    .with('ref_versions', () => 'scenarios:testrun.filters.ref_version' as const)
    .with('test_versions', () => 'scenarios:testrun.filters.test_version' as const)
    .exhaustive();
