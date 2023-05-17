import * as Label from '@radix-ui/react-label';
import { type Meta, type StoryFn } from '@storybook/react';

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
