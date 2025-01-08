import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon, type IconName } from 'ui-icons';

import { type inputBorderColor } from './Input.constants';
import { debounce } from 'radash';

export const input = cva(
  'bg-grey-00 text-s text-grey-100 placeholder:text-grey-25 disabled:bg-grey-05 peer block size-full rounded px-2 font-medium outline-none border focus:border-purple-100',
  {
    variants: {
      borderColor: {
        'grey-10': 'border-grey-10',
        'red-25': 'border-red-25',
        'red-100': 'border-red-100',
      },
    },
    defaultVariants: {
      borderColor: 'grey-10',
    },
  },
);

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  borderColor?: (typeof inputBorderColor)[number];
  startAdornment?: IconName;
  endAdornment?: IconName;
  debounceMs?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    startAdornment,
    endAdornment,
    borderColor = 'grey-10',
    onChange,
    debounceMs: debounced,
    ...props
  },
  ref,
) {
  if (debounced !== undefined && onChange !== undefined) {
    onChange = debounce({ delay: debounced }, onChange);
  }
  return (
    <div className={clsx('relative h-10', className)}>
      <input
        ref={ref}
        className={clsx(
          input({ borderColor }),
          startAdornment && 'ps-10',
          endAdornment && 'pe-10',
        )}
        onChange={(event) => {
          onChange?.(event);
        }}
        {...props}
      />
      {/* Order matter, for peer to work */}
      {startAdornment ? (
        <div
          className={clsx(
            'pointer-events-none absolute flex items-center',
            'text-grey-50 peer-focus:text-grey-100',
            'inset-y-0 start-0 ps-2',
          )}
        >
          <Icon icon={startAdornment} className="size-6" />
        </div>
      ) : null}
      {endAdornment ? (
        <div
          className={clsx(
            'pointer-events-none absolute flex items-center',
            'text-grey-50 peer-focus:text-grey-100',
            'inset-y-0 end-0 pe-2',
          )}
        >
          <Icon icon={endAdornment} className="size-6" />
        </div>
      ) : null}
    </div>
  );
});
