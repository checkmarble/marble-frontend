import { type Meta, type StoryFn } from '@storybook/react';
import { type ComponentProps, useState } from 'react';

import { Radio } from './Radio';

type Args = ComponentProps<typeof Radio.Root> & {
  disabledItems: string[];
};

const OPTIONS = ['option1', 'option2', 'option3'] as const;

const Story: Meta<Args> = {
  title: 'Radio',
  component: Radio.Root,
  args: {
    size: 'regular',
    disabledItems: [],
  },
  argTypes: {
    size: { control: 'radio', options: ['regular', 'small'] },
    disabledItems: { control: 'check', options: [...OPTIONS] },
  },
};
export default Story;

export const Default: StoryFn<Args> = (args) => {
  const [selected, setSelected] = useState<string>('option1');
  return (
    <Radio.Root value={selected} onValueChange={setSelected} size={args.size}>
      {OPTIONS.map((value) => (
        <label key={value} className="text-s flex items-center gap-sm">
          <Radio.Item value={value} disabled={args.disabledItems?.includes(value)} />
          {value}
        </label>
      ))}
    </Radio.Root>
  );
};
