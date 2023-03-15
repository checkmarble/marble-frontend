import { Plus } from '@marble-front/ui/icons';
import { type Meta, Story } from '@storybook/react';

import { Button, type ButtonProps, variantColors } from './Button';

type StoryProps = Omit<ButtonProps, 'ref'>;

const Story: Meta<StoryProps> = {
  component: Button,
  title: 'Button',
  argTypes: {
    disabled: { control: 'boolean', defaultValue: false },
    variant: {
      table: {
        disable: true,
      },
    },
    children: {
      type: 'string',
      defaultValue: 'Button label',
    },
  },
};
export default Story;

const Template: Story<StoryProps> = (args) => {
  return <Button {...args} />;
};

const TemplateWithIcon: Story<StoryProps> = ({ children, ...args }) => {
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
