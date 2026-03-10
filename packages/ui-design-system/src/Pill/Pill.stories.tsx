import { type Meta, type StoryFn } from '@storybook/react';

import { Pill, type PillProps } from './Pill';
import { pillBorder, pillColor, pillSize } from './Pill.constants';

type StoryProps = PillProps;

const Story: Meta<StoryProps> = {
  component: Pill,
  title: 'Pill',
  args: {
    children: 'Pill',
    size: pillSize[0],
  },
  argTypes: {
    children: {
      type: 'string',
    },
    border: {
      control: { type: 'select' },
      options: pillBorder.slice(),
    },
    color: {
      control: { type: 'select' },
      options: pillColor.slice(),
    },
    size: {
      control: { type: 'select' },
      options: pillSize.slice(),
    },
  },
};
export default Story;

const Template: StoryFn<StoryProps> = (args) => <Pill {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
