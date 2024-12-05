import { type TestRunFilterName } from '../filters';
import { StartedAfterFilter } from './StartedAfterFilter';
import { StatusesFilter } from './StatusesFilter';
import { match } from 'ts-pattern';
import { CreatorsFilter } from './CreatorsFilter';
import { VersionsFilter } from './VersionsFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: TestRunFilterName;
}) {
  return match(filterName)
    .with('startedAfter', () => <StartedAfterFilter />)
    .with('statuses', () => <StatusesFilter />)
    .with('creators', () => <CreatorsFilter />)
    .with('ref_versions', () => <VersionsFilter type="ref" />)
    .with('test_versions', () => <VersionsFilter type="test" />)
    .exhaustive();
}
