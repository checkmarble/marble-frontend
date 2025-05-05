import {
  Content,
  Icon as SelectIcon,
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
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

function SelectContent({
  children,
  className,
  ...props
}: React.PropsWithChildren<SelectContentProps>) {
  return (
    <Portal>
      <Content
        className={clsx('bg-grey-100 border-grey-90 z-50 mt-2 rounded border shadow-md', className)}
        position="popper"
        {...props}
      >
        <ScrollUpButton className="flex h-6 justify-center">
          <Icon icon="arrow-2-up" />
        </ScrollUpButton>
        {children}
        <ScrollDownButton className="flex h-6 justify-center">
          <Icon icon="arrow-2-down" />
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

export const selectTrigger = cva(
  'text-s text-grey-00 flex min-h-10 min-w-10 items-center justify-between border font-medium outline-none radix-state-open:border-purple-65 radix-state-open:text-purple-65 radix-disabled:border-grey-90 radix-disabled:bg-grey-95 radix-disabled:text-grey-50 radix-placeholder:text-grey-80 radix-placeholder:radix-state-open:text-grey-80',
  {
    variants: {
      backgroundColor: {
        enabled: 'bg-grey-100',
        disabled: 'bg-grey-98',
      },
      border: {
        square: 'gap-2 rounded p-2',
        rounded: 'rounded-full p-2',
      },
      borderColor: {
        'greyfigma-90': 'border-grey-90 focus:border-purple-65',
        'redfigma-47': 'border-red-47 focus:border-purple-65',
        'redfigma-87': 'border-red-87 focus:border-purple-65',
      },
    },
  },
);

export interface SelectTriggerProps
  extends PrimitiveSelectTriggerProps,
    VariantProps<typeof selectTrigger> {}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { children, className, border = 'square', borderColor = 'greyfigma-90', disabled, ...props },
  ref,
) {
  return (
    <Trigger
      ref={ref}
      data-border={border}
      data-border-color={borderColor}
      className={clsx(
        'group',
        selectTrigger({
          border,
          borderColor,
          backgroundColor: disabled ? 'disabled' : 'enabled',
        }),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Trigger>
  );
});

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { children, className, ...props },
  ref,
) {
  return (
    <Item
      ref={ref}
      className={clsx(
        'text-s rounded-sm p-2 font-medium outline-none',
        'radix-highlighted:bg-purple-98 radix-highlighted:text-purple-65',
        className,
      )}
      {...props}
    >
      {children}
    </Item>
  );
});

const SelectValue = forwardRef<HTMLDivElement, SelectValueProps & { align?: 'center' | 'start' }>(
  function SelectValue({ className, align = 'center', ...props }, ref) {
    return (
      <span
        className={clsx(
          'w-full group-data-[border=rounded]/trigger:px-2',
          { 'text-center': align === 'center', 'text-start': align === 'start' },
          className,
        )}
      >
        <Value ref={ref} {...props} />
      </span>
    );
  },
);

const SelectArrow = () => (
  <SelectIcon className="group-radix-state-open:rotate-180 text-grey-00 size-6 shrink-0" asChild>
    <Icon icon="arrow-2-down" />
  </SelectIcon>
);

export type SelectProps = RawSelectProps &
  Pick<SelectValueProps, 'placeholder'> &
  Pick<SelectTriggerProps, 'border' | 'borderColor' | 'className'>;

const SelectDefault = forwardRef<HTMLButtonElement, SelectProps>(function SelectDefault(
  { children, placeholder, border, borderColor, className, ...props },
  triggerRef,
) {
  return (
    <Root {...props}>
      <Select.Trigger
        ref={triggerRef}
        border={border}
        borderColor={borderColor}
        className={className}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content
        className="z-50 max-h-60 min-w-[var(--radix-select-trigger-width)]"
        align={border === 'rounded' ? 'center' : 'start'}
      >
        <Select.Viewport>{children}</Select.Viewport>
      </Select.Content>
    </Root>
  );
});

const SelectDefaultItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectDefaultItem(
  { children, className, ...props },
  ref,
) {
  return (
    <SelectItem ref={ref} className={clsx('min-h-10', className)} {...props}>
      <Select.ItemText>{children}</Select.ItemText>
    </SelectItem>
  );
});

export const Select = {
  Default: SelectDefault,
  Root,
  Trigger: SelectTrigger,
  Arrow: SelectArrow,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  DefaultItem: SelectDefaultItem,
  ItemText,
  Value: SelectValue,
};
