import { type Meta, type StoryFn } from '@storybook/react';

import { Kbd } from './Kbd';

const Story: Meta<typeof Kbd> = {
  component: Kbd,
  title: 'Kbd',
};
export default Story;

export const Default: StoryFn<typeof Kbd> = () => (
  <div className="flex w-fit flex-row gap-2">
    <Kbd className="aspect-square">▲</Kbd>
    <Kbd className="aspect-square">▼</Kbd>
    to navigate
  </div>
);
