import { type Meta, type StoryFn } from '@storybook/react';

import { TextArea } from './TextArea';

const Story: Meta<typeof TextArea> = {
  component: TextArea,
  title: 'TextArea',
  args: { disabled: false, borderColor: 'greyfigma-90' },
  argTypes: {
    disabled: { control: 'boolean' },
    borderColor: {
      control: { type: 'radio' },
      options: ['greyfigma-90', 'redfigma-87', 'redfigma-47'],
    },
  },
};
export default Story;

export const Primary: StoryFn<typeof TextArea> = (args) => (
  <TextArea {...args} />
);
Primary.args = {};

export const Reset: StoryFn<typeof TextArea> = (args) => (
  <form>
    <TextArea {...args} />
    <button
      onClick={(e) => {
        e.currentTarget.form?.reset();
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      reset
    </button>
  </form>
);
Primary.args = {};
