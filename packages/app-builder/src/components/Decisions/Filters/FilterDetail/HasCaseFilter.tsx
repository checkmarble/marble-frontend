import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useHasCaseFilter } from '../DecisionFiltersContext';

function useHasCaseOptions() {
  const { t } = useTranslation(decisionsI18n);

  return [
    { value: 'true', label: t('common:true') },
    { value: 'false', label: t('common:false') },
  ];
}

export function HasCaseFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedHasCase, setSelectedHasCase } = useHasCaseFilter();
  const searchValue = useDeferredValue(value);

  const options = useHasCaseOptions();
  console.log(options);
  const matches = useMemo(
    () => matchSorter(options, searchValue, { keys: ['label'] }),
    [searchValue, options],
  );
  console.log(searchValue);
  console.log(matches);

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedHasCase}
        onSelectedValueChange={setSelectedHasCase}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((hasCase) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={hasCase.value}
                value={hasCase.value}
              >
                <Highlight text={hasCase.label} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
