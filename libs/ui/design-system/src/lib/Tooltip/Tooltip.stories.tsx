import { type ComponentMeta, type ComponentStory } from '@storybook/react';

import { Tooltip } from './Tooltip';

const Story: ComponentMeta<typeof Tooltip.Default> = {
  component: Tooltip.Default,
  title: 'Tooltip',
  argTypes: {
    content: { type: 'string', defaultValue: 'Tooltip...' },
  },
  decorators: [(story) => <Tooltip.Provider>{story()}</Tooltip.Provider>],
};
export default Story;

const Template: ComponentStory<typeof Tooltip.Default> = (args) => (
  <Tooltip.Default {...args}>
    <div className="w-fit">hover me!</div>
  </Tooltip.Default>
);

export const Primary = Template.bind({});
Primary.args = {};
