import { type Meta, type StoryFn } from '@storybook/react';
import { Plus } from '@ui-icons';

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

const TemplateWithIcon: StoryFn<StoryProps> = ({ children, ...args }) => {
  return (
    <Button {...args}>
      <Plus width={24} height={24} />
      {children}
    </Button>
  );
};

const primaryArgTypes = {
  variant: {
    defaultValue: 'primary',
  },
  color: {
    control: { type: 'select' },
    options: variantColors['primary'],
    defaultValue: variantColors['primary'][0],
  },
};

export const Primary = Template.bind({});
Primary.argTypes = primaryArgTypes;

export const PrimaryWithIcon = TemplateWithIcon.bind({});
PrimaryWithIcon.argTypes = primaryArgTypes;

const secondaryArgTypes = {
  variant: {
    defaultValue: 'secondary',
  },
  color: {
    control: { type: 'select' },
    options: variantColors['secondary'],
    defaultValue: variantColors['secondary'][0],
  },
};

export const Secondary = Template.bind({});
Secondary.argTypes = secondaryArgTypes;

export const SecondaryWithIcon = TemplateWithIcon.bind({});
SecondaryWithIcon.argTypes = secondaryArgTypes;
