import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ScrollArea } from '@ui-design-system';
import clsx from 'clsx';
import { forwardRef } from 'react';

const style = {
  content:
    'animate-slideUpAndFade bg-grey-00 border-grey-10 flex flex-col rounded border shadow-md will-change-[transform,opacity]',
};

const OperandDropdownMenuContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea.Root>
      <DropdownMenu.Content
        ref={ref}
        side="bottom"
        align="start"
        sideOffset={4}
        className={clsx(style.content, 'max-h-[320px] w-[320px]', className)}
        {...props}
      >
        {children}
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </DropdownMenu.Content>
    </ScrollArea.Root>
  );
});
OperandDropdownMenuContent.displayName = 'OperandDropdownMenuContent';

const OperandDropdownMenuSubTrigger = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.SubTrigger>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenu.SubTrigger
      ref={ref}
      className={clsx(
        'radix-highlighted:bg-purple-05 radix-state-open:bg-purple-05 rounded-sm outline-none transition-colors',
        className
      )}
      {...props}
    />
  );
});
OperandDropdownMenuSubTrigger.displayName = 'OperandDropdownMenuSubTrigger';

const OperandDropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.SubContent>
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea.Root>
      <DropdownMenu.SubContent
        ref={ref}
        sideOffset={16}
        className={clsx(style.content, 'max-h-[250px] w-[250px]', className)}
        {...props}
      >
        {children}
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </DropdownMenu.SubContent>
    </ScrollArea.Root>
  );
});
OperandDropdownMenuSubContent.displayName = 'OperandDropdownMenuSubContent';

export const OperandDropdownMenu = {
  Root: DropdownMenu.Root,
  ScrollableViewport: ScrollArea.Viewport,
  Trigger: DropdownMenu.Trigger,
  Portal: DropdownMenu.Portal,
  Content: OperandDropdownMenuContent,
  Sub: DropdownMenu.Sub,
  SubTrigger: OperandDropdownMenuSubTrigger,
  SubContent: OperandDropdownMenuSubContent,
};
