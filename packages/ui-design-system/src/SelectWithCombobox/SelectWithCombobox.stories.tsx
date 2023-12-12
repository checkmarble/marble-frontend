import { type Meta, type StoryFn } from '@storybook/react';
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
    <SelectWithCombobox.Provider
      open
      setSearchValue={setSearchValue}
      selectedValues={selectedValues}
      onSelectedValuesChange={setSelectedValues}
    >
      <SelectWithCombobox.Combobox render={<Input />} />
      <SelectWithCombobox.ComboboxList>
        {matches.map((fruit) => {
          return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
        })}
      </SelectWithCombobox.ComboboxList>
    </SelectWithCombobox.Provider>
  );
}

const Story: Meta = {
  component: SelectFruitWithCombobox,
  title: 'SelectWithCombobox',
};
export default Story;

export const Default: StoryFn = () => {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <SelectWithCombobox.Provider
      open
      setSearchValue={setSearchValue}
      selectedValues={selectedValues}
      onSelectedValuesChange={setSelectedValues}
    >
      <SelectWithCombobox.Combobox render={<Input />} />
      <SelectWithCombobox.ComboboxList>
        {matches.map((fruit) => {
          return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
        })}
      </SelectWithCombobox.ComboboxList>
    </SelectWithCombobox.Provider>
  );
};

function SelectFruitWithComboboxAndPopover() {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <SelectWithCombobox.Popover.Root>
      <SelectWithCombobox.Popover.Trigger>
        {selectedValues.join(', ') || 'Select fruits...'}
      </SelectWithCombobox.Popover.Trigger>
      <SelectWithCombobox.Popover.Content className="p-2">
        <SelectWithCombobox.Provider
          open
          setSearchValue={setSearchValue}
          selectedValues={selectedValues}
          onSelectedValuesChange={setSelectedValues}
        >
          <SelectWithCombobox.Combobox render={<Input />} />
          <SelectWithCombobox.ComboboxList>
            {matches.map((fruit) => {
              return (
                <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />
              );
            })}
          </SelectWithCombobox.ComboboxList>
        </SelectWithCombobox.Provider>
      </SelectWithCombobox.Popover.Content>
    </SelectWithCombobox.Popover.Root>
  );
}

export const WithPopover: StoryFn = () => <SelectFruitWithComboboxAndPopover />;
