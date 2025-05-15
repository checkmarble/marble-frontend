import type { Meta, StoryFn } from '@storybook/react';
import { useDeferredValue, useMemo, useState } from 'react';

import { Input } from '../Input/Input';
import { SelectWithCombobox } from './SelectWithCombobox';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

function SelectFruitWithCombobox() {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <SelectWithCombobox.Root
      open
      onSearchValueChange={setSearchValue}
      selectedValue={selectedValues}
      onSelectedValueChange={setSelectedValues}
    >
      <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} />
      <SelectWithCombobox.ComboboxList>
        {matches.map((fruit) => {
          return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
        })}
      </SelectWithCombobox.ComboboxList>
    </SelectWithCombobox.Root>
  );
}
const Story: Meta = {
  component: SelectFruitWithCombobox,
  title: 'SelectWithCombobox',
};
export default Story;

export const Inline: StoryFn = () => <SelectFruitWithCombobox />;

function SelectFruitWithComboboxAndPopover() {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedValues}
      onSelectedValueChange={setSelectedValues}
    >
      <SelectWithCombobox.Select>
        {selectedValues.join(', ') || 'Select fruits...'}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>

      <SelectWithCombobox.Popover className="flex flex-col gap-2 p-2" fitViewport>
        <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} />

        <SelectWithCombobox.ComboboxList>
          {matches.map((fruit) => {
            return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}

export const WithPopover: StoryFn = () => <SelectFruitWithComboboxAndPopover />;
