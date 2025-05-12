import type { Meta, StoryFn } from '@storybook/react';
import * as React from 'react';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';
import { Combobox, ComboboxItem, ComboboxLabel, ComboboxPopover, ComboboxRoot } from './Combobox';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

function FruitCombobox() {
  const [value, setValue] = React.useState('');
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <ComboboxRoot
      value={value}
      setValue={setValue}
      selectedValue={value}
      setSelectedValue={setValue}
    >
      <ComboboxLabel>Fruits</ComboboxLabel>
      <Combobox />
      <ComboboxPopover hideOnInteractOutside modal>
        <ScrollAreaV2>
          {matches.map((fruit) => {
            return <ComboboxItem key={fruit} value={fruit} />;
          })}
        </ScrollAreaV2>
      </ComboboxPopover>
    </ComboboxRoot>
  );
}

const Story: Meta = {
  component: FruitCombobox,
  title: 'Combobox',
};
export default Story;

export const Default: StoryFn = () => <FruitCombobox />;
