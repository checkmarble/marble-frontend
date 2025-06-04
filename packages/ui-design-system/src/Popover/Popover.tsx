import {
  Popover as PopoverPrimitive,
  PopoverAnchor,
  PopoverContent as PopoverContentPrimitive,
  type PopoverContentProps,
  PopoverPortal,
  PopoverTrigger,
} from '@radix-ui/react-popover';

import { cn } from '../utils';

function PopoverContent({ className, ...props }: PopoverContentProps) {
  return (
    <PopoverPortal>
      <PopoverContentPrimitive
        {...props}
        className={cn(
          'bg-grey-100 border-grey-90 z-50 max-h-[min(var(--radix-popover-content-available-height),_500px)] rounded border text-xs shadow-lg',
          className,
        )}
      />
    </PopoverPortal>
  );
}

export const Popover = {
  Root: PopoverPrimitive,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
};
