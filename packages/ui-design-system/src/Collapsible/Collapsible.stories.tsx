import { type Meta, type StoryFn } from '@storybook/react';

import { Collapsible } from './Collapsible';

type StoryArgs = Pick<React.ComponentProps<typeof Collapsible.Title>, 'iconPosition' | 'size'>;

const Story: Meta<StoryArgs> = {
  title: 'Collapsible',
  argTypes: {
    iconPosition: {
      control: 'inline-radio',
      options: ['hidden', 'left', 'right'],
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'small', null],
    },
  },
};
export default Story;

export const Default: StoryFn<StoryArgs> = ({ iconPosition, size }) => (
  <Collapsible.Container>
    <Collapsible.Title iconPosition={iconPosition} size={size}>
      Hello
    </Collapsible.Title>
    <Collapsible.Content>
      <div>World</div>
    </Collapsible.Content>
  </Collapsible.Container>
);
Default.args = {
  iconPosition: 'right',
  size: 'default',
};
