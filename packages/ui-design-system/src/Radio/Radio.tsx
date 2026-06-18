import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, forwardRef, type InputHTMLAttributes, useContext, useId } from 'react';

import { cn } from '../utils';

type RadioSize = 'regular' | 'small';

type RadioContextValue = {
  name: string;
  value: string;
  size: RadioSize;
  onChange: (value: string) => void;
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
export type RadioRootProps = VariantProps<typeof radioRoot> & {
  /** The currently selected value */
  value: string;
  /** Callback fired when the selected value changes */
  onValueChange: (value: string) => void;
  /** Radio items to render */
  children: React.ReactNode;
  /** Size shared by all items in this group */
  size?: RadioSize;
  /** Additional CSS classes */
  className?: string;
  /** HTML name attribute for the radio group (auto-generated if not provided) */
  name?: string;
};

export const RadioRoot = forwardRef<HTMLDivElement, RadioRootProps>(function RadioRoot(
  { className, value, onValueChange, children, name, size = 'regular', ...props },
  ref,
) {
  const generatedName = useId();
  const radioName = name ?? generatedName;

  return (
    <RadioContext.Provider value={{ name: radioName, value, size, onChange: onValueChange }}>
      <div {...props} ref={ref} role="radiogroup" className={cn(radioRoot(), className)}>
        {children}
      </div>
    </RadioContext.Provider>
  );
});

/**
 * Props for Radio.Item component.
 */
export type RadioItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'checked' | 'onChange' | 'size'
> & {
  /** The value of this radio option */
  value: string;
  /** Disable this individual radio item */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(function RadioItem(
  { className, value, disabled = false, ...props },
  ref,
) {
  const { name, size, value: selectedValue, onChange } = useRadioContext();
  const isChecked = selectedValue === value;

  const state = disabled ? (isChecked ? 'selected-disabled' : 'disabled') : isChecked ? 'selected' : 'unselected';

  return (
    <span className={cn(radioIndicator({ size, state }), className)}>
      {isChecked ? (
        <span
          className={radioInnerDot({
            size,
            state: disabled ? 'selected-disabled' : 'selected',
          })}
        />
      ) : null}
      <input
        {...props}
        ref={ref}
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className={cn('absolute inset-0 opacity-0', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      />
    </span>
  );
});

/**
 * A controlled radio group component using the compound component pattern.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState('option1');
 *
 * <Radio.Root value={selected} onValueChange={setSelected} size="regular">
 *   <label className="flex items-center gap-sm">
 *     <Radio.Item value="option1" />
 *     Option 1
 *   </label>
 *   <label className="flex items-center gap-sm">
 *     <Radio.Item value="option2" disabled />
 *     Option 2 (disabled)
 *   </label>
 * </Radio.Root>
 * ```
 */
export const Radio = {
  Root: RadioRoot,
  Item: RadioItem,
};
