import { type Meta, type StoryFn } from '@storybook/react';
import * as React from 'react';
import { Icon } from 'ui-icons';

import { Button } from '../Button/Button';
import { EditableItemPicker } from './EditableItemPicker';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

function FruitEditableItemPicker() {
  const [value, setValue] = React.useState('');
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <EditableItemPicker
      trigger={
        <Button variant="secondary">
          <Icon icon="plus" className="size-4" />
          Add a rule group
        </Button>
      }
    />
  );
}

const Story: Meta = {
  component: FruitEditableItemPicker,
  title: 'EditableItemPicker',
};
export default Story;

export const Default: StoryFn = () => <FruitEditableItemPicker />;
