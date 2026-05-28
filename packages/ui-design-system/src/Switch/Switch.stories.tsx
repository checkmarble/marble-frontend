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

export const WithoutLabel: StoryFn<typeof Switch> = (args) => <Switch {...args} />;

export const WithLabel: StoryFn<typeof Switch> = (args) => (
  <form>
    <div className="flex flex-row items-center gap-2">
      <Label.Root htmlFor="s1">On/off</Label.Root>
      <Switch {...args} id="s1" />
    </div>
  </form>
);

export const Matrix: StoryFn<typeof Switch> = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <Switch checked={false} />
      <span className="text-s">off</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch checked />
      <span className="text-s">on</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch checked={false} disabled />
      <span className="text-s">off disabled</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch checked disabled />
      <span className="text-s">on disabled</span>
    </div>
  </div>
);
