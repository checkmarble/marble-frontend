import { matchSorter } from '@app-builder/utils/search';
import { type Decision } from 'marble-api';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { Outcome } from '../../Outcome';
import { useOutcomeFilter } from '../DecisionFiltersContext';

const outcomes = [
  'approve',
  'review',
  'decline',
] satisfies Decision['outcome'][];

export function OutcomeFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedOutcomes, setSelectedOutcomes } = useOutcomeFilter();
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(outcomes, deferredValue),
    [deferredValue]
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
              <SelectWithCombobox.ComboboxItem key={outcome} value={outcome}>
                <Outcome
                  outcome={outcome}
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
