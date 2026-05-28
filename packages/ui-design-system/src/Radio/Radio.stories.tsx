import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Radio } from './Radio';

const Story: Meta<typeof Radio.Root> = {
  component: Radio.Root,
  title: 'Radio',
};
export default Story;

export const Primary: StoryFn<typeof Radio.Root> = () => {
  const [selected, setSelected] = useState('option1');

  return (
    <Radio.Root value={selected} onValueChange={setSelected}>
      <label className="text-s flex items-center gap-2">
        <Radio.Item value="option1" />
        Option 1
      </label>
      <label className="text-s flex items-center gap-2">
        <Radio.Item value="option2" />
        Option 2
      </label>
      <label className="text-s flex items-center gap-2">
        <Radio.Item value="option3" />
        Option 3
      </label>
    </Radio.Root>
  );
};

export const Small: StoryFn<typeof Radio.Root> = () => {
  const [selected, setSelected] = useState('option1');

  return (
    <Radio.Root value={selected} onValueChange={setSelected} size="small">
      <label className="text-xs flex items-center gap-2">
        <Radio.Item value="option1" />
        Option 1
      </label>
      <label className="text-xs flex items-center gap-2">
        <Radio.Item value="option2" />
        Option 2
      </label>
    </Radio.Root>
  );
};

export const WithDisabled: StoryFn<typeof Radio.Root> = () => {
  const [selected, setSelected] = useState('option1');

  return (
    <Radio.Root value={selected} onValueChange={setSelected}>
      <label className="text-s flex items-center gap-2">
        <Radio.Item value="option1" />
        Selected
      </label>
      <label className="text-s text-grey-disabled flex items-center gap-2">
        <Radio.Item value="option2" disabled />
        Disabled
      </label>
      <label className="text-s text-grey-disabled flex items-center gap-2">
        <Radio.Item value="option3" disabled />
        Selected disabled
      </label>
    </Radio.Root>
  );
};
