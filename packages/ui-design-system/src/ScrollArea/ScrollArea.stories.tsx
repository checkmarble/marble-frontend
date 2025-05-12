import type { Meta, StoryFn } from '@storybook/react';
import clsx from 'clsx';

import { ScrollArea, ScrollAreaV2 } from './ScrollArea';

const Story: Meta<typeof ScrollArea.Root> = {
  component: ScrollArea.Root,
  title: 'ScrollView',
};
export default Story;

export const V1: StoryFn = () => (
  <ScrollArea.Root className="border-grey-50 w-fit rounded border shadow-md">
    <ScrollArea.Viewport className="max-h-72 max-w-[100px]">
      <ul>
        {Array.from({ length: 15 }).map((_, index) => (
          <li
            className={clsx(
              'flex w-48 flex-col px-3 py-2 shadow-sm',
              index % 2 === 0 ? 'bg-grey-90' : 'bg-grey-100',
            )}
            key={index}
          >
            <span>{index}</span>
          </li>
        ))}
      </ul>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar>
      <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
    <ScrollArea.Scrollbar orientation="horizontal">
      <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner />
  </ScrollArea.Root>
);

export const V2: StoryFn = () => (
  <ScrollAreaV2
    orientation="both"
    className="border-grey-50 max-h-72 w-fit max-w-[100px] rounded border shadow-md"
  >
    <ul>
      {Array.from({ length: 15 }).map((_, index) => (
        <li
          className={clsx(
            'flex w-48 flex-col px-3 py-2 shadow-sm',
            index % 2 === 0 ? 'bg-grey-90' : 'bg-grey-100',
          )}
          key={index}
        >
          <span>{index}</span>
        </li>
      ))}
    </ul>
  </ScrollAreaV2>
);
