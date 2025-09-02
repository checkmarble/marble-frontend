import { Popover as RadixPopover } from 'radix-ui';
import { cn } from '../utils';

function PopoverContent({ className, ...props }: RadixPopover.PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        {...props}
        className={cn(
          'bg-grey-100 border-grey-90 z-50 max-h-[min(var(--radix-popover-content-available-height),500px)] rounded-sm border text-xs shadow-lg',
          className,
        )}
      />
    </RadixPopover.Portal>
  );
}

export const Popover = {
  Root: RadixPopover.Root,
  Anchor: RadixPopover.Anchor,
  Trigger: RadixPopover.Trigger,
  Content: PopoverContent,
};
