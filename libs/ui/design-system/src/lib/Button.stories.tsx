import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Button } from './Button';

const Story: ComponentMeta<typeof Button> = {
  component: Button,
  title: 'Button',
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default Story;

const Template: ComponentStory<typeof Button> = (args) => (
  <Button children="Button label" {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
