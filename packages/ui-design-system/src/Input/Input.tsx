import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon, type IconName } from 'ui-icons';

import { type inputBorderColor } from './Input.constants';

export const input = cva(
  'bg-grey-100 text-s text-grey-00 placeholder:text-grey-80 disabled:bg-grey-95 peer block size-full rounded px-2 font-medium outline-none border focus:border-purple-65',
  {
    variants: {
      borderColor: {
        'greyfigma-90': 'border-grey-90',
        'redfigma-87': 'border-red-87',
        'redfigma-47': 'border-red-47',
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
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, startAdornment, endAdornment, borderColor = 'greyfigma-90', ...props },
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
            'pointer-events-none absolute flex items-center',
            'text-grey-50 peer-focus:text-grey-00',
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
            'text-grey-50 peer-focus:text-grey-00',
            'inset-y-0 end-0 pe-2',
          )}
        >
          <Icon icon={endAdornment} className="size-6" />
        </div>
      ) : null}
    </div>
  );
});
