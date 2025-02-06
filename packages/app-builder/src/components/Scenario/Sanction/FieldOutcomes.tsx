import { OutcomeTag } from '@app-builder/components/Decisions';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { type KnownOutcome } from '@app-builder/models/outcome';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { Input } from 'ui-design-system';

export const FieldOutcomes = ({
  selectedOutcome,
  outcomes,
  onOpenChange,
}: {
  selectedOutcome?: KnownOutcome;
  outcomes: KnownOutcome[];
  onOpenChange?: (open: boolean) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(outcomes, deferredSearchValue),
    [outcomes, deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedOutcome}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onOpenChange={onOpenChange}
    >
      <FormSelectWithCombobox.Select className="w-full">
        {selectedOutcome ? (
          <OutcomeTag border="square" outcome={selectedOutcome} />
        ) : null}
        <FormSelectWithCombobox.Arrow />
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((outcome) => (
            <FormSelectWithCombobox.ComboboxItem key={outcome} value={outcome}>
              <OutcomeTag border="square" outcome={outcome} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
};
