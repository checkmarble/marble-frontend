import React from 'react';
import type {
  TooltipProps,
  TooltipContentProps,
} from '@radix-ui/react-tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import clsx from 'clsx';

interface DefaultTooltipProps
  extends Pick<TooltipProps, 'open' | 'defaultOpen' | 'onOpenChange'>,
    TooltipContentProps {
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
      <TooltipPrimitive.Content
        side="top"
        align="center"
        className={clsx('bg-grey-00 rounded p-2 drop-shadow', className)}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          className="fill-grey-00"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}

export const Tooltip = {
  Default: DefaultTooltip,
  Provider: TooltipPrimitive.Provider,
};
