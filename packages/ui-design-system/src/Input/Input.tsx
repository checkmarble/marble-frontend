import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef, KeyboardEvent, useEffect, useState } from 'react';
import { Icon, type IconName } from 'ui-icons';
import { cn } from '../utils';

export const inputClassName = cva(
  [
    'peer min-w-10 size-full rounded-md text-small font-medium outline-hidden border',
    // Light mode
    'bg-surface-card text-grey-primary placeholder:text-grey-placeholder data-[placeholder-shown]:text-grey-placeholder disabled:bg-grey-background disabled:text-grey-disabled is-[input]:read-only:bg-grey-background-light data-[read-only]:bg-grey-background-light focus:not-data-[read-only]:border-purple-primary focus:is-[input]:not-read-only:border-purple-primary',
    // Dark mode
    'dark:bg-transparent dark:text-grey-primary dark:disabled:bg-transparent',
  ],
  {
    variants: {
      borderColor: {
        'greyfigma-90': 'border-grey-border dark:border-grey-border',
        'redfigma-87': 'border-red-secondary',
        'redfigma-47': 'border-red-primary',
      },
      size: {
        small: 'h-6 px-xs py-2xs',
        medium: 'h-8 p-sm',
        large: 'h-10 p-sm',
      },
    },
    defaultVariants: {
      borderColor: 'greyfigma-90',
      size: 'large',
    },
  },
);

export const inputPaddingsClassName = cva('', {
  variants: {
    size: {
      small: '',
      medium: '',
      large: '',
    },
    hasStartIcon: {
      true: '',
      false: null,
    },
    hasEndIcon: {
      true: '',
      false: null,
    },
  },
  compoundVariants: [
    {
      hasStartIcon: true,
      size: 'small',
      className: 'ps-6',
    },
    {
      hasStartIcon: true,
      size: 'medium',
      className: 'ps-8',
    },
    {
      hasStartIcon: true,
      size: 'large',
      className: 'ps-8',
    },
    {
      hasEndIcon: true,
      size: 'small',
      className: 'pe-6',
    },
    {
      hasEndIcon: true,
      size: 'medium',
      className: 'pe-8',
    },
    {
      hasEndIcon: true,
      size: 'large',
      className: 'pe-8',
    },
  ],
  defaultVariants: {
    hasStartIcon: false,
    hasEndIcon: false,
  },
});

export const inputIconClassName = cva('absolute shrink-0 text-grey-secondary peer-focus:text-grey-primary', {
  variants: {
    inputSize: {
      small: 'size-4 top-1',
      medium: 'size-4 top-2',
      large: 'size-4 top-3',
    },
    placement: {
      start: '',
      end: '',
    },
  },
  compoundVariants: [
    {
      placement: 'start',
      inputSize: 'small',
      className: 'start-xs ms-px',
    },
    {
      placement: 'start',
      inputSize: 'medium',
      className: 'start-sm mx-px',
    },
    {
      placement: 'start',
      inputSize: 'large',
      className: 'start-sm ms-px',
    },
    {
      placement: 'end',
      inputSize: 'small',
      className: 'end-xs me-px',
    },
    {
      placement: 'end',
      inputSize: 'medium',
      className: 'end-sm me-px',
    },
    {
      placement: 'end',
      inputSize: 'large',
      className: 'end-sm me-px',
    },
  ],
  defaultVariants: {
    inputSize: 'large',
  },
});

export type BaseInputProps = React.ComponentPropsWithoutRef<'input'> & {
  enablePasswordManagers?: boolean;
};

export const UnstyledInput = forwardRef<HTMLInputElement, BaseInputProps>(function UnstyledInput(
  { enablePasswordManagers, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      {...(!enablePasswordManagers && {
        'data-1p-ignore': 'true', // 1password
        'data-lpignore': 'true', // lastpass
        'data-bwignore': 'true', // bitwarden
        'data-form-type': 'other', // used by dashlane, tells it to ignore this field for password saving
      })}
    />
  );
});

export type InputProps = Omit<BaseInputProps, 'size'> &
  VariantProps<typeof inputClassName> & {
    startAdornment?: IconName;
    endAdornment?: IconName;
    onEnterKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onStartAdornmentClick?: () => void;
    onEndAdornmentClick?: () => void;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    startAdornment,
    endAdornment,
    size = 'large',
    borderColor = 'greyfigma-90',
    onEnterKeyDown,
    onStartAdornmentClick,
    onEndAdornmentClick,
    ...props
  },
  ref,
) {
  const startIconClassName = cn(inputIconClassName({ inputSize: size, placement: 'start' }));
  const endIconClassName = cn(inputIconClassName({ inputSize: size, placement: 'end' }));

  return (
    <div className={cn('relative', className)}>
      <UnstyledInput
        ref={ref}
        className={cn(
          inputClassName({ borderColor, size }),
          inputPaddingsClassName({ hasStartIcon: !!startAdornment, hasEndIcon: !!endAdornment, size }),
        )}
        // className="order-2 h-4 grow outline-none placeholder:text-grey-disabled"
        {...props}
        onKeyDown={
          onEnterKeyDown || props.onKeyDown
            ? (e) => {
                if (e.key === 'Enter' && onEnterKeyDown) {
                  onEnterKeyDown(e);
                  return;
                }
                if (props.onKeyDown) {
                  props.onKeyDown(e);
                }
              }
            : undefined
        }
      />
      {/* Order matter, for peer to work */}
      {startAdornment ? (
        onStartAdornmentClick ? (
          <button
            type="button"
            disabled={props.disabled || props.readOnly}
            className={cn(startIconClassName, 'cursor-pointer')}
            onClick={onStartAdornmentClick}
          >
            <Icon icon={startAdornment} className="size-full" />
          </button>
        ) : (
          <Icon icon={startAdornment} className={cn('pointer-events-none', startIconClassName)} />
        )
      ) : null}
      {endAdornment ? (
        onEndAdornmentClick ? (
          <button
            type="button"
            disabled={props.disabled || props.readOnly}
            className={cn(endIconClassName, 'cursor-pointer')}
            onClick={onEndAdornmentClick}
          >
            <Icon icon={endAdornment} className="size-full" />
          </button>
        ) : (
          <Icon icon={endAdornment} className={cn('pointer-events-none', endIconClassName)} />
        )
      ) : null}
    </div>
  );
});

type NumberInputProps = Omit<InputProps, 'onChange' | 'value' | 'onEnterKeyDown'> & {
  value: number;
  onChange: (value: number) => void;
  onEnterKeyDown?: (value: number) => void;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { onChange, value, onEnterKeyDown, ...props },
  ref,
) {
  const [internalValue, setInternalValue] = useState(value.toString(10));

  useEffect(() => {
    let newInternalValue = value.toString(10);
    if (newInternalValue !== internalValue) {
      setInternalValue(newInternalValue);
    }
  }, [value]);

  return (
    <Input
      ref={ref}
      {...props}
      value={internalValue}
      onChange={(e) => {
        const inputValue = e.target.value;
        setInternalValue(inputValue);

        const inputNumberValue = parseInt(inputValue, 10);
        if (!isNaN(inputNumberValue)) {
          onChange(inputNumberValue);
        }
      }}
      onEnterKeyDown={
        onEnterKeyDown
          ? (e) => {
              const inputNumberValue = parseInt(internalValue, 10);
              if (!isNaN(inputNumberValue)) {
                onEnterKeyDown(inputNumberValue);
              }
            }
          : undefined
      }
    />
  );
});

type SearchInputProps = Omit<
  InputProps,
  | 'onChange'
  | 'value'
  | 'startAdornment'
  | 'endAdornment'
  | 'onEnterKeyDown'
  | 'onStartAdornmentClick'
  | 'onEndAdornmentClick'
> & {
  value: string;
  onChange: (value: string) => void;
  onEnterKeyDown?: (value: string) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onChange, onSubmit, value, onEnterKeyDown, ...props },
  ref,
) {
  const isInert = props.disabled || props.readOnly;

  return (
    <Input
      ref={ref}
      {...props}
      type="text"
      startAdornment="search"
      endAdornment={value.length > 0 ? 'x' : undefined}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onEnterKeyDown={
        onEnterKeyDown
          ? (e) => {
              onEnterKeyDown(value);
            }
          : undefined
      }
      onEndAdornmentClick={
        !isInert
          ? () => {
              onChange('');
            }
          : undefined
      }
    />
  );
});
