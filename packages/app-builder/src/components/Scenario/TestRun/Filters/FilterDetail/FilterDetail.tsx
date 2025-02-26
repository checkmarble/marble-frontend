import { match } from 'ts-pattern';

import { type TestRunFilterName } from '../filters';
import { CreatorsFilter } from './CreatorsFilter';
import { StartedAfterFilter } from './StartedAfterFilter';
import { StatusesFilter } from './StatusesFilter';
import { VersionsFilter } from './VersionsFilter';

export function FilterDetail({ filterName }: { filterName: TestRunFilterName }) {
  return match(filterName)
    .with('startedAfter', () => <StartedAfterFilter />)
    .with('statuses', () => <StatusesFilter />)
    .with('creators', () => <CreatorsFilter />)
    .with('ref_versions', () => <VersionsFilter type="ref" />)
    .with('test_versions', () => <VersionsFilter type="test" />)
    .exhaustive();
}
