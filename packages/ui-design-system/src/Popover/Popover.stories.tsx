import { type Meta, type StoryFn } from '@storybook/react';

import { Button } from '../Button/Button';
import { Popover } from './Popover';

const Story: Meta<typeof Popover.Content> = {
  component: Popover.Content,
  title: 'Popover',
};
export default Story;

export const Primary: StoryFn<typeof Popover.Content> = () => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button type="button" className="rounded-sm border border-grey-border bg-surface-elevated px-md py-xs text-s">
        Open popover
      </button>
    </Popover.Trigger>
    <Popover.Content side="bottom" sideOffset={4} className="p-md">
      <div className="flex w-64 flex-col gap-sm">
        <span className="text-m font-semibold">Popover title</span>
        <span className="text-s text-grey-secondary">
          A floating panel anchored to its trigger. Click outside or press Escape to close.
        </span>
      </div>
    </Popover.Content>
  </Popover.Root>
);

export const WithAnchor: StoryFn<typeof Popover.Content> = () => (
  <Popover.Root defaultOpen>
    <Popover.Anchor asChild>
      <div className="flex h-16 w-64 items-center justify-center rounded-sm border border-dashed border-grey-border text-s text-grey-secondary">
        Anchor element
      </div>
    </Popover.Anchor>
    <div className="mt-md">
      <Popover.Trigger asChild>
        <button type="button" className="rounded-sm border border-grey-border bg-surface-elevated px-md py-xs text-s">
          Toggle (anchored above)
        </button>
      </Popover.Trigger>
    </div>
    <Popover.Content side="bottom" sideOffset={4} className="p-md">
      <span className="text-s">Positioned relative to the anchor, not the trigger.</span>
    </Popover.Content>
  </Popover.Root>
);

export const WithFooter: StoryFn<typeof Popover.Content> = () => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button type="button" className="rounded-sm border border-grey-border bg-surface-elevated px-md py-xs text-s">
        Open scrollable popover
      </button>
    </Popover.Trigger>
    <Popover.Content side="bottom" sideOffset={4} className="w-72 p-0">
      <div className="flex flex-col gap-sm p-lg">
        {Array.from({ length: 20 }, (_, index) => (
          <span key={index}>Item {index + 1}</span>
        ))}
      </div>
      <Popover.Footer>
        <Button variant="secondary" size="small">
          Cancel
        </Button>
        <Button variant="primary" size="small">
          Save
        </Button>
      </Popover.Footer>
    </Popover.Content>
  </Popover.Root>
);
