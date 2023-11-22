import { type Meta, type StoryFn } from '@storybook/react';

import { Separator } from './Separator';

const Story: Meta<typeof Separator> = {
  component: Separator,
  title: 'Separator',
};
export default Story;

export const Default: StoryFn<typeof Separator> = () => (
  <div className="flex w-fit flex-col gap-2">
    <h1>Title</h1>
    <p>Et consectetur et eaque at in quas libero qui.</p>
    <Separator className="bg-grey-100" />
    <div className="flex h-5 items-center gap-2">
      <div>Blog</div>
      <Separator className="bg-grey-100" decorative orientation="vertical" />
      <div>Docs</div>
      <Separator className="bg-grey-100" decorative orientation="vertical" />
      <div>Source</div>
    </div>
  </div>
);
