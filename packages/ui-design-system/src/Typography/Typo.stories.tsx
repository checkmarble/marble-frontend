import { type Meta, type StoryFn } from '@storybook/react';

import { Typo, type TypoProps } from './Typo';

const variants = ['title1', 'title2', 'subtitle1', 'subtitle2', 'text'] as const;

const Story: Meta<TypoProps> = {
  title: 'Typo',
  component: Typo,
  args: {
    variant: 'text',
    children: 'The quick brown fox jumps over the lazy dog',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variants.slice(),
    },
    children: { control: 'text' },
  },
};
export default Story;

export const Default: StoryFn<TypoProps> = (args) => <Typo {...args} />;

export const AllVariants: StoryFn<TypoProps> = ({ children }) => (
  <div className="flex flex-col gap-4">
    {variants.map((variant) => (
      <div key={variant} className="flex flex-col gap-1">
        <Typo variant="text" className="text-grey-secondary">
          {variant}
        </Typo>
        <Typo variant={variant}>{children}</Typo>
      </div>
    ))}
  </div>
);

// Override the rendered element via the `as` prop while keeping the variant styling.
export const AsElement: StoryFn<TypoProps> = (args) => <Typo {...args} as="span" variant="subtitle1" />;
AsElement.args = { children: 'Rendered as a <span>' };
