import { type Meta, type StoryFn } from '@storybook/react';
import { Calendar, Help, Scenarios, Search } from 'ui-icons';

import { Input } from './Input';
import { inputBorderColor } from './Input.constants';

const adornments = {
  Calendar: <Calendar />,
  Help: <Help />,
  Scenarios: <Scenarios />,
  Search: <Search />,
};

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
      options: Object.keys(adornments),
      mapping: adornments,
      control: {
        type: 'select',
      },
    },
    endAdornment: {
      options: Object.keys(adornments),
      mapping: adornments,
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
