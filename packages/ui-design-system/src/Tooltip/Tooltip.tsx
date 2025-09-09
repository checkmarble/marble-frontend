import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type TooltipContentProps, type TooltipProps } from '@radix-ui/react-tooltip';
import { forwardRef } from 'react';

import { cn } from '../utils';

interface DefaultTooltipProps
  extends Pick<TooltipProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'delayDuration'>,
    Omit<TooltipContentProps, 'content'> {
  children: React.ReactNode;
  content: React.ReactNode;
  arrow?: boolean;
}

export function DefaultTooltip({
  delayDuration = 700,
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
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          align="center"
          className="z-50 drop-shadow-sm"
          {...props}
        >
          <div className={cn('bg-grey-100 max-h-40 overflow-y-auto rounded-sm p-2', className)}>
            {content}
          </div>
          {arrow ? (
            <TooltipPrimitive.Arrow width={11} height={5} className="fill-grey-100" />
          ) : null}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export const Tooltip = {
  Default: DefaultTooltip,
  Provider: TooltipPrimitive.Provider,
};

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'border-grey-90 bg-grey-100 text-grey-00 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-radix-tooltip overflow-hidden rounded-sm border p-1.5 text-xs',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export const TooltipV2 = {
  Provider: TooltipPrimitive.Provider,
  Tooltip: TooltipPrimitive.Root,
  TooltipTrigger: TooltipPrimitive.Trigger,
  TooltipContent,
};
