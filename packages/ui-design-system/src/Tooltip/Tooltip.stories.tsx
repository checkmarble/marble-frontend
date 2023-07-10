import { type Meta, type StoryFn } from '@storybook/react';

import { Tooltip } from './Tooltip';

const Story: Meta<typeof Tooltip.Default> = {
  component: Tooltip.Default,
  title: 'Tooltip',
  args: {
    content: 'Tooltip...',
  },
  argTypes: {
    content: { type: 'string' },
  },
  decorators: [(story) => <Tooltip.Provider>{story()}</Tooltip.Provider>],
};
export default Story;

const Template: StoryFn<typeof Tooltip.Default> = (args) => (
  <Tooltip.Default {...args}>
    <div className="w-fit">hover me!</div>
  </Tooltip.Default>
);

export const Primary = Template.bind({});
Primary.args = {};
