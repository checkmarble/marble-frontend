import { OutcomeBadge } from '@app-builder/components/Decisions';
import { type SanctionOutcome } from '@app-builder/models/outcome';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

export const FieldOutcomes = ({
  selectedOutcome,
  outcomes,
  disabled,
  name,
  onChange,
  onBlur,
}: {
  selectedOutcome?: SanctionOutcome;
  outcomes: SanctionOutcome[];
  disabled?: boolean;
  name?: string;
  onChange?: (value: SanctionOutcome) => void;
  onBlur?: () => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(outcomes, deferredSearchValue),
    [outcomes, deferredSearchValue],
  );

  return (
    <SelectWithCombobox.Root
      selectedValue={selectedOutcome}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSelectedValueChange={onChange}
    >
      <SelectWithCombobox.Select
        name={name}
        disabled={disabled}
        onBlur={onBlur}
        className="hover:bg-grey-98 w-full border-0 transition-colors"
      >
        {selectedOutcome ? <OutcomeBadge size="sm" outcome={selectedOutcome} /> : null}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList>
          {matches.map((outcome) => (
            <SelectWithCombobox.ComboboxItem key={outcome} value={outcome}>
              <OutcomeBadge size="sm" outcome={outcome} />
            </SelectWithCombobox.ComboboxItem>
          ))}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
};
