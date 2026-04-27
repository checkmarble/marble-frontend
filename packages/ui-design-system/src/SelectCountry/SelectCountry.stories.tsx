import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { SelectCountry, type SelectCountryProps, type SelectCountryValue } from './SelectCountry';

const Story: Meta<SelectCountryProps> = {
  component: SelectCountry,
  title: 'SelectCountry',
  args: {
    placeholder: 'Select country',
    searchPlaceholder: 'Search country…',
    disabled: false,
  },
  argTypes: {
    disabled: { type: 'boolean' },
  },
};
export default Story;

function StatefulSelectCountry(args: Omit<SelectCountryProps, 'value' | 'onValueChange'>) {
  const [value, setValue] = useState<SelectCountryValue | null>(null);
  return <SelectCountry {...args} value={value} onValueChange={setValue} />;
}

export const Default: StoryFn<SelectCountryProps> = (args) => <StatefulSelectCountry {...args} />;

export const WithPreselectedValue: StoryFn<SelectCountryProps> = (args) => {
  const [value, setValue] = useState<SelectCountryValue | null>({
    isoAlpha2: 'FR',
    isoAlpha3: 'FRA',
    name: 'France',
    isManual: false,
  });
  return <SelectCountry {...args} value={value} onValueChange={setValue} />;
};

export const WithManualValue: StoryFn<SelectCountryProps> = (args) => {
  const [value, setValue] = useState<SelectCountryValue | null>({
    isoAlpha2: '',
    isoAlpha3: '',
    name: 'Narnia',
    isManual: true,
  });
  return <SelectCountry {...args} value={value} onValueChange={setValue} />;
};

export const Disabled: StoryFn<SelectCountryProps> = (args) => <StatefulSelectCountry {...args} disabled />;
