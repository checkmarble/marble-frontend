import * as Label from '@radix-ui/react-label';
import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Checkbox } from './Checkbox';

const Story: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Checkbox',
  args: { disabled: false },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default Story;

export const WithoutLabel: StoryFn<typeof Checkbox> = (args) => (
  <Checkbox {...args} />
);

export const WithLabel: StoryFn<typeof Checkbox> = (args) => (
  <form>
    <div className="flex flex-row gap-2">
      <Checkbox {...args} id="c1" />
      <Label.Root htmlFor="c1">Accept terms and conditions.</Label.Root>
    </div>
  </form>
);

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

export const WithIntermediate: StoryFn<typeof Checkbox> = () => {
  const [checkedFruits, setCheckedFruits] = useState(
    new Map(fruits.map((fruit) => [fruit, false])),
  );
  const allChecked = Array.from(checkedFruits.values()).every(
    (val) => val === true,
  )
    ? true
    : Array.from(checkedFruits.values()).every((val) => val === false)
      ? false
      : 'indeterminate';

  return (
    <form>
      <fieldset className="border-grey-80 flex w-fit flex-col gap-4 rounded border p-4">
        <legend className="text-grey-50 p-2">Fruits</legend>
        <div className="flex flex-row gap-2">
          <Checkbox
            id="c1"
            checked={allChecked}
            onCheckedChange={(checked) => {
              if (checked === 'indeterminate') return;
              setCheckedFruits((checkedFruits) => {
                checkedFruits.forEach((_, key) => {
                  checkedFruits.set(key, checked === true);
                });
                return new Map(checkedFruits);
              });
            }}
          />
          <Label.Root htmlFor="c1">All fruits</Label.Root>
        </div>
        <ul className="flex flex-col gap-2 rounded border p-2">
          {fruits.map((fruit) => (
            <li key={fruit}>
              <div className="flex flex-row gap-2">
                <Checkbox
                  id={fruit}
                  checked={checkedFruits.get(fruit)}
                  onCheckedChange={(checked) => {
                    setCheckedFruits((checkedFruits) => {
                      checkedFruits.set(fruit, checked === true);
                      return new Map(checkedFruits);
                    });
                  }}
                />
                <Label.Root htmlFor={fruit}>{fruit}</Label.Root>
              </div>
            </li>
          ))}
        </ul>
      </fieldset>
    </form>
  );
};
