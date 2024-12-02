import { type TestRunFilterName } from '../filters';
import { StartedAfterFilter } from './StartedAfterFilter';
import { StatusesFilter } from './StatusesFilter';
import { match } from 'ts-pattern';
import { CreatorFilter } from './CreatorFilter';
import { VersionFilter } from './VersionFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: TestRunFilterName;
}) {
  return match(filterName)
    .with('startedAfter', () => <StartedAfterFilter />)
    .with('statuses', () => <StatusesFilter />)
    .with('creator', () => <CreatorFilter />)
    .with('ref_version', () => <VersionFilter type="ref" />)
    .with('test_version', () => <VersionFilter type="test" />)
    .exhaustive();
}
