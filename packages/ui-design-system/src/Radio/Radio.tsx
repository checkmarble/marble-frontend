import { Indicator, Item, Root } from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, createContext, useContext, useId } from 'react';

import { cn } from '../utils';

type RadioSize = 'regular' | 'small';

type RadioContextValue = {
  value: string;
  size: RadioSize;
  disabled: boolean;
};

const RadioContext = createContext<RadioContextValue | null>(null);

function useRadioContext() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('Radio.Item must be used within Radio.Root');
  }
  return context;
}

const radioRoot = cva(['flex flex-col gap-sm']);

const radioIndicator = cva(
  ['group/radio relative flex shrink-0 items-center justify-center rounded-full border transition-colors'],
  {
    variants: {
      size: {
        regular: 'size-6',
        small: 'size-4',
      },
      state: {
        unselected: [
          'cursor-pointer border-purple-primary bg-grey-white',
          'hover:bg-purple-background',
          'dark:bg-grey-background dark:hover:border-purple-hover dark:hover:bg-grey-background',
        ],
        selected: [
          'cursor-pointer border-purple-primary bg-grey-white',
          'hover:border-purple-hover',
          'dark:bg-grey-background',
        ],
        disabled: [
          'cursor-not-allowed border-grey-border bg-grey-background border-[0.5px]',
          'dark:border-purple-disabled dark:bg-grey-background',
        ],
        'selected-disabled': [
          'cursor-not-allowed border-grey-disabled bg-grey-white',
          'dark:border-purple-disabled dark:bg-grey-background',
        ],
      },
    },
    compoundVariants: [
      { size: 'regular', state: 'selected', class: 'border-[3.5px]' },
      { size: 'regular', state: 'selected-disabled', class: 'border-[3.5px]' },
      { size: 'small', state: 'selected', class: 'border-[2.5px]' },
      { size: 'small', state: 'selected-disabled', class: 'border-[2.5px]' },
    ],
    defaultVariants: { size: 'regular', state: 'unselected' },
  },
);

const radioInnerDot = cva(['rounded-full'], {
  variants: {
    size: {
      regular: 'size-2.5',
      small: 'size-1.5',
    },
    state: {
      selected: 'bg-purple-primary transition-colors group-hover/radio:bg-purple-hover',
      'selected-disabled': 'bg-grey-disabled dark:bg-purple-disabled',
    },
  },
  defaultVariants: { size: 'regular', state: 'selected' },
});

/**
 * Props for Radio.Root component.
 */
export type RadioRootProps = Omit<ComponentPropsWithoutRef<typeof Root>, 'value' | 'onValueChange' | 'asChild'> &
  VariantProps<typeof radioRoot> & {
    /** The currently selected value */
    value: string;
    /** Callback fired when the selected value changes */
    onValueChange: (value: string) => void;
    /** Size shared by all items in this group */
    size?: RadioSize;
  };

export const RadioRoot = function RadioRoot({
  ref,
  className,
  value,
  onValueChange,
  children,
  name,
  size = 'regular',
  disabled = false,
  ...props
}: RadioRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const generatedName = useId();

  return (
    <RadioContext.Provider value={{ value, size, disabled }}>
      <Root
        {...props}
        ref={ref}
        name={name ?? generatedName}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(radioRoot(), className)}
      >
        {children}
      </Root>
    </RadioContext.Provider>
  );
};

/**
 * Props for Radio.Item component.
 *
 * Radix renders the item as a `<button role="radio">`, so the item's label
 * belongs inside it as children rather than in a wrapping `<label>`.
 */
export type RadioItemProps = Omit<ComponentPropsWithoutRef<typeof Item>, 'asChild'>;

export const RadioItem = function RadioItem({
  ref,
  className,
  value,
  disabled = false,
  children,
  ...props
}: RadioItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { size, value: selectedValue, disabled: groupDisabled } = useRadioContext();
  const isChecked = selectedValue === value;
  const isDisabled = disabled || groupDisabled;

  const state = isDisabled ? (isChecked ? 'selected-disabled' : 'disabled') : isChecked ? 'selected' : 'unselected';

  return (
    <Item
      {...props}
      ref={ref}
      value={value}
      disabled={isDisabled}
      className={cn(
        'flex items-center gap-sm text-left',
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <span className={radioIndicator({ size, state })}>
        <Indicator className={radioInnerDot({ size, state: isDisabled ? 'selected-disabled' : 'selected' })} />
      </span>
      {children}
    </Item>
  );
};

/**
 * A controlled radio group component using the compound component pattern,
 * built on Radix UI primitives.
 *
 * **When to use Radio vs RadioGroup:**
 * - Use `Radio` for standard form radio buttons with circular indicators
 * - Use `RadioGroup` for tab-like selection with filled background styling
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState('option1');
 *
 * <Radio.Root value={selected} onValueChange={setSelected} size="regular">
 *   <Radio.Item value="option1">Option 1</Radio.Item>
 *   <Radio.Item value="option2" disabled>
 *     Option 2 (disabled)
 *   </Radio.Item>
 * </Radio.Root>
 * ```
 */
export const Radio = {
  Root: RadioRoot,
  Item: RadioItem,
};
