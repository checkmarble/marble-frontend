import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { CaseStatus, useCaseStatuses } from '../../CaseStatus';
import { useStatusesFilter } from '../CasesFiltersContext';

export function StatusesFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedStatuses, setSelectedStatuses } = useStatusesFilter();
  const deferredValue = useDeferredValue(value);
  const statuses = useCaseStatuses();

  const matches = useMemo(
    () => matchSorter(statuses, deferredValue, { keys: ['label'] }),
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
                key={status.value}
                value={status.value}
                className="align-baseline"
              >
                <CaseStatus status={status.value} />
                <span className="text-grey-100 text-s font-normal first-letter:capitalize">
                  {status.label}
                </span>
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
