import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Select as RadixSelect } from 'radix-ui';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

function SelectContent({
  children,
  className,
  ...props
}: React.PropsWithChildren<RadixSelect.SelectContentProps>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={clsx(
          'bg-grey-100 border-grey-90 z-50 mt-2 rounded-sm border shadow-md',
          className,
        )}
        position="popper"
        {...props}
      >
        <RadixSelect.ScrollUpButton className="flex h-6 justify-center">
          <Icon icon="arrow-2-up" />
        </RadixSelect.ScrollUpButton>
        {children}
        <RadixSelect.ScrollDownButton className="flex h-6 justify-center">
          <Icon icon="arrow-2-down" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

function SelectViewport({
  children,
  className,
  ...props
}: React.PropsWithChildren<RadixSelect.SelectViewportProps>) {
  return (
    <RadixSelect.Viewport className={clsx('flex flex-col gap-2 p-2', className)} {...props}>
      {children}
    </RadixSelect.Viewport>
  );
}

export const selectTrigger = cva(
  'text-s text-grey-00 flex min-h-10 min-w-10 items-center justify-between border font-medium outline-hidden radix-state-open:border-purple-65 radix-state-open:text-purple-65 radix-disabled:border-grey-90 radix-disabled:bg-grey-95 radix-disabled:text-grey-50 radix-placeholder:text-grey-80 radix-placeholder:radix-state-open:text-grey-80',
  {
    variants: {
      backgroundColor: {
        enabled: 'bg-grey-100',
        disabled: 'bg-grey-98',
      },
      border: {
        square: 'gap-2 rounded-sm p-2',
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
  extends RadixSelect.SelectTriggerProps,
    VariantProps<typeof selectTrigger> {}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { children, className, border = 'square', borderColor = 'greyfigma-90', disabled, ...props },
  ref,
) {
  return (
    <RadixSelect.Trigger
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
    </RadixSelect.Trigger>
  );
});

const SelectItem = forwardRef<HTMLDivElement, RadixSelect.SelectItemProps>(function SelectItem(
  { children, className, ...props },
  ref,
) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={clsx(
        'text-s rounded-xs p-2 font-medium outline-hidden',
        'radix-highlighted:bg-purple-98 radix-highlighted:text-purple-65',
        className,
      )}
      {...props}
    >
      {children}
    </RadixSelect.Item>
  );
});

const SelectValue = forwardRef<
  HTMLDivElement,
  RadixSelect.SelectValueProps & { align?: 'center' | 'start' }
>(function SelectValue({ className, align = 'center', ...props }, ref) {
  return (
    <span
      className={clsx(
        'w-full group-data-[border=rounded]/trigger:px-2',
        { 'text-center': align === 'center', 'text-start': align === 'start' },
        className,
      )}
    >
      <RadixSelect.Value ref={ref} {...props} />
    </span>
  );
});

const SelectArrow = () => (
  <RadixSelect.Icon
    className="group-radix-state-open:rotate-180 text-grey-00 size-6 shrink-0"
    asChild
  >
    <Icon icon="arrow-2-down" />
  </RadixSelect.Icon>
);

export type SelectProps = RadixSelect.SelectProps &
  Pick<RadixSelect.SelectValueProps, 'placeholder'> &
  Pick<SelectTriggerProps, 'border' | 'borderColor' | 'className'>;

const SelectDefault = forwardRef<HTMLButtonElement, SelectProps>(function SelectDefault(
  { children, placeholder, border, borderColor, className, ...props },
  triggerRef,
) {
  return (
    <RadixSelect.Root {...props}>
      <RadixSelect.Trigger
        ref={triggerRef}
        data-border={border}
        data-border-color={borderColor}
        className={className}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Arrow />
      </RadixSelect.Trigger>
      <RadixSelect.Content
        className="z-50 max-h-60 min-w-(--radix-select-trigger-width)"
        align={border === 'rounded' ? 'center' : 'start'}
      >
        <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Root>
  );
});

const SelectDefaultItem = forwardRef<HTMLDivElement, RadixSelect.SelectItemProps>(
  function SelectDefaultItem({ children, className, ...props }, ref) {
    return (
      <RadixSelect.Item ref={ref} className={clsx('min-h-10', className)} {...props}>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  },
);
/**
 * @deprecated This Select component is deprecated and will be removed in a future release.
 * Please migrate to the new MenuCommand component as soon as possible.
 */
export const Select = {
  Default: SelectDefault,
  Root: RadixSelect.Root,
  Trigger: SelectTrigger,
  Arrow: SelectArrow,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  DefaultItem: SelectDefaultItem,
  ItemText: RadixSelect.ItemText,
  Value: SelectValue,
};
