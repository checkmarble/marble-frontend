import { type Meta, type StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

import { Button, type ButtonProps } from './Button';

const Story: Meta<ButtonProps> = {
  component: Button,
  title: 'Button',
  args: {
    disabled: false,
    children: 'Button label',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'outline'],
      name: 'Variant',
    },
    color: {
      control: { type: 'select' },
      options: ['purple', 'grey', 'green', 'red'],
      name: 'Color',
    },
    children: {
      type: 'string',
    },
  },
};
export default Story;

const Template: StoryFn<ButtonProps> = (args) => {
  return <Button {...args} />;
};

const TemplateWithIcon: StoryFn<ButtonProps> = ({ children, ...args }) => {
  return (
    <Button {...args}>
      <Icon icon="plus" className="size-6" />
      {children}
    </Button>
  );
};

const primaryArgss = {
  variant: 'primary',
} as const;

export const Primary = Template.bind({});
Primary.args = primaryArgss;

export const PrimaryWithIcon = TemplateWithIcon.bind({});
PrimaryWithIcon.args = primaryArgss;

const secondaryArgs = {
  variant: 'secondary',
} as const;

export const Secondary = Template.bind({});
Secondary.args = secondaryArgs;

export const SecondaryWithIcon = TemplateWithIcon.bind({});
SecondaryWithIcon.args = secondaryArgs;
