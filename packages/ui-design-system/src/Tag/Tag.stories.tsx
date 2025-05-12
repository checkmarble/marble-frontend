import type { Meta, StoryFn } from '@storybook/react';

import { Tag, type TagProps } from './Tag';
import { tagBorder, tagColors, tagSize } from './Tag.constants';

type StoryProps = TagProps;

const Story: Meta<StoryProps> = {
  component: Tag,
  title: 'Tag',
  args: {
    children: 'Tag',
    color: tagColors[0],
    border: tagBorder[0],
    size: tagSize[0],
  },
  argTypes: {
    children: {
      type: 'string',
    },
    color: {
      control: { type: 'select' },
      options: tagColors.slice(),
    },
    border: {
      control: { type: 'select' },
      options: tagBorder.slice(),
    },
    size: {
      control: { type: 'select' },
      options: tagSize.slice(),
    },
  },
};
export default Story;

const Template: StoryFn<StoryProps> = (args) => <Tag {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
