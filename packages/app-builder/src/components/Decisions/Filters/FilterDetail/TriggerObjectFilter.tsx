import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, ScrollArea, SelectWithCombobox } from 'ui-design-system';

import { useTriggerObjectFilter } from '../DecisionFiltersContext';

export function TriggerObjectFilter() {
  const [value, setSearchValue] = useState('');
  const { triggerObjects, selectedTriggerObjects, setSelectedTriggerObjects } =
    useTriggerObjectFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(triggerObjects, searchValue),
    [searchValue, triggerObjects],
  );

  return (
    <ScrollArea.Root>
      <div className="flex flex-col gap-2 p-2">
        <SelectWithCombobox.Root
          open
          onSearchValueChange={setSearchValue}
          selectedValue={selectedTriggerObjects}
          onSelectedValueChange={setSelectedTriggerObjects}
        >
          <SelectWithCombobox.Combobox
            render={<Input />}
            autoSelect
            autoFocus
          />
          <ScrollArea.Viewport className="max-h-40">
            <SelectWithCombobox.ComboboxList>
              {matches.map((triggerObject) => {
                return (
                  <SelectWithCombobox.ComboboxItem
                    key={triggerObject}
                    value={triggerObject}
                  >
                    <Highlight
                      className="first-letter:capitalize"
                      text={triggerObject}
                      query={searchValue}
                    />
                  </SelectWithCombobox.ComboboxItem>
                );
              })}
            </SelectWithCombobox.ComboboxList>
          </ScrollArea.Viewport>
        </SelectWithCombobox.Root>
      </div>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
