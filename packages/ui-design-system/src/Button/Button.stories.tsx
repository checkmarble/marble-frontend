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
    color: 'primary',
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
    color: {
      control: 'radio',
      options: ['primary', 'grey', 'red'],
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
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

// Icon-only button (mode="icon"); glyph scales with size: small 16 / medium 20 / large 24.
const ICON_GLYPH = { small: 'size-4', medium: 'size-5', large: 'size-6' } as const;
export const IconOnly: StoryFn<ButtonV2Props> = ({ size = 'small', ...args }) => (
  <Button {...args} mode="icon" size={size} aria-label="add">
    <Icon icon="plus" className={ICON_GLYPH[size as keyof typeof ICON_GLYPH]} />
  </Button>
);
IconOnly.args = { mode: 'icon' };
