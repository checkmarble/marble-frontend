import { type Meta, type StoryFn } from '@storybook/react';

import { RadioGroup, RadioGroupItem, type RadioGroupProps } from './RadioGroup';

const Story: Meta<RadioGroupProps> = {
  component: RadioGroup,
  title: 'RadioGroup',
  args: {
    defaultValue: '1',
    disabled: false,
  },
  argTypes: {
    defaultValue: { control: 'select', options: ['1', '2'] as const },
    disabled: { control: 'boolean' },
  },
};
export default Story;

const TemplateDisabled: StoryFn<RadioGroupProps> = ({ children, ...args }) => {
  return (
    <RadioGroup {...args}>
      <RadioGroupItem value="1">Absolute</RadioGroupItem>
      <RadioGroupItem value="2">Percentage</RadioGroupItem>
    </RadioGroup>
  );
};

export const Disabled = TemplateDisabled.bind({});
