import {
  type TooltipContentProps,
  type TooltipProps,
} from '@radix-ui/react-tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import clsx from 'clsx';

import { ScrollArea } from '../ScrollArea/ScrollArea';

interface DefaultTooltipProps
  extends Pick<TooltipProps, 'open' | 'defaultOpen' | 'onOpenChange'>,
    Omit<TooltipContentProps, 'content'> {
  children: React.ReactNode;
  content: React.ReactNode;
}

export function DefaultTooltip({
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
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          align="center"
          className="drop-shadow"
          {...props}
        >
          <ScrollArea.Root className={clsx('bg-grey-00 rounded', className)}>
            <ScrollArea.Viewport className="max-h-40 p-2">
              {content}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
          <TooltipPrimitive.Arrow
            width={11}
            height={5}
            className="fill-grey-00"
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export const Tooltip = {
  Default: DefaultTooltip,
  Provider: TooltipPrimitive.Provider,
};
