import clsx from 'clsx';

export function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={clsx(
        'border-grey-80 bg-grey-95 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-b-2',
        className,
      )}
      {...props}
    />
  );
}
