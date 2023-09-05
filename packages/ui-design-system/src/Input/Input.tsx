import clsx from 'clsx';
import { forwardRef } from 'react';

import { type inputBorderColor } from './Input.constants';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  borderColor?: (typeof inputBorderColor)[number];
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, startAdornment, endAdornment, borderColor = 'grey', ...props },
    ref
  ) => {
    return (
      <div className={clsx('relative h-10', className)}>
        <input
          ref={ref}
          className={clsx(
            'bg-grey-00 text-s text-grey-100 placeholder:text-grey-50 disabled:bg-grey-05 peer block h-full w-full rounded px-2 font-medium outline-none',
            // Border classes
            'border focus:border-purple-100',
            {
              'border-grey-10': borderColor === 'grey',
              'border-red-100': borderColor === 'red',
              'border-green-100': borderColor === 'green',
            },
            startAdornment && 'pl-10',
            endAdornment && 'pr-10'
          )}
          {...props}
        />
        {/* Order matter, for peer to work */}
        {startAdornment && (
          <div
            className={clsx(
              'pointer-events-none absolute flex items-center',
              'text-grey-50 peer-focus:text-grey-100 text-[24px]',
              'inset-y-0 left-0 pl-2'
            )}
          >
            {startAdornment}
          </div>
        )}
        {endAdornment && (
          <div
            className={clsx(
              'pointer-events-none absolute flex items-center',
              'text-grey-50 peer-focus:text-grey-100 text-[24px]',
              'inset-y-0 right-0 pr-2'
            )}
          >
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

export default Input;
