import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type TooltipContentProps, type TooltipProps } from '@radix-ui/react-tooltip';

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
          className="z-50 drop-shadow-lg dark:drop-shadow-[#000]/30"
          {...props}
        >
          <div
            className={cn(
              'bg-surface-elevated border-grey-border text-grey-primary max-h-40 overflow-y-auto rounded-sm border p-sm',
              className,
            )}
          >
            {content}
          </div>
          {arrow ? (
            <TooltipPrimitive.Arrow asChild width={11} height={5}>
              <svg viewBox="0 0 11 5" className="fill-surface-elevated stroke-grey-border" aria-hidden="true">
                <path d="M0 0 L5.5 5 L11 0" />
              </svg>
            </TooltipPrimitive.Arrow>
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

const TooltipContent = ({
  ref,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  ref?: React.Ref<React.ElementRef<typeof TooltipPrimitive.Content>>;
}) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'border-grey-border bg-surface-elevated text-grey-primary animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-radix-tooltip overflow-hidden rounded-sm border p-xs text-xs shadow-lg dark:shadow-[#000]/30',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

export const TooltipV2 = {
  Provider: TooltipPrimitive.Provider,
  Tooltip: TooltipPrimitive.Root,
  TooltipTrigger: TooltipPrimitive.Trigger,
  TooltipContent,
};
