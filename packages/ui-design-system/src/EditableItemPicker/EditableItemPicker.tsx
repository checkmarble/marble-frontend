import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { forwardRef } from 'react';

export const EditableItemPicker = forwardRef<
  HTMLDivElement,
  { trigger: React.ReactNode }
>(function EditableItemPicker(props) {
  return (
    <Popover {...props}>
      <PopoverTrigger>{props.trigger}</PopoverTrigger>
      <PopoverContent>
        <Command className="flex flex-col">
          <Command.Input />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Letters">
              <Command.Item>a</Command.Item>
              <Command.Item>b</Command.Item>
              <Command.Separator />
              <Command.Item>c</Command.Item>
            </Command.Group>

            <Command.Item>Apple</Command.Item>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
