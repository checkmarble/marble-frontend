import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, forwardRef, type InputHTMLAttributes, useContext, useId } from 'react';

import { cn } from '../utils';

type RadioContextValue = {
  name: string;
  value: string;
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

const radioRoot = cva(['flex flex-col gap-2']);

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
  /** Additional CSS classes */
  className?: string;
  /** HTML name attribute for the radio group (auto-generated if not provided) */
  name?: string;
};

/**
 * Root container for a radio group. Provides context to Radio.Item children.
 *
 * @example
 * ```tsx
 * <Radio.Root value={selected} onValueChange={setSelected}>
 *   <label className="flex items-center gap-2">
 *     <Radio.Item value="option1" />
 *     Option 1
 *   </label>
 *   <label className="flex items-center gap-2">
 *     <Radio.Item value="option2" />
 *     Option 2
 *   </label>
 * </Radio.Root>
 * ```
 */
export const RadioRoot = forwardRef<HTMLDivElement, RadioRootProps>(function RadioRoot(
  { className, value, onValueChange, children, name, ...props },
  ref,
) {
  const generatedName = useId();
  const radioName = name ?? generatedName;

  return (
    <RadioContext.Provider value={{ name: radioName, value, onChange: onValueChange }}>
      <div {...props} ref={ref} role="radiogroup" className={cn(radioRoot(), className)}>
        {children}
      </div>
    </RadioContext.Provider>
  );
});

/**
 * Props for Radio.Item component.
 */
export type RadioItemProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'checked' | 'onChange'> & {
  /** The value of this radio option */
  value: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Individual radio button item. Must be used within Radio.Root.
 * Renders as a circular indicator with native input for accessibility.
 */
export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(function RadioItem(
  { className, value, ...props },
  ref,
) {
  const { name, value: selectedValue, onChange } = useRadioContext();
  const isChecked = selectedValue === value;

  return (
    <span
      className={cn(
        'relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors',
        'border-purple-primary bg-white dark:bg-transparent',
        isChecked && 'border-[2px]',
        className,
      )}
    >
      {isChecked && <span className="size-3 rounded-full bg-purple-primary" />}
      <input
        {...props}
        ref={ref}
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </span>
  );
});

/**
 * A controlled radio group component using the compound component pattern.
 *
 * **When to use Radio vs RadioGroup:**
 * - Use `Radio` for standard form radio buttons with circular indicators
 * - Use `RadioGroup` for tab-like selection with filled background styling
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState('option1');
 *
 * <Radio.Root value={selected} onValueChange={setSelected}>
 *   <label className="flex items-center gap-2">
 *     <Radio.Item value="option1" />
 *     Option 1
 *   </label>
 *   <label className="flex items-center gap-2">
 *     <Radio.Item value="option2" />
 *     Option 2
 *   </label>
 * </Radio.Root>
 * ```
 */
export const Radio = {
  Root: RadioRoot,
  Item: RadioItem,
};
