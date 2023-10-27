import * as Label from '@radix-ui/react-label';
import { type Meta, type StoryFn } from '@storybook/react';

import { Switch } from './Switch';

const Story: Meta<typeof Switch> = {
  component: Switch,
  title: 'Switch',
  args: { disabled: false },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default Story;

export const WithoutLabel: StoryFn<typeof Switch> = (args) => (
  <Switch {...args} />
);

export const WithLabel: StoryFn<typeof Switch> = (args) => (
  <form>
    <div className="flex flex-row gap-2">
      <Label.Root htmlFor="c1">On/off</Label.Root>
      <Switch {...args} id="c1" />
    </div>
  </form>
);
