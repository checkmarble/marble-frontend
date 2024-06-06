import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { useRuleGroupFilter } from '../RulesFiltersContext';

export function RuleGroupFilter() {
  const [value, setSearchValue] = useState('');
  const { ruleGroups, selectedRuleGroups, setSelectedRuleGroups } =
    useRuleGroupFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(ruleGroups, searchValue),
    [searchValue, ruleGroups],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedRuleGroups}
        onSelectedValueChange={setSelectedRuleGroups}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((ruleGroup) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={ruleGroup}
                value={ruleGroup}
              >
                <Highlight text={ruleGroup} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
