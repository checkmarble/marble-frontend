import { type ComponentStory, type ComponentMeta } from '@storybook/react';
import * as Label from '@radix-ui/react-label';
import { Checkbox } from './Checkbox';

const Story: ComponentMeta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Checkbox',
  argTypes: {
    disabled: { control: 'boolean', defaultValue: false },
  },
};
export default Story;

export const WithoutLabel: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} />
);

export const WithLabel: ComponentStory<typeof Checkbox> = (args) => (
  <form>
    <div className="flex flex-row gap-2">
      <Checkbox {...args} id="c1" />
      <Label.Root htmlFor="c1">Accept terms and conditions.</Label.Root>
    </div>
  </form>
);
