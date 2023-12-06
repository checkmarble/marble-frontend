import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { Outcome, useOutcomes } from '../../Outcome';
import { useOutcomeFilter } from '../DecisionFiltersContext';

export function OutcomeFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedOutcomes, setSelectedOutcomes } = useOutcomeFilter();
  const deferredValue = useDeferredValue(value);
  const outcomes = useOutcomes();

  const matches = useMemo(
    () => matchSorter(outcomes, deferredValue, { keys: ['label'] }),
    [deferredValue, outcomes],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Provider
        open
        setSearchValue={setSearchValue}
        selectedValues={selectedOutcomes}
        onSelectedValuesChange={setSelectedOutcomes}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList>
          {matches.map((outcome) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={outcome.value}
                value={outcome.value}
              >
                <Outcome
                  outcome={outcome.value}
                  border="square"
                  size="big"
                  className="w-full"
                />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Provider>
    </div>
  );
}
