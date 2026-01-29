import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, forwardRef, type InputHTMLAttributes, useContext, useId } from 'react';

import { cn } from '../utils';

// Context for Radio group
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

// Root component
const radioRoot = cva(['flex flex-col gap-2']);

export type RadioRootProps = VariantProps<typeof radioRoot> & {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
};

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

// Item component
export type RadioItemProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'checked' | 'onChange'> & {
  value: string;
  className?: string;
};

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
        isChecked && 'border-[4px]',
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

export const Radio = {
  Root: RadioRoot,
  Item: RadioItem,
};
