import type { Story, Meta } from '@storybook/react';
import { Tag, type TagProps } from './Tag';
import { tagBorder, tagColors, tagSize } from './Tag.constants';

type StoryProps = TagProps;

const Story: Meta<StoryProps> = {
  component: Tag,
  title: 'Tag',
  argTypes: {
    children: {
      type: 'string',
      defaultValue: 'Tag',
    },
    color: {
      control: { type: 'select' },
      options: tagColors,
      defaultValue: tagColors[0],
    },
    border: {
      control: { type: 'select' },
      options: tagBorder,
      defaultValue: tagBorder[0],
    },
    size: {
      control: { type: 'select' },
      options: tagSize,
      defaultValue: tagSize[0],
    },
  },
};
export default Story;

const Template: Story<StoryProps> = (args) => <Tag {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
