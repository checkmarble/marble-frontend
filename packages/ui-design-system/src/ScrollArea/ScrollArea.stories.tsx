import { type Meta, type StoryFn } from '@storybook/react';
import clsx from 'clsx';

import { ScrollAreaV2 } from './ScrollArea';

const Story: Meta<typeof ScrollAreaV2> = {
  component: ScrollAreaV2,
  title: 'ScrollView',
};
export default Story;

export const V2: StoryFn = () => (
  <ScrollAreaV2
    orientation="both"
    className="border-grey-placeholder max-h-72 w-fit max-w-[100px] rounded-sm border shadow-md"
  >
    <ul>
      {Array.from({ length: 15 }).map((_, index) => (
        <li
          className={clsx(
            'flex w-48 flex-col px-md py-xs shadow-xs',
            index % 2 === 0 ? 'bg-grey-border' : 'bg-surface-card',
          )}
          key={index}
        >
          <span>{index}</span>
        </li>
      ))}
    </ul>
  </ScrollAreaV2>
);
