import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';
import { useStatusesFilter } from '../TestRunsFiltersContext';
import { TestRunStatus } from '../../TestRunStatus';
import { testRunStatuses as statuses } from '@app-builder/models/testrun';

export function StatusesFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedStatuses, setSelectedStatuses } = useStatusesFilter();
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(statuses, deferredValue),
    [deferredValue, statuses],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedStatuses}
        onSelectedValueChange={setSelectedStatuses}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((status) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={status}
                value={status}
                className="align-baseline"
              >
                <TestRunStatus status={status} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
