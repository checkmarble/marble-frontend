import { type Meta, type StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

import { Button, type ButtonV2Props } from './Button';

const Story: Meta<ButtonV2Props> = {
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
      options: ['primary', 'secondary', 'destructive'],
      name: 'Variant',
    },
    appearance: {
      control: { type: 'select' },
      options: ['filled', 'stroked', 'link'],
      name: 'Appearance',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'default'],
      name: 'Size',
    },
    children: {
      type: 'string',
    },
  },
};
export default Story;

const Template: StoryFn<ButtonV2Props> = (args) => {
  return <Button {...args} />;
};

const TemplateWithIcon: StoryFn<ButtonV2Props> = ({ children, ...args }) => {
  return (
    <Button {...args}>
      <Icon icon="plus" className="size-5" />
      {children}
    </Button>
  );
};

export const Primary = Template.bind({});
Primary.args = { variant: 'primary' };

export const PrimaryWithIcon = TemplateWithIcon.bind({});
PrimaryWithIcon.args = { variant: 'primary' };

export const Secondary = Template.bind({});
Secondary.args = { variant: 'secondary' };

export const SecondaryWithIcon = TemplateWithIcon.bind({});
SecondaryWithIcon.args = { variant: 'secondary' };

export const Destructive = Template.bind({});
Destructive.args = { variant: 'destructive' };
