import * as Label from '@radix-ui/react-label';
import { type Meta, type StoryFn } from '@storybook/react';

import { Switch } from './Switch';

const Story: Meta<typeof Switch> = {
  title: 'Switch',
  component: Switch,
  args: { disabled: false, checked: false },
  argTypes: {
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
};
export default Story;

export const Default: StoryFn<typeof Switch> = (args) => <Switch {...args} />;

export const WithLabel: StoryFn<typeof Switch> = (args) => (
  <form>
    <div className="flex flex-row items-center gap-sm">
      <Label.Root htmlFor="s1">On/off</Label.Root>
      <Switch {...args} id="s1" />
    </div>
  </form>
);
