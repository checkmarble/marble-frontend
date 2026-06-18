import { type Meta, type StoryFn } from '@storybook/react';

import { Markdown } from './Markdown';

const sample = `# Heading 1

A short paragraph of text describing the section. It may include an [inline link](https://example.com "Example tooltip") that reveals a hover card.

## Heading 2

Inline \`code\` renders with the design system's Code component.

### Heading 3

- First bullet
- Second bullet
- Third bullet

1. Ordered one
2. Ordered two

---

End of sample.`;

const Story: Meta<typeof Markdown> = {
  component: Markdown,
  title: 'Markdown',
  args: { children: sample },
  argTypes: {
    children: { control: 'text' },
  },
};
export default Story;

const Template: StoryFn<typeof Markdown> = (args) => (
  <div className="max-w-2xl">
    <Markdown {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {};

export const CustomComponents = Template.bind({});
CustomComponents.args = {
  children: '# Custom heading\n\nFollowed by a paragraph.',
  components: {
    h1: ({ children }) => <div className="text-h1 font-bold text-red-100">{children}</div>,
    p: ({ children }) => <p className="text-s text-grey-secondary">{children}</p>,
  },
};
