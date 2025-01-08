import { type Meta, type StoryFn } from '@storybook/react';
import { iconNames } from 'ui-icons';

import { Input } from './Input';
import { inputBorderColor } from './Input.constants';
import { useState } from 'react';

const Story: Meta<typeof Input> = {
  component: Input,
  title: 'Input',
  args: { disabled: false, borderColor: inputBorderColor[0] },
  argTypes: {
    disabled: { control: 'boolean' },
    borderColor: {
      control: { type: 'radio' },
      options: inputBorderColor.slice(),
    },
    startAdornment: {
      options: iconNames.slice(),
      control: {
        type: 'select',
      },
    },
    endAdornment: {
      options: iconNames.slice(),
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

export const Debounced: StoryFn<typeof Input> = (args) => {
  const { debounceMs: debouncedMs } = args;
  const [value, setValue] = useState('');
  return (
    <>
      <Input
        debounceMs={debouncedMs}
        onChange={(e) => setValue(e.target.value)}
      />
      {value}
    </>
  );
};

Debounced.argTypes = {
  disabled: { table: { disable: true } },
  borderColor: { table: { disable: true } },
  startAdornment: { table: { disable: true } },
  endAdornment: { table: { disable: true } },
  debounceMs: {
    control: { type: 'number' },
  },
};
