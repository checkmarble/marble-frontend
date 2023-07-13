import clsx from 'clsx';
import { forwardRef } from 'react';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div className={clsx('relative h-10', className)}>
        <input
          ref={ref}
          className={clsx(
            'bg-grey-00 border-grey-10 text-s text-grey-100 placeholder:text-grey-50 disabled:bg-grey-05 peer block h-full w-full rounded border px-2 font-medium outline-none focus:border-purple-100',
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
