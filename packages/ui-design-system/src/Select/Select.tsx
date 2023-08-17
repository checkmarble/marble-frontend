import {
  Content,
  Icon,
  Item,
  ItemText,
  Portal,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  type SelectContentProps,
  type SelectItemProps,
  type SelectProps as RawSelectProps,
  type SelectTriggerProps as PrimitiveSelectTriggerProps,
  type SelectValueProps,
  type SelectViewportProps,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select';
import { Arrow2Down, Arrow2Up, SmallarrowDown } from '@ui-icons';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { type tagBorder } from './Select.constants';

function SelectContent({
  children,
  className,
  ...props
}: React.PropsWithChildren<SelectContentProps>) {
  return (
    <Portal>
      <Content
        className={clsx(
          'bg-grey-00 border-grey-10 mt-2 rounded border shadow-md',
          className
        )}
        position="popper"
        {...props}
      >
        <ScrollUpButton className="flex justify-center">
          <Arrow2Up />
        </ScrollUpButton>
        {children}
        <ScrollDownButton className="flex justify-center">
          <Arrow2Down />
        </ScrollDownButton>
      </Content>
    </Portal>
  );
}

function SelectViewport({
  children,
  className,
  ...props
}: React.PropsWithChildren<SelectViewportProps>) {
  return (
    <Viewport className={clsx('flex flex-col gap-2 p-2', className)} {...props}>
      {children}
    </Viewport>
  );
}

export interface SelectTriggerProps extends PrimitiveSelectTriggerProps {
  border?: (typeof tagBorder)[number];
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, border = 'square', ...props }, ref) => {
    return (
      <Trigger
        ref={ref}
        className={clsx(
          'bg-grey-00 border-grey-10 text-s text-grey-100 group flex h-10 items-center justify-between border font-medium outline-none',
          'radix-state-open:border-purple-100 radix-state-open:text-purple-100 focus:border-purple-100',
          'radix-disabled:border-grey-10 radix-disabled:bg-grey-05 radix-disabled:text-grey-50',
          {
            'rounded px-2': border === 'square',
            'rounded-full pl-4 pr-2': border === 'rounded',
          },
          className
        )}
        {...props}
      >
        {children}
        <Icon className="group-radix-state-open:rotate-180">
          <SmallarrowDown height="24px" width="24px" />
        </Icon>
      </Trigger>
    );
  }
);

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Item
        ref={ref}
        className={clsx(
          'text-color text-s rounded-sm p-2 font-medium outline-none',
          'radix-highlighted:bg-purple-05 radix-highlighted:text-purple-100',
          className
        )}
        {...props}
      >
        {children}
      </Item>
    );
  }
);

export type SelectProps = RawSelectProps &
  Pick<SelectValueProps, 'placeholder'> &
  Pick<SelectTriggerProps, 'border' | 'className'>;

const SelectDefault = forwardRef<HTMLButtonElement, SelectProps>(
  ({ children, placeholder, border, className, ...props }, triggerRef) => {
    return (
      <Root {...props}>
        <Select.Trigger ref={triggerRef} border={border} className={className}>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content
          className="max-h-60"
          align={border === 'rounded' ? 'center' : 'start'}
        >
          <Select.Viewport>{children}</Select.Viewport>
        </Select.Content>
      </Root>
    );
  }
);

const SelectDefaultItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <SelectItem ref={ref} className={clsx('h-10', className)} {...props}>
        <Select.ItemText>{children}</Select.ItemText>
      </SelectItem>
    );
  }
);

export const Select = {
  Default: SelectDefault,
  Root,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  DefaultItem: SelectDefaultItem,
  ItemText,
  Value,
};
