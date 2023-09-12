import clsx from 'clsx';
import { forwardRef } from 'react';

export const OperandViewer = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      'flex h-10 min-w-[40px] items-center justify-between px-2 outline-none',
      'bg-grey-00 disabled:bg-grey-05 radix-state-open:bg-purple-05',
      'border-grey-10 radix-state-open:border-purple-100 disabled:border-grey-10 rounded border focus:border-purple-100'
    )}
    {...props}
  />
));
OperandViewer.displayName = 'OperandViewer';
