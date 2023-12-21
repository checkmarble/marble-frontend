import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, ScrollArea, SelectWithCombobox } from 'ui-design-system';

import { useScenarioFilter } from '../DecisionFiltersContext';

export function ScenarioFilter() {
  const [value, setSearchValue] = useState('');
  const { scenarios, selectedScenarioIds, setSelectedScenarioIds } =
    useScenarioFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(scenarios, searchValue, { keys: ['name'] }),
    [searchValue, scenarios],
  );

  return (
    <ScrollArea.Root>
      <div className="flex flex-col gap-2 p-2">
        <SelectWithCombobox.Root
          open
          onSearchValueChange={setSearchValue}
          selectedValue={selectedScenarioIds}
          onSelectedValueChange={setSelectedScenarioIds}
        >
          <SelectWithCombobox.Combobox
            render={<Input />}
            autoSelect
            autoFocus
          />
          <ScrollArea.Viewport className="max-h-40">
            <SelectWithCombobox.ComboboxList>
              {matches.map((scenario) => {
                return (
                  <SelectWithCombobox.ComboboxItem
                    key={scenario.id}
                    value={scenario.id}
                  >
                    <Highlight text={scenario.name} query={searchValue} />
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
