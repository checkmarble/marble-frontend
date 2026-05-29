import { type Meta, type StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

import { Button, type ButtonV2Props } from './Button';

const Story: Meta<ButtonV2Props> = {
  title: 'Button',
  component: Button,
  args: {
    disabled: false,
    variant: 'primary',
    appearance: 'filled',
    size: 'small',
    mode: 'normal',
    children: 'Button label',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    appearance: {
      control: 'select',
      options: ['filled', 'stroked', 'link'],
    },
    size: {
      control: 'radio',
      options: ['small', 'default'],
    },
    mode: {
      control: 'radio',
      options: ['normal', 'icon'],
    },
    children: { control: 'text' },
  },
};
export default Story;

export const Default: StoryFn<ButtonV2Props> = (args) => <Button {...args} />;

export const WithIcon: StoryFn<ButtonV2Props> = ({ children, ...args }) => (
  <Button {...args}>
    <Icon icon="plus" className="size-4" />
    {children}
  </Button>
);
