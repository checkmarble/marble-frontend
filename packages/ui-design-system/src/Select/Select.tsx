import {
  Content,
  Item,
  ItemText,
  Portal,
  type SelectTriggerProps as PrimitiveSelectTriggerProps,
  type SelectProps as RawSelectProps,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  type SelectContentProps,
  Icon as SelectIcon,
  type SelectItemProps,
  type SelectValueProps,
  type SelectViewportProps,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, ReactNode, useRef, useState } from 'react';
import { Icon, IconName } from 'ui-icons';
import { MenuCommand } from '../MenuCommand/MenuCommand';
import Tag from '../Tag/Tag';
import { cn } from '../utils';

function SelectContent({ children, className, ...props }: React.PropsWithChildren<SelectContentProps>) {
  return (
    <Portal>
      <Content
        className={clsx('bg-surface-card border-grey-border z-50 mt-2 rounded-sm border shadow-md', className)}
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

function SelectViewport({ children, className, ...props }: React.PropsWithChildren<SelectViewportProps>) {
  return (
    <Viewport className={clsx('flex flex-col gap-2 p-2', className)} {...props}>
      {children}
    </Viewport>
  );
}

export const selectTrigger = cva(
  'text-s text-grey-primary flex min-h-10 min-w-10 items-center justify-between border font-medium outline-hidden radix-state-open:border-purple-primary radix-state-open:text-purple-primary radix-disabled:border-grey-border radix-disabled:bg-grey-background radix-disabled:text-grey-secondary radix-placeholder:text-grey-disabled radix-placeholder:radix-state-open:text-grey-disabled',
  {
    variants: {
      backgroundColor: {
        enabled: 'bg-surface-card',
        disabled: 'bg-grey-background-light',
      },
      border: {
        square: 'gap-2 rounded-sm p-2',
        rounded: 'rounded-full p-2',
      },
      borderColor: {
        'greyfigma-90': 'border-grey-border focus:border-purple-primary',
        'redfigma-47': 'border-red-primary focus:border-purple-primary',
        'redfigma-87': 'border-red-secondary focus:border-purple-primary',
      },
    },
  },
);

export interface SelectTriggerProps extends PrimitiveSelectTriggerProps, VariantProps<typeof selectTrigger> {}

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
        'text-s rounded-xs p-2 font-medium outline-hidden',
        'radix-highlighted:bg-purple-background-light radix-highlighted:text-purple-primary',
        className,
      )}
      {...props}
    >
      {children}
    </Item>
  );
});

const SelectValue = forwardRef<HTMLDivElement, SelectValueProps & { align?: 'center' | 'start' }>(function SelectValue(
  { className, align = 'center', ...props },
  ref,
) {
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
});

const SelectArrow = () => (
  <SelectIcon className="group-radix-state-open:rotate-180 text-grey-primary size-6 shrink-0" asChild>
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
      <Select.Trigger ref={triggerRef} border={border} borderColor={borderColor} className={className}>
        <Select.Value placeholder={placeholder} />
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content
        className="z-50 max-h-60 min-w-(--radix-select-trigger-width)"
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
/**
 * @deprecated This Select component is deprecated and will be removed in a future release.
 * Please migrate to the new MenuCommand component as soon as possible.
 */
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

export type SelectOption<T> = {
  label: ReactNode | (() => ReactNode);
  value: T;
  rowValue?: string;
};

type SelectV2BaseProps<T, O extends SelectOption<T>> = {
  options: O[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
  displayedValue?: (option: O) => string;
  selectedIcon?: IconName;
  variant?: 'tag' | 'default';
  menuClassName?: string;
};

type SelectV2SingleProps<T, O extends SelectOption<T>> = SelectV2BaseProps<T, O> & {
  multiple?: false;
  value: T;
  onChange: (value: T) => void;
};

type SelectV2MultipleProps<T, O extends SelectOption<T>> = SelectV2BaseProps<T, O> & {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

export type SelectV2Props<T, O extends SelectOption<T> = SelectOption<T>> =
  | SelectV2SingleProps<T, O>
  | SelectV2MultipleProps<T, O>;

function renderOptionLabel<T, O extends SelectOption<T>>(option: O, displayedValue?: (option: O) => string): ReactNode {
  if (displayedValue) return displayedValue(option);
  return typeof option.label === 'function' ? option.label() : option.label;
}

export function SelectV2<T, O extends SelectOption<T> = SelectOption<T>>(props: SelectV2Props<T, O>) {
  const {
    options,
    placeholder,
    disabled,
    className,
    displayedValue,
    selectedIcon,
    variant = 'default',
    menuClassName,
  } = props;

  const [open, setOpen] = useState(false);
  const justSelectedRef = useRef(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (props.multiple && !newOpen && justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    setOpen(newOpen);
  };

  const isSelected = (optionValue: T): boolean => {
    if (props.multiple) return props.value.some((v) => v === optionValue);
    return props.value === optionValue;
  };

  const handleSelect = (optionValue: T) => {
    if (props.multiple) {
      justSelectedRef.current = true;
      const current = props.value;
      const next = current.some((v) => v === optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      props.onChange(next);
    } else {
      props.onChange(optionValue);
    }
  };

  const selectedOptions = props.multiple ? options.filter((o) => props.value.some((v) => v === o.value)) : null;

  const singleValueLabel = !props.multiple
    ? (() => {
        const currentOption = options.find((o) => o.value === props.value);
        return currentOption ? renderOptionLabel(currentOption, displayedValue) : placeholder;
      })()
    : null;

  const renderTriggerContent = () => {
    if (props.multiple && selectedOptions && selectedOptions.length > 0) {
      return (
        <span className="flex flex-wrap gap-1">
          {selectedOptions.map((opt, i) => (
            <Tag key={i} color="grey" size="small">
              {renderOptionLabel(opt, displayedValue)}
            </Tag>
          ))}
        </span>
      );
    }
    return <span>{singleValueLabel ?? placeholder}</span>;
  };

  return (
    <MenuCommand.Menu open={open} onOpenChange={handleOpenChange}>
      <MenuCommand.Trigger>
        {variant === 'default' ? (
          <MenuCommand.SelectButton disabled={disabled} className={className}>
            {renderTriggerContent()}
          </MenuCommand.SelectButton>
        ) : (
          <button disabled={disabled} className={cn('flex gap-v2-xxs items-center', className)}>
            {props.multiple && selectedOptions && selectedOptions.length > 0 ? (
              <Tag color="purple">
                <span className="flex items-center">
                  {selectedOptions.map((opt, i) => (
                    <span key={i}>
                      {i > 0 ? ', ' : ''}
                      {renderOptionLabel(opt, displayedValue)}
                    </span>
                  ))}
                </span>
                <Icon icon="caret-down" className="size-4" />
              </Tag>
            ) : (
              <Tag color="purple">
                <span>{singleValueLabel ?? placeholder}</span>
                <Icon icon="caret-down" className="size-4" />
              </Tag>
            )}
          </button>
        )}
      </MenuCommand.Trigger>
      <MenuCommand.Content
        align="start"
        sameWidth
        sideOffset={4}
        size={variant === 'tag' ? 'small' : undefined}
        className={menuClassName}
      >
        <MenuCommand.List>
          {options.map((option, idx) => {
            const isPrimitiveValue = ['number', 'string', 'bool'].includes(typeof option.value);
            const itemValue =
              option.rowValue !== undefined ? option.rowValue : isPrimitiveValue ? String(option.value) : undefined;

            return (
              <MenuCommand.Item
                key={idx}
                onSelect={() => handleSelect(option.value)}
                className="group-[[data-size='small']]/menu-command-content:h-6"
                value={itemValue}
              >
                <span>{typeof option.label === 'function' ? option.label() : option.label}</span>
                {isSelected(option.value) && (
                  <Icon icon={selectedIcon ?? 'tick'} className="size-5 text-purple-primary" />
                )}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
