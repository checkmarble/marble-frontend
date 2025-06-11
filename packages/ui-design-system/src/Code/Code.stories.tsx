// Code.stories.tsx

import { type Meta, type StoryObj } from '@storybook/react';

import { Code } from './Code';

const meta: Meta<typeof Code> = {
  title: 'Code',
  component: Code,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Code>;

export const Default: Story = {
  args: {
    children: 'console.log("Hello, world!")',
  },
};
export const Multiline: Story = {
  args: {
    children: `function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("world"));`,
  },
};
