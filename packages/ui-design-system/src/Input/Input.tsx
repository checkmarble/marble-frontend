import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';
import { Icon, type IconName } from 'ui-icons';
import { cn } from '../utils';
import { type inputBorderColor } from './Input.constants';

export const input = cva(
  [
    'bg-surface-card text-grey-primary placeholder:text-grey-disabled disabled:bg-grey-background disabled:text-grey-disabled read-only:bg-grey-background-light peer block size-full rounded-sm px-2 font-medium outline-hidden border focus:not-read-only:border-purple-primary',
    // Dark mode
    'dark:bg-transparent dark:text-grey-primary dark:placeholder:text-grey-secondary dark:disabled:bg-transparent dark:focus:not-read-only:border-purple-primary',
  ],
  {
    variants: {
      borderColor: {
        'greyfigma-90': 'border-grey-border dark:border-grey-border',
        'redfigma-87': 'border-red-secondary',
        'redfigma-47': 'border-red-primary',
      },
    },
    defaultVariants: {
      borderColor: 'greyfigma-90',
    },
  },
);

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  borderColor?: (typeof inputBorderColor)[number];
  startAdornment?: IconName;
  endAdornment?: IconName;
  adornmentClassName?: string;
  onAdornmentClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    startAdornment,
    endAdornment,
    borderColor = 'greyfigma-90',
    adornmentClassName,
    onAdornmentClick,
    ...props
  },
  ref,
) {
  return (
    <div className={clsx('relative h-10', className)}>
      <input
        ref={ref}
        className={clsx(input({ borderColor }), startAdornment && 'ps-10', endAdornment && 'pe-10')}
        {...props}
      />
      {/* Order matter, for peer to work */}
      {startAdornment ? (
        <div
          className={clsx(
            'absolute flex items-center',
            'text-grey-secondary peer-focus:text-grey-primary dark:text-grey-secondary dark:peer-focus:text-grey-primary',
            'inset-y-0 start-0 ps-2',
            { 'cursor-pointer': onAdornmentClick, 'pointer-events-none': !onAdornmentClick },
          )}
          onClick={onAdornmentClick}
        >
          <Icon icon={startAdornment} className={cn('size-6', adornmentClassName)} />
        </div>
      ) : null}
      {endAdornment ? (
        <div
          className={clsx(
            'absolute flex items-center',
            'text-grey-secondary peer-focus:text-grey-primary dark:text-grey-secondary dark:peer-focus:text-grey-primary',
            'inset-y-0 end-0 pe-2',
            { 'cursor-pointer': onAdornmentClick, 'pointer-events-none': !onAdornmentClick },
          )}
          onClick={onAdornmentClick}
        >
          <Icon icon={endAdornment} className={cn('size-6', adornmentClassName)} />
        </div>
      ) : null}
    </div>
  );
});

type NumberInputProps = Omit<InputProps, 'onChange' | 'value'> & {
  value: number;
  onChange: (value: number) => void;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { onChange, value, ...props },
  ref,
) {
  const [internalValue, setInternalValue] = useState(value.toString(10));

  useEffect(() => {
    let newIntervalValue = value.toString(10);
    if (newIntervalValue !== internalValue) {
      setInternalValue(newIntervalValue);
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
    />
  );
});
