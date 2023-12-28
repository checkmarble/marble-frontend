import { type Meta, type StoryFn } from '@storybook/react';
import { iconNames } from 'ui-icons';

import { Input } from './Input';
import { inputBorderColor } from './Input.constants';

const Story: Meta<typeof Input> = {
  component: Input,
  title: 'Input',
  args: { disabled: false, borderColor: inputBorderColor[0] },
  argTypes: {
    disabled: { control: 'boolean' },
    borderColor: {
      control: { type: 'radio' },
      options: inputBorderColor,
    },
    startAdornment: {
      options: iconNames,
      control: {
        type: 'select',
      },
    },
    endAdornment: {
      options: iconNames,
      control: {
        type: 'select',
      },
    },
  },
};
export default Story;

const Template: StoryFn<typeof Input> = (args) => <Input {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
