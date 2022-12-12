import type { Story, Meta } from '@storybook/react';
import { Avatar, type AvatarProps } from './Avatar';

type StoryProps = AvatarProps;

const Story: Meta<StoryProps> = {
  component: Avatar,
  title: 'Avatar',
  argTypes: {
    firstName: { defaultValue: 'Pierre' },
    lastName: { defaultValue: 'Lemaire' },
    src: {
      control: 'select',
      options: [
        undefined,
        'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80',
        'https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80',
      ],
    },
  },
};
export default Story;

const Template: Story<StoryProps> = (args) => {
  return <Avatar {...args} />;
};

export const Primary = Template.bind({});
