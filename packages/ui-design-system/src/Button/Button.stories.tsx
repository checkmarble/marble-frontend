import { type Meta, type StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

import { Button, type ButtonV2Props } from './Button';

const variants = ['primary', 'secondary', 'destructive', 'warning', 'success'] as const;
const appearances = ['filled', 'stroked', 'link'] as const;
const colors = ['primary', 'grey', 'red'] as const;
const sizes = ['small', 'medium', 'large'] as const;

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
      options: variants,
    },
    appearance: {
      control: 'select',
      options: appearances,
    },
    color: {
      control: 'select',
      options: colors,
      description: 'Hue for filled buttons. Mainly meaningful with variant="primary".',
    },
    size: {
      control: 'radio',
      options: sizes,
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

export const FilterAppearance: StoryFn<ButtonV2Props> = () => (
  <div className="inline-flex items-center gap-xs">
    <Button appearance="filter" size="large" className="font-semibold text-purple-primary">
      Status
    </Button>
    <Button appearance="filter" size="large" className="font-semibold text-grey-secondary">
      Status (inactive)
    </Button>
    <Button appearance="filter" mode="icon" size="large" aria-label="Clear filter">
      <Icon icon="cross" className="text-purple-primary size-5 shrink-0" />
    </Button>
  </div>
);
