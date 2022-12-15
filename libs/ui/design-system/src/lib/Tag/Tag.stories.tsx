import type { Story, Meta } from '@storybook/react';
import { Tag, type TagProps, tagColors } from './Tag';

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
  },
};
export default Story;

const Template: Story<StoryProps> = (args) => <Tag {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
