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

// Every variant × appearance combination, rendered enabled and disabled.
export const Gallery: StoryFn<ButtonV2Props> = (args) => (
  <div className="flex flex-col gap-6">
    {appearances.map((appearance) => (
      <div key={appearance} className="flex flex-col gap-2">
        <span className="text-grey-secondary text-s font-medium capitalize">{appearance}</span>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} appearance={appearance}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} appearance={appearance} disabled>
              {variant}
            </Button>
          ))}
        </div>
      </div>
    ))}
  </div>
);
Gallery.args = { children: undefined };
Gallery.argTypes = {
  variant: { control: false },
  appearance: { control: false },
  children: { control: false },
};

// The `color` axis for filled buttons (most meaningful with variant="primary").
export const Colors: StoryFn<ButtonV2Props> = (args) => (
  <div className="flex flex-wrap items-center gap-3">
    {colors.map((color) => (
      <Button key={color} {...args} variant="primary" appearance="filled" color={color}>
        {color}
      </Button>
    ))}
  </div>
);
Colors.args = { children: undefined };
Colors.argTypes = {
  variant: { control: false },
  appearance: { control: false },
  color: { control: false },
  children: { control: false },
};

// All sizes side by side, in both normal and icon mode.
export const Sizes: StoryFn<ButtonV2Props> = (args) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} mode="icon" aria-label={size}>
          <Icon icon="plus" className={ICON_GLYPH[size]} />
        </Button>
      ))}
    </div>
  </div>
);
Sizes.args = { children: undefined };
Sizes.argTypes = {
  size: { control: false },
  mode: { control: false },
  children: { control: false },
};
