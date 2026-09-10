import { cva, VariantProps } from 'class-variance-authority';
import { KeyboardEvent, useEffect, useState } from 'react';
import { Icon, type IconName } from 'ui-icons';
import { cn } from '../utils';

export const inputClassName = cva(
  [
    'peer min-w-10 size-full rounded-md text-small font-medium outline-hidden border',
    // Light mode
    'bg-surface-card text-grey-primary placeholder:text-grey-placeholder data-placeholder-shown:text-grey-placeholder disabled:bg-grey-background disabled:text-grey-disabled is-[input]:read-only:bg-grey-background-light data-read-only:bg-grey-background-light focus:not-data-read-only:border-purple-primary focus:is-[input]:not-read-only:border-purple-primary',
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

const numberInputColorClassName = cva('', {
  variants: {
    color: {
      primary: 'text-grey-primary dark:text-grey-primary',
      purple: 'text-purple-primary dark:text-purple-primary',
      blue: 'text-blue-58 dark:text-blue-58',
      green: 'text-green-primary dark:text-green-primary',
      yellow: 'text-yellow-primary dark:text-yellow-primary',
      orange: 'text-orange-primary dark:text-orange-primary',
      red: 'text-red-primary dark:text-red-primary',
    },
  },
});

export type BaseInputProps = React.ComponentPropsWithoutRef<'input'> & {
  enablePasswordManagers?: boolean;
};

export const UnstyledInput = function UnstyledInput({
  ref,
  enablePasswordManagers,
  ...props
}: BaseInputProps & { ref?: React.Ref<HTMLInputElement> }) {
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
};

export type InputProps = Omit<BaseInputProps, 'size'> &
  VariantProps<typeof inputClassName> & {
    inputClassName?: string;
    startAdornment?: IconName;
    startAdornmentClassName?: string;
    startAdornmentAriaLabel?: string;
    endAdornment?: IconName;
    onEnterKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onStartAdornmentClick?: () => void;
    onEndAdornmentClick?: () => void;
  };

export const Input = function Input({
  ref,
  className,
  inputClassName: actualInputClassName,
  startAdornment,
  startAdornmentClassName,
  startAdornmentAriaLabel,
  endAdornment,
  size = 'large',
  borderColor = 'greyfigma-90',
  onEnterKeyDown,
  onStartAdornmentClick,
  onEndAdornmentClick,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const startIconClassName = cn(inputIconClassName({ inputSize: size, placement: 'start' }));
  const endIconClassName = cn(inputIconClassName({ inputSize: size, placement: 'end' }));

  return (
    <div className={cn('relative', className)}>
      <UnstyledInput
        ref={ref}
        className={cn(
          inputClassName({ borderColor, size }),
          inputPaddingsClassName({ hasStartIcon: !!startAdornment, hasEndIcon: !!endAdornment, size }),
          actualInputClassName,
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
            className={cn(startIconClassName, 'cursor-pointer', startAdornmentClassName)}
            aria-label={startAdornmentAriaLabel}
            onClick={onStartAdornmentClick}
          >
            <Icon icon={startAdornment} className="size-full" />
          </button>
        ) : (
          <span
            className={cn(
              'pointer-events-none flex items-center justify-center',
              startIconClassName,
              startAdornmentClassName,
            )}
            role={startAdornmentAriaLabel ? 'img' : undefined}
            aria-label={startAdornmentAriaLabel}
          >
            <Icon icon={startAdornment} className="size-full" />
          </span>
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
};

export type NumberInputColor = NonNullable<VariantProps<typeof numberInputColorClassName>['color']>;

export type NumberInputColorThreshold = {
  threshold: number;
  comparison: '>' | '>=' | '<' | '<=';
  color: NumberInputColor;
};

export type NumberInputColorByValue = {
  thresholds: readonly NumberInputColorThreshold[];
  defaultColor: NumberInputColor;
};

export type NumberInputProps = Omit<InputProps, 'onChange' | 'value' | 'onEnterKeyDown'> & {
  value: number;
  onChange: (value: number) => void;
  onEnterKeyDown?: (value: number) => void;
  /** Show a plus or minus icon for the value's sign. Typing `+` or `-` updates the icon. */
  forceSign?: boolean;
  /** Apply the color from the first matching threshold, or `defaultColor` when none match. */
  colorByValue?: NumberInputColorByValue;
};

type NumberInputSign = '+' | '-';

const numberInputSignIconClassName = cva(
  'top-1/2 -translate-y-1/2 rounded-sm bg-grey-background text-grey-primary dark:bg-grey-background-light',
  {
    variants: {
      size: {
        small: 'size-4',
        medium: 'size-5',
        large: 'size-6',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

const numberInputSignPaddingClassName = cva('', {
  variants: {
    size: {
      small: '',
      medium: 'ps-9',
      large: 'ps-10',
    },
  },
  defaultVariants: {
    size: 'large',
  },
});

function getNumberInputSign(value: number): NumberInputSign {
  return value < 0 ? '-' : '+';
}

function applyNumberInputSign(value: number, sign: NumberInputSign) {
  return sign === '-' ? -Math.abs(value) : Math.abs(value);
}

function formatNumberInputValue(value: number, forceSign: boolean) {
  const formattedValue = value.toString(10);
  return forceSign && formattedValue.startsWith('-') ? formattedValue.slice(1) : formattedValue;
}

function matchesNumberInputThreshold(value: number, { comparison, threshold }: NumberInputColorThreshold) {
  switch (comparison) {
    case '>':
      return value > threshold;
    case '>=':
      return value >= threshold;
    case '<':
      return value < threshold;
    case '<=':
      return value <= threshold;
  }
}

function getNumberInputColor(value: number, colorByValue: NumberInputColorByValue | undefined) {
  if (!colorByValue) return undefined;

  return (
    colorByValue.thresholds.find((colorThreshold) => matchesNumberInputThreshold(value, colorThreshold))?.color ??
    colorByValue.defaultColor
  );
}

export const NumberInput = function NumberInput({
  ref,
  colorByValue,
  forceSign = false,
  inputClassName,
  onChange,
  onKeyDown,
  value,
  onEnterKeyDown,
  size = 'large',
  startAdornment,
  startAdornmentAriaLabel,
  startAdornmentClassName,
  ...props
}: NumberInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [internalValue, setInternalValue] = useState(() => formatNumberInputValue(value, forceSign));
  const [sign, setSign] = useState<NumberInputSign>(() => getNumberInputSign(value));
  const valueColor = getNumberInputColor(value, colorByValue);

  useEffect(() => {
    const newInternalValue = formatNumberInputValue(value, forceSign);
    setInternalValue((currentValue) => (currentValue === newInternalValue ? currentValue : newInternalValue));
    setSign(getNumberInputSign(value));
  }, [forceSign, value]);

  return (
    <Input
      ref={ref}
      {...props}
      size={size}
      startAdornment={forceSign ? (sign === '-' ? 'minus' : 'plus') : startAdornment}
      startAdornmentAriaLabel={forceSign ? sign : startAdornmentAriaLabel}
      startAdornmentClassName={
        forceSign
          ? cn(numberInputSignIconClassName({ size }), numberInputColorClassName({ color: valueColor }))
          : startAdornmentClassName
      }
      inputClassName={cn(
        inputClassName,
        forceSign && numberInputSignPaddingClassName({ size }),
        numberInputColorClassName({ color: valueColor }),
      )}
      value={internalValue}
      onChange={(e) => {
        const inputValue = e.target.value;
        if (!forceSign) {
          setInternalValue(inputValue);
          const inputNumberValue = parseInt(inputValue, 10);
          if (!isNaN(inputNumberValue)) {
            onChange(inputNumberValue);
          }
          return;
        }

        const nextSign: NumberInputSign = inputValue.includes('-') ? '-' : inputValue.includes('+') ? '+' : sign;
        const unsignedValue = inputValue.replaceAll('+', '').replaceAll('-', '');
        setSign(nextSign);
        setInternalValue(unsignedValue);

        const inputNumberValue = parseInt(unsignedValue, 10);
        if (!isNaN(inputNumberValue)) {
          onChange(applyNumberInputSign(inputNumberValue, nextSign));
        }
      }}
      onKeyDown={(e) => {
        if (forceSign && (e.key === '+' || e.key === '-')) {
          e.preventDefault();
          const nextSign: NumberInputSign = e.key === '-' ? '-' : '+';
          setSign(nextSign);
          const inputNumberValue = parseInt(internalValue, 10);
          if (!isNaN(inputNumberValue)) {
            onChange(applyNumberInputSign(inputNumberValue, nextSign));
          }
        }
        onKeyDown?.(e);
      }}
      onEnterKeyDown={
        onEnterKeyDown
          ? (e) => {
              const inputNumberValue = parseInt(internalValue, 10);
              if (!isNaN(inputNumberValue)) {
                onEnterKeyDown(forceSign ? applyNumberInputSign(inputNumberValue, sign) : inputNumberValue);
              }
            }
          : undefined
      }
    />
  );
};

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

export const SearchInput = function SearchInput({
  ref,
  onChange,
  onSubmit,
  value,
  onEnterKeyDown,
  ...props
}: SearchInputProps & { ref?: React.Ref<HTMLInputElement> }) {
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
};
