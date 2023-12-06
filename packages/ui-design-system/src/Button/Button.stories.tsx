import { type Meta, type StoryFn } from '@storybook/react';
import { Plus } from 'ui-icons';

import { Button, type ButtonProps, variantColors } from './Button';

type StoryProps = Omit<ButtonProps, 'ref'>;

const Story: Meta<StoryProps> = {
  component: Button,
  title: 'Button',
  args: {
    disabled: false,
    children: 'Button label',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    variant: {
      table: {
        disable: true,
      },
    },
    children: {
      type: 'string',
    },
  },
};
export default Story;

const Template: StoryFn<StoryProps> = (args) => {
  return <Button {...args} />;
};

const TemplateWithIcon: StoryFn<StoryProps> = ({
  children,
  ...args
}: StoryProps) => {
  return (
    <Button {...args}>
      <Plus width={24} height={24} />
      {children}
    </Button>
  );
};

const primaryArgss = {
  variant: 'primary',
} as const;
const primaryArgTypes = {
  color: {
    control: { type: 'select' },
    options: variantColors['primary'],
    defaultValue: variantColors['primary'][0],
  },
};

export const Primary = Template.bind({});
Primary.args = primaryArgss;
Primary.argTypes = primaryArgTypes;

export const PrimaryWithIcon = TemplateWithIcon.bind({});
PrimaryWithIcon.args = primaryArgss;
PrimaryWithIcon.argTypes = primaryArgTypes;

const secondaryArgs = {
  variant: 'secondary',
} as const;
const secondaryArgTypes = {
  color: {
    control: { type: 'select' },
    options: variantColors['secondary'],
    defaultValue: variantColors['secondary'][0],
  },
};

export const Secondary = Template.bind({});
Secondary.args = secondaryArgs;
Secondary.argTypes = secondaryArgTypes;

export const SecondaryWithIcon = TemplateWithIcon.bind({});
SecondaryWithIcon.args = secondaryArgs;
SecondaryWithIcon.argTypes = secondaryArgTypes;
