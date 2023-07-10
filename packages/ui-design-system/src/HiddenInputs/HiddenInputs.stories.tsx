import { type Meta, type StoryFn } from '@storybook/react';

import { Button } from '../Button/Button';
import { HiddenInputs } from './HiddenInputs';

const Story: Meta<typeof HiddenInputs> = {
  component: HiddenInputs,
  title: 'HiddenInputs',
  args: {
    value: 'Hidden value...',
  },
  argTypes: {
    value: { type: 'string' },
  },
};
export default Story;

const Template: StoryFn<typeof HiddenInputs> = (args) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      alert(
        //@ts-expect-error wrong cast of FormData
        JSON.stringify(Object.fromEntries(new FormData(e.target)), null, 2)
      );
    }}
  >
    <h1>Input should not be visible, data will be sent in form payload</h1>
    <p>You can modify the value using the "Control" panel</p>
    <HiddenInputs {...args} />
    <Button type="submit">submit form</Button>
  </form>
);

export const Primary = Template.bind({});
Primary.args = {};
