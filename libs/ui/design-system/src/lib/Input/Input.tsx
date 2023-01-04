import clsx from 'clsx';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
}

export function Input({
  className,
  startAdornment,
  endAdornment,
  ...props
}: InputProps) {
  return (
    <div className="relative h-10 w-full">
      <input
        className={clsx(
          'bg-grey-00 border-grey-10 text-text-s-medium text-grey-100 placeholder:text-grey-50 peer block h-full w-full rounded border px-2 outline-none focus:border-purple-100',
          startAdornment && 'pl-10',
          endAdornment && 'pr-10',
          className
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

export default Input;
