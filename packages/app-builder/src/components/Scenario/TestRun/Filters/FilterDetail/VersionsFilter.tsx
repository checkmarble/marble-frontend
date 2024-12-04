import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';
import {
  useRefVersionFilter,
  useTestVersionFilter,
} from '../TestRunsFiltersContext';
import { useScenarioIterations } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';

export function VersionsFilter({ type }: { type: 'ref' | 'test' }) {
  const [value, setSearchValue] = useState('');
  const { refVersion, setRefVersion } = useRefVersionFilter();
  const { testVersion, setTestVersion } = useTestVersionFilter();
  const deferredValue = useDeferredValue(value);
  const iterations = useScenarioIterations();

  const matches = useMemo(
    () => matchSorter(iterations, deferredValue, { keys: ['version'] }),
    [deferredValue, iterations],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={type === 'ref' ? refVersion : testVersion}
        onSelectedValueChange={type === 'ref' ? setRefVersion : setTestVersion}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((iteration) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={iteration.id}
                value={iteration.id}
                className="align-baseline"
              >
                <span className="text-grey-100 text-s">
                  {`V${iteration.version}`}
                </span>
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
