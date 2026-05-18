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
      <label className="flex items-center gap-2 text-s">
        <Radio.Item value="option1" />
        Option 1
      </label>
      <label className="flex items-center gap-2 text-s">
        <Radio.Item value="option2" />
        Option 2
      </label>
      <label className="flex items-center gap-2 text-s">
        <Radio.Item value="option3" />
        Option 3
      </label>
    </Radio.Root>
  );
};
