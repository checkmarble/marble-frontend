import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { useCaseInboxFilter } from '../DecisionFiltersContext';

export function CaseInboxFilter() {
  const [value, setSearchValue] = useState('');
  const { inboxes, selectedCaseInboxIds, setSelectedCaseInboxIds } =
    useCaseInboxFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(inboxes, searchValue, { keys: ['name'] }),
    [searchValue, inboxes],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedCaseInboxIds}
        onSelectedValueChange={setSelectedCaseInboxIds}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((inbox) => {
            return (
              <SelectWithCombobox.ComboboxItem key={inbox.id} value={inbox.id}>
                <Highlight text={inbox.name} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
