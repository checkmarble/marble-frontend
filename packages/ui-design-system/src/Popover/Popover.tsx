import {
  PopoverAnchor,
  PopoverContent as PopoverContentPrimitive,
  type PopoverContentProps,
  PopoverPortal,
  Popover as PopoverPrimitive,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { forwardRef, type ReactNode } from 'react';

import { StickyComponent } from '../StickyComponent/StickyComponent';
import { cn } from '../utils';

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { className, children, ...props },
  ref,
) {
  return (
    <PopoverPortal>
      <PopoverContentPrimitive
        ref={ref}
        {...props}
        className={cn(
          className,
          'bg-surface-card border-grey-border z-50 flex max-h-[min(var(--radix-popover-content-available-height),500px)] flex-col overflow-x-hidden overflow-y-auto rounded-sm border text-xs shadow-lg',
        )}
      >
        {children}
      </PopoverContentPrimitive>
    </PopoverPortal>
  );
});
PopoverContent.displayName = 'PopoverContent';

interface PopoverFooterProps {
  children: ReactNode;
  className?: string;
}

function PopoverFooter({ children, className }: PopoverFooterProps) {
  return (
    <StickyComponent inFlow>
      <div
        className={cn(
          'sticky bottom-0 z-10 border-t border-transparent bg-surface-card flex justify-end gap-v2-sm p-v2-md sentinel-intersect:border-t-grey-border sentinel-intersect:shadow-sticky-bottom',
          className,
        )}
      >
        {children}
      </div>
    </StickyComponent>
  );
}

export const Popover = {
  Root: PopoverPrimitive,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Footer: PopoverFooter,
};
