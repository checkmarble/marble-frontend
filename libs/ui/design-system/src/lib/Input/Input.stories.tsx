import { Search, Calendar, Help, Scenarios } from '@marble-front/ui/icons';
import type { Story, Meta } from '@storybook/react';
import { Input, type InputProps } from './Input';

const adornmentOptions = [
  'none',
  'search',
  'calendar',
  'help',
  'scenarios',
] as const;
type AdornmentOption = typeof adornmentOptions[number];
const adornments: Record<AdornmentOption, JSX.Element | undefined> = {
  none: undefined,
  search: <Search />,
  calendar: <Calendar />,
  help: <Help />,
  scenarios: <Scenarios />,
};

const Story: Meta<InputProps> = {
  component: Input,
  title: 'Input',
  argTypes: {
    startAdornment: {
      control: { type: 'select' },
      options: adornmentOptions,
      defaultValue: adornmentOptions[0],
    },
    endAdornment: {
      control: { type: 'select' },
      options: adornmentOptions,
      defaultValue: adornmentOptions[0],
    },
  },
};
export default Story;

const Template: Story<
  Omit<InputProps, 'startAdornment' | 'endAdornment'> & {
    startAdornment: AdornmentOption;
    endAdornment: AdornmentOption;
  }
> = ({ startAdornment, endAdornment, ...args }) => (
  <Input
    {...args}
    startAdornment={adornments[startAdornment]}
    endAdornment={adornments[endAdornment]}
  />
);

export const Primary = Template.bind({});
Primary.args = {};
