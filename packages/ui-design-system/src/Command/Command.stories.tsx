import * as Popover from '@radix-ui/react-popover';
import type { Meta, StoryFn } from '@storybook/react';
import { Icon } from 'ui-icons';

import { Button } from '../Button/Button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from './Command';

function CommandExample() {
  return (
    <Popover.Root modal>
      <Popover.Trigger asChild>
        <Button variant="secondary">
          <Icon icon="plus" className="size-4" />
          <span>Add a rule group</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content className="mt-1" align="start">
        <Command className="w-[400px] p-2">
          <div className="border-grey-90 flex items-center gap-2 border-b p-2 pb-4">
            <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
              <span className="text-purple-65 text-xs">Rule group 1</span>
              <Icon icon="cross" className="text-purple-65 size-4" />
            </div>
            <CommandInput placeholder="new rule group" />
          </div>
          <CommandList>
            <CommandItem>+ Typing to create a new label</CommandItem>
            <CommandGroup heading="Select a rule group or create one">
              <CommandItem>
                <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
                  <span className="text-purple-65 text-xs">Rule group 1</span>
                </div>
              </CommandItem>
              <CommandItem>
                <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
                  <span className="text-purple-65 text-xs">Rule group 2</span>
                </div>
              </CommandItem>
              <CommandItem>
                <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
                  <span className="text-purple-65 text-xs">Rule group 3</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Popover.Content>
    </Popover.Root>
  );
}

const Story: Meta = {
  component: CommandExample,
  title: 'Command',
};
export default Story;

export const Default: StoryFn = () => <CommandExample />;
