import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';
import { cn } from '../utils';

const Command = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive>>;
}) => (
  <CommandPrimitive
    ref={ref}
    className={cn('bg-surface-card border-grey-border flex flex-col overflow-hidden rounded-sm border p-sm', className)}
    {...props}
  />
);

const CommandInput = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Input>>;
}) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      'placeholder:text-grey-secondary text-s bg-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
);

const CommandList = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.List>>;
}) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
);

const CommandEmpty = ({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Empty>>;
}) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="text-grey-disabled inline-flex items-center gap-sm p-sm text-xs"
    {...props}
  />
);

const CommandGroup = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Group>>;
}) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'text-grey-secondary [&_[cmdk-group-heading]]:text-grey-secondary overflow-hidden p-xs [&_[cmdk-group-heading]]:px-xs [&_[cmdk-group-heading]]:py-xs [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
      className,
    )}
    {...props}
  />
);

const CommandSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Separator>>;
}) => <CommandPrimitive.Separator ref={ref} className={cn('bg-grey-border h-px', className)} {...props} />;

const CommandItem = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Item>>;
}) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'text-s relative flex cursor-pointer select-none items-center gap-sm rounded-xs px-xs py-xs outline-hidden data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className,
    )}
    {...props}
  />
);

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('text-grey-disabled ms-auto text-xs tracking-widest', className)} {...props} />
);

CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
