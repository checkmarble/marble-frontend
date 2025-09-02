import { Tooltip as RadixTooltip } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '../utils';

interface DefaultTooltipProps
  extends Pick<RadixTooltip.TooltipProps, 'open' | 'defaultOpen' | 'onOpenChange'>,
    Omit<RadixTooltip.TooltipContentProps, 'content'> {
  children: React.ReactNode;
  content: React.ReactNode;
  arrow?: boolean;
}

export function DefaultTooltip({
  arrow = true,
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: DefaultTooltipProps) {
  return (
    <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content side="top" align="center" className="z-50 drop-shadow-sm" {...props}>
          <div className={cn('bg-grey-100 max-h-40 overflow-y-auto rounded-sm p-2', className)}>
            {content}
          </div>
          {arrow ? <RadixTooltip.Arrow width={11} height={5} className="fill-grey-100" /> : null}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const Tooltip = {
  Default: DefaultTooltip,
  Provider: RadixTooltip.Provider,
};

const TooltipContent = forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <RadixTooltip.Portal>
    <RadixTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'border-grey-90 bg-grey-100 text-grey-00 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-radix-tooltip overflow-hidden rounded-sm border p-1.5 text-xs',
        className,
      )}
      {...props}
    />
  </RadixTooltip.Portal>
));

TooltipContent.displayName = RadixTooltip.Content.displayName;

export const TooltipV2 = {
  Provider: RadixTooltip.Provider,
  Tooltip: RadixTooltip.Root,
  TooltipTrigger: RadixTooltip.Trigger,
  TooltipContent,
};
