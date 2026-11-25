import { cva, type VariantProps } from 'class-variance-authority';
import { isValidElement, ReactNode, useRef, useState } from 'react';
import { isNullish } from 'remeda';
import { Icon, IconName } from 'ui-icons';
import { ExpandableGroupTagLine } from '../ExpandableGroupTagLine/ExpandableGroupTagLine';
import { MenuCommand } from '../MenuCommand/MenuCommand';
import Tag from '../Tag/Tag';
import { cn } from '../utils';

export const selectTrigger = cva(
  'text-s text-grey-primary flex min-h-10 min-w-10 items-center justify-between border font-medium outline-hidden radix-state-open:border-purple-primary radix-state-open:text-purple-primary radix-disabled:border-grey-border radix-disabled:bg-grey-background radix-disabled:text-grey-secondary radix-placeholder:text-grey-disabled radix-placeholder:radix-state-open:text-grey-disabled',
  {
    variants: {
      backgroundColor: {
        enabled: 'bg-surface-card',
        disabled: 'bg-grey-background-light',
      },
      border: {
        square: 'gap-sm rounded-sm p-sm',
        rounded: 'rounded-full p-sm',
      },
      borderColor: {
        'greyfigma-90': 'border-grey-border focus:border-purple-primary',
        'redfigma-47': 'border-red-primary focus:border-purple-primary',
        'redfigma-87': 'border-red-secondary focus:border-purple-primary',
      },
    },
  },
);

export type SelectTriggerProps = VariantProps<typeof selectTrigger>;

export type SelectOption<T> = {
  label: ReactNode | (() => ReactNode);
  value: T;
  rowValue?: string;
  disabled?: boolean;
};

type SelectV2BaseProps<T, O extends SelectOption<T>> = {
  placeholder: string;
  options: O[];
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  displayedValue?: (option: O) => ReactNode;
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

function renderOptionLabel<T, O extends SelectOption<T>>(
  option: O,
  displayedValue?: (option: O) => ReactNode,
): ReactNode {
  if (displayedValue) return displayedValue(option);
  return typeof option.label === 'function' ? option.label() : option.label;
}

function getNodeText(node: ReactNode): string | null {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    const text = node.map(getNodeText).filter(Boolean).join('');
    return text.length > 0 ? text : null;
  }
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children);
  return null;
}

export function SelectV2<T, O extends SelectOption<T> = SelectOption<T>>(
  props: SelectV2Props<T, O> & { ref?: React.Ref<HTMLButtonElement> },
) {
  const {
    ref,
    size,
    options,
    placeholder,
    disabled,
    readOnly,
    className,
    displayedValue,
    selectedIcon,
    variant = 'default',
    menuClassName,
    'aria-label': ariaLabel,
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

  const isPlaceholderShown = props.multiple ? props.value.length === 0 : isNullish(props.value);
  const renderTriggerContent = () => {
    if (props.multiple && selectedOptions && selectedOptions.length > 0) {
      return (
        <ExpandableGroupTagLine
          classname="gap-xs"
          overflowBehavior="popover"
          items={selectedOptions.map((opt, i) => (
            <Tag key={i} color="grey" size="small" className="max-w-full">
              {renderOptionLabel(opt, displayedValue)}
            </Tag>
          ))}
        />
      );
    }
    return <span>{singleValueLabel ?? placeholder}</span>;
  };

  const triggerAccessibleName =
    ariaLabel ??
    (props.multiple
      ? (selectedOptions
          ?.map((option) => getNodeText(renderOptionLabel(option, displayedValue)))
          .filter(Boolean)
          .join(', ') ??
          '') ||
        placeholder
      : (getNodeText(singleValueLabel) ?? placeholder));

  return (
    <MenuCommand.Menu open={open} onOpenChange={handleOpenChange}>
      <MenuCommand.Trigger>
        {variant === 'default' ? (
          <MenuCommand.SelectButton
            size={size}
            role="combobox"
            aria-label={triggerAccessibleName}
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(props.multiple && 'min-w-0 overflow-hidden', className)}
            {...(isPlaceholderShown ? { 'data-placeholder-shown': true } : {})}
          >
            {renderTriggerContent()}
          </MenuCommand.SelectButton>
        ) : (
          <button
            ref={ref}
            aria-label={triggerAccessibleName}
            disabled={disabled}
            className={cn('flex gap-2xs items-center', className)}
          >
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
                role="option"
                key={idx}
                disabled={option.disabled}
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
